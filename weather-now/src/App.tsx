import { useState } from "react";
import "./App.css";

interface Weather {
  city: string;
  temperature: number;
  windspeed: number;
  condition: string;
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);

  const fetchWeather = async () => {
    if (!city) return;
  
    try {
      // 1. Get coordinates from Open-Meteo geocoding
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en`
      );
      const geoData = await geoRes.json();
  
      if (!geoData.results || geoData.results.length === 0) {
        alert("City not found");
        return;
      }
  
      // ✅ filter only Indian locations
      const indianCity = geoData.results.find(
        (loc: any) => loc.country === "India"
      );
  
      if (!indianCity) {
        alert("City not found in India");
        return;
      }
  
      const { latitude, longitude, name } = indianCity;
  
      // 2. Get weather data
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}¤t_weather=true`
      );
      const weatherData = await weatherRes.json();
  
      // 3. Map weather code → condition
      const code = weatherData.current_weather.weathercode;
      let condition = "Clear sky";
      if ([1, 2].includes(code)) condition = "Partly cloudy";
      else if ([3].includes(code)) condition = "Cloudy";
      else if ([61, 63, 65].includes(code)) condition = "Rainy";
  
      // 4. Detect night
      const hour = new Date().getHours();
      if (hour >= 19 || hour < 6) {
        condition = "Night";
      }
  
      setWeather({
        city: name,
        temperature: weatherData.current_weather.temperature,
        windspeed: weatherData.current_weather.windspeed,
        condition,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch weather");
    }
  };
  
  // pick bg class
  const bgClass =
    weather?.condition.toLowerCase().replace(" ", "-") || "clear-sky";

  return (
    <div className={`app-container ${bgClass}`}>
      <h1 className="title">🌤 Weather Now (India)</h1>

      <div className="search-box">
        <input
          type="text"
          value={city}
          placeholder="Enter Indian city..."
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Search</button>
      </div>

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>
          <p>🌡 Temperature: {weather.temperature}°C</p>
          <p>💨 Wind Speed: {weather.windspeed} m/s</p>
          <p>🌎 Condition: {weather.condition}</p>
        </div>
      )}
    </div>
  );
}

export default App;
