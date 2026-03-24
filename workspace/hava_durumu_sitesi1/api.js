const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0';

import { API_KEY, DEFAULT_UNITS, DEFAULT_LANG } from './config.js';

export async function getCurrentWeather(city) {
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${DEFAULT_UNITS}&lang=${DEFAULT_LANG}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Hava durumu alınamadı');
  }
  return response.json();
}

export async function getCurrentWeatherByCoords(lat, lon) {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${DEFAULT_UNITS}&lang=${DEFAULT_LANG}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Hava durumu alınamadı');
  }
  return response.json();
}

export async function getForecast(city) {
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${DEFAULT_UNITS}&lang=${DEFAULT_LANG}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Tahmin verisi alınamadı');
  }
  return response.json();
}

export async function getForecastByCoords(lat, lon) {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${DEFAULT_UNITS}&lang=${DEFAULT_LANG}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Tahmin verisi alınamadı');
  }
  return response.json();
}

export async function getOneCallData(lat, lon) {
  const url = `${ONECALL_URL}/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${DEFAULT_UNITS}&lang=${DEFAULT_LANG}&exclude=minutely,alerts`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Detaylı hava verisi alınamadı');
  }
  return response.json();
}

export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function formatTemperature(temp, units = DEFAULT_UNITS) {
  const rounded = Math.round(temp);
  if (units === 'metric') return `${rounded}°C`;
  if (units === 'imperial') return `${rounded}°F`;
  return `${rounded}K`;
}