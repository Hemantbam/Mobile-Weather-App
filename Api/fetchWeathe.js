import axios from 'axios';

const apiKey = '76fd059743b5603ee3796ba13d3b53a3';

const weatherGifs = {
  Clear: require('../src/WeatherHomePage/Images/sun.gif'),
  Rain: require('../src/WeatherHomePage/Images/rain.gif'),
  Clouds: require('../src/WeatherHomePage/Images/clouds.gif'),
  Thunderstorm: require('../src/WeatherHomePage/Images/storm.gif'),
  Snow: require('../src/WeatherHomePage/Images/snow.gif'),
  Default: require('../src/WeatherHomePage/Images/sun.gif'),
};

// Fetch weather data
export const fetchWeatherData = async (cityName) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
    );
    return response.data;
  } catch (error) {
    throw new Error('Could not fetch weather data. Please check the city name.');
  }
};

// Get weather GIF based on weather condition
export const getWeatherGif = (condition) => {
  return weatherGifs[condition] || weatherGifs.Default;
};

// Fetch AQI data based on city coordinates
export const fetchAQIData = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
    );
    return response.data;
  } catch (error) {
    throw new Error('Could not fetch AQI data.');
  }
};
