import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAQIData, fetchWeatherData, getWeatherGif } from '../../Api/fetchWeathe';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchWeather = async (cityName) => {
    try {
      const data = await fetchWeatherData(cityName);
      setWeatherData(data);
      const aqiResponse=await fetchAQIData(data.coord.lat,data.coord.lon)
     
      const aqi = aqiResponse.list[0].main.aqi;
      setAqi(aqi); 
      
      saveHistory(cityName);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch weather data. Please check the city name.');
    }
  };

  const saveHistory = async (newCity) => {
    try {
      let currentHistory = await AsyncStorage.getItem('searchHistory');
      currentHistory = currentHistory ? JSON.parse(currentHistory) : [];
      currentHistory = [newCity, ...currentHistory.filter(city => city !== newCity)].slice(0, 3);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(currentHistory));
      setHistory(currentHistory);
    } catch (error) {
      console.error("Error saving history", error);
    }
  };

  useEffect(() => {
    fetchWeather('Kathmandu');

    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem('searchHistory');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error("Error loading history", error);
      }
    };

    loadHistory();
  }, []);

  const handleHistoryClick = (cityName) => {
    fetchWeather(cityName);
  };

  const getBackgroundColor = (weather) => {
    switch (weather) {
      case 'Clear':
        return '#FFD700'; 
      case 'Rain':
        return '#0077B6'; 
      case 'Snow':
        return '#00B4D8'; 
      case 'Clouds':
        return '#90E0EF'; 
        case 'Mist':
          return '#D3D3D3'; 
      default:
        return '#90E0EF'; 
    }
  };

  const getAqiColor = (aqi) => {
    switch (aqi) {
      case 1: return '#00E400'; 
      case 2: return '#FFFF00'; 
      case 3: return '#FF7E00'; 
      case 4: return '#FF0000'; 
      case 5: return '#8B0000'; 
      default: return '#FF4500'; 
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: weatherData ? getBackgroundColor(weatherData.weather[0].main) : '#90e0ef' }]}>
      <Text style={styles.title}>Weather App</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={city}
        onChangeText={(text) => setCity(text)}
      />
      <Button title="Get Weather" onPress={() => fetchWeather(city)} />

      {weatherData && (
        <View style={styles.weatherContainer}>
          <Image
            source={getWeatherGif(weatherData.weather[0].main)}
            style={styles.weatherGif}
          />
          <Text style={styles.cityName}>{weatherData.name}</Text>
          <Text style={styles.temperature}>{weatherData.main.temp}°C</Text>
          <Text style={styles.description}>{weatherData.weather[0].description}</Text>
        </View>
      )}

      {aqi !== null && (
        <View style={[styles.aqiContainer, { backgroundColor: getAqiColor(aqi) }]}>
        <Text style={[styles.aqiText, aqi === 2 && { color: '#333' }]}>
          Air Quality Index (AQI): {aqi}
        </Text>
        <Text style={[styles.aqiDescription, aqi !== 2 && { color: '#edf6f9' }]}>
          {aqi === 1 ? 'Good' : aqi === 2 ? 'Moderate' : aqi === 3 ? 'Unhealthy for Sensitive Groups' : aqi === 4 ? 'Unhealthy' : 'Very Unhealthy'}
        </Text>
      </View>
      )}

      <Text style={styles.historyTitle}>Search History</Text>
      <FlatList
        data={history}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleHistoryClick(item)}>
            <View style={styles.historyItem}>
              <Text style={styles.historyText}>{item}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#007ACC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#fff',
  },
  weatherContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  weatherGif: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  temperature: {
    fontSize: 20,
    marginVertical: 5,
    color: '#007ACC',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textTransform: 'capitalize',
  },
  aqiContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  aqiText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  aqiDescription: {
    fontSize: 16,
    color: '#403d39',
    fontWeight:700,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#333',
  },
  historyItem: {

    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  historyText: {
    fontSize: 16,
    color: '#007ACC',
  },
});

export default WeatherApp;
