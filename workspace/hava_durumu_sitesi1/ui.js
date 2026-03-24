// ui.js - UI Güncelleme Fonksiyonları

const WeatherIcons = {
  // Gök gürültülü fırtına
  200: { icon: '⛈️', bg: 'thunderstorm', label: 'Gök Gürültülü Fırtına' },
  201: { icon: '⛈️', bg: 'thunderstorm', label: 'Yağmurlu Fırtına' },
  202: { icon: '⛈️', bg: 'thunderstorm', label: 'Şiddetli Fırtına' },
  210: { icon: '🌩️', bg: 'thunderstorm', label: 'Hafif Fırtına' },
  211: { icon: '🌩️', bg: 'thunderstorm', label: 'Fırtına' },
  212: { icon: '🌩️', bg: 'thunderstorm', label: 'Şiddetli Fırtına' },
  221: { icon: '🌩️', bg: 'thunderstorm', label: 'Düzensiz Fırtına' },
  230: { icon: '⛈️', bg: 'thunderstorm', label: 'Çiseli Fırtına' },
  231: { icon: '⛈️', bg: 'thunderstorm', label: 'Çiseli Fırtına' },
  232: { icon: '⛈️', bg: 'thunderstorm', label: 'Şiddetli Çiseli Fırtına' },

  // Çisenti
  300: { icon: '🌦️', bg: 'drizzle', label: 'Hafif Çisenti' },
  301: { icon: '🌦️', bg: 'drizzle', label: 'Çisenti' },
  302: { icon: '🌦️', bg: 'drizzle', label: 'Yoğun Çisenti' },
  310: { icon: '🌦️', bg: 'drizzle', label: 'Hafif Çisenti Yağmuru' },
  311: { icon: '🌦️', bg: 'drizzle', label: 'Çisenti Yağmuru' },
  312: { icon: '🌦️', bg: 'drizzle', label: 'Yoğun Çisenti Yağmuru' },
  313: { icon: '🌦️', bg: 'drizzle', label: 'Sağanak ve Çisenti' },
  314: { icon: '🌦️', bg: 'drizzle', label: 'Yoğun Sağanak ve Çisenti' },
  321: { icon: '🌦️', bg: 'drizzle', label: 'Çisenti Sağanağı' },

  // Yağmur
  500: { icon: '🌧️', bg: 'rain', label: 'Hafif Yağmur' },
  501: { icon: '🌧️', bg: 'rain', label: 'Orta Yağmur' },
  502: { icon: '🌧️', bg: 'rain', label: 'Şiddetli Yağmur' },
  503: { icon: '🌧️', bg: 'rain', label: 'Çok Şiddetli Yağmur' },
  504: { icon: '🌧️', bg: 'rain', label: 'Aşırı Yağmur' },
  511: { icon: '🌨️', bg: 'rain', label: 'Dondurucu Yağmur' },
  520: { icon: '🌧️', bg: 'rain', label: 'Hafif Sağanak' },
  521: { icon: '🌧️', bg: 'rain', label: 'Sağanak' },
  522: { icon: '🌧️', bg: 'rain', label: 'Yoğun Sağanak' },
  531: { icon: '🌧️', bg: 'rain', label: 'Düzensiz Sağanak' },

  // Kar
  600: { icon: '❄️', bg: 'snow', label: 'Hafif Kar' },
  601: { icon: '❄️', bg: 'snow', label: 'Kar' },
  602: { icon: '❄️', bg: 'snow', label: 'Yoğun Kar' },
  611: { icon: '🌨️', bg: 'snow', label: 'Karla Karışık Yağmur' },
  612: { icon: '🌨️', bg: 'snow', label: 'Hafif Karla Karışık Yağmur' },
  613: { icon: '🌨️', bg: 'snow', label: 'Yoğun Karla Karışık Yağmur' },
  615: { icon: '🌨️', bg: 'snow', label: 'Hafif Yağmur ve Kar' },
  616: { icon: '🌨️', bg: 'snow', label: 'Yağmur ve Kar' },
  620: { icon: '❄️', bg: 'snow', label: 'Hafif Kar Sağanağı' },
  621: { icon: '❄️', bg: 'snow', label: 'Kar Sağanağı' },
  622: { icon: '❄️', bg: 'snow', label: 'Yoğun Kar Sağanağı' },

  // Atmosfer
  701: { icon: '🌫️', bg: 'mist', label: 'Sis Buharı' },
  711: { icon: '🌫️', bg: 'mist', label: 'Duman' },
  721: { icon: '🌫️', bg: 'mist', label: 'Puslu' },
  731: { icon: '🌫️', bg: 'mist', label: 'Kum/Toz Girdabı' },
  741: { icon: '🌫️', bg: 'mist', label: 'Sis' },
  751: { icon: '🌫️', bg: 'mist', label: 'Kum' },
  761: { icon: '🌫️', bg: 'mist', label: 'Toz' },
  762: { icon: '🌋', bg: 'mist', label: 'Volkanik Kül' },
  771: { icon: '💨', bg: 'mist', label: 'Sert Rüzgar' },
  781: { icon: '🌪️', bg: 'mist', label: 'Hortum' },

  // Açık
  800: { icon: '☀️', bg: 'clear-day', label: 'Açık' },

  // Bulutlu
  801: { icon: '🌤️', bg: 'clouds', label: 'Az Bulutlu' },
  802: { icon: '⛅', bg: 'clouds', label: 'Parçalı Bulutlu' },
  803: { icon: '🌥️', bg: 'clouds', label: 'Çok Bulutlu' },
  804: { icon: '☁️', bg: 'clouds', label: 'Kapalı' }
};

const BG_CLASSES = [
  'bg-thunderstorm',
  'bg-drizzle',
  'bg-rain',
  'bg-snow',
  'bg-mist',
  'bg-clear-day',
  'bg-clear-night',
  'bg-clouds'
];

function getWeatherMeta(weatherId, isNight = false) {
  const meta = WeatherIcons[weatherId];
  if (!meta) return { icon: '🌡️', bg: 'clear-day', label: 'Bilinmiyor' };

  let bg = meta.bg;
  let icon = meta.icon;

  if (weatherId === 800 && isNight) {
    bg = 'clear-night';
    icon = '🌙';
  }

  return { icon, bg, label: meta.label };
}

function isNightTime(sunrise, sunset) {
  const now = Math.floor(Date.now() / 1000);
  return now < sunrise || now > sunset;
}

function applyBackground(bgKey) {
  const body = document.body;
  BG_CLASSES.forEach(cls => body.classList.remove(cls));
  body.classList.add(`bg-${bgKey}`);
}

function formatDate(timestamp, timezoneOffset = 0) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  };
  return date.toLocaleDateString('tr-TR', options);
}

function formatTime(timestamp, timezoneOffset = 0) {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

function formatForecastDay(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('tr