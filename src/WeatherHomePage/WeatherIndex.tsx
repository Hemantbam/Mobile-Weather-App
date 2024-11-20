import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [history, setHistory] = useState([]);
  
  const apiKey = '76fd059743b5603ee3796ba13d3b53a3';
  
  const weatherGifs = {
    Clear: require('./Images/sun.gif'),
    Rain: require('./Images/rain.gif'),
    Clouds: require('./Images/clouds.gif'),
    Thunderstorm: require('./Images/storm.gif'),
    Snow: require('./Images/snow.gif'),
    Default: require('./Images/sun.gif'),
  };

  const fetchWeather = async (cityName) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );
      setWeatherData(response.data);
      saveHistory(cityName);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch weather data. Please check the city name.');
    }
  };

  const saveHistory = async (newCity) => {
    try {
      let currentHistory = await AsyncStorage.getItem('searchHistory');
      currentHistory = currentHistory ? JSON.parse(currentHistory) : [];

      currentHistory = [newCity, ...currentHistory.filter(city => city !== newCity)].slice(0, 3); // Limit to 3 cities

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

  const getWeatherGif = (condition) => {
    return weatherGifs[condition] || weatherGifs.Default;
  };

  const handleHistoryClick = (cityName) => {
    fetchWeather(cityName);
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.description}>
            {weatherData.weather[0].description}
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
    backgroundColor: '#e8f4f8',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyText: {
    fontSize: 16,
    color: '#007ACC',
  },
});

export default WeatherApp;
