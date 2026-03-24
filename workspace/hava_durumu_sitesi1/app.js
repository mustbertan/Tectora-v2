import { getWeatherByCity, getWeatherByCoords, getForecast } from './api.js';
import { displayCurrentWeather, displayForecast, showError, showLoading, hideLoading } from './ui.js';
import { DEFAULT_CITY } from './config.js';

async function fetchWeatherByCity(city) {
  try {
    showLoading();
    const weatherData = await getWeatherByCity(city);
    displayCurrentWeather(weatherData);
    const forecastData = await getForecast(weatherData.coord.lat, weatherData.coord.lon);
    displayForecast(forecastData);
  } catch (error) {
    showError(error.message || 'Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.');
  } finally {
    hideLoading();
  }
}

async function fetchWeatherByLocation(lat, lon) {
  try {
    showLoading();
    const weatherData = await getWeatherByCoords(lat, lon);
    displayCurrentWeather(weatherData);
    const forecastData = await getForecast(lat, lon);
    displayForecast(forecastData);
  } catch (error) {
    showError(error.message || 'Konum bilgisi alınamadı.');
  } finally {
    hideLoading();
  }
}

function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const city = searchInput.value.trim();
  if (city) {
    fetchWeatherByCity(city);
  } else {
    showError('Lütfen bir şehir adı girin.');
  }
}

function handleLocationRequest() {
  if (!navigator.geolocation) {
    showError('Tarayıcınız konum özelliğini desteklemiyor.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeatherByLocation(position.coords.latitude, position.coords.longitude);
    },
    () => {
      showError('Konum erişimi reddedildi. Şehir adı ile arama yapabilirsiniz.');
    }
  );
}

function initEventListeners() {
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  const locationButton = document.getElementById('location-button');

  if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }

  if (locationButton) {
    locationButton.addEventListener('click', handleLocationRequest);
  }
}

function init() {
  initEventListeners();
  fetchWeatherByCity(DEFAULT_CITY);
}

document.addEventListener('DOMContentLoaded', init);