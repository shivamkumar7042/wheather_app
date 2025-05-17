// Your OpenWeatherMap API key
const apiKey = '3ae77b983d453e6d447bafa6251cc477';

// Getting references to DOM elements
const weatherResult = document.getElementById('weatherResult');
const forecast = document.getElementById('forecast');
const error = document.getElementById('error');
const cityInput = document.getElementById('cityInput');
const recentCities = document.getElementById('recentCities');

// Event listener for the Search button
document.getElementById('searchBtn').addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) return showError('Please enter a city name');
  fetchWeatherByCity(city);
});

// Event listener for the Use Location button
document.getElementById('currentLocationBtn').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => showError('Unable to get your location')
  );
});

// Event listener for selecting a recent city
recentCities.addEventListener('change', () => {
  if (recentCities.value) fetchWeatherByCity(recentCities.value);
});

// Fetch weather data by city name
function fetchWeatherByCity(city) {
  error.textContent = '';
  updateRecentCities(city);
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) return showError(data.message);
      displayWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
    })
    .catch(() => showError('Failed to fetch data'));
}

// Fetch weather data using latitude and longitude
function fetchWeatherByCoords(lat, lon) {
  error.textContent = '';
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      displayWeather(data);
      fetchForecast(lat, lon);
      updateRecentCities(data.name);
    })
    .catch(() => showError('Failed to fetch data'));
}

// Fetch 5-day forecast data
function fetchForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      // Filter forecast for every 8th item (every 24 hours)
      const daily = data.list.filter((item, idx) => idx % 8 === 0);
      forecast.innerHTML = daily.map(day => `
        <div class="bg-blue-100 rounded-xl p-4 text-center">
          <p class="font-semibold">${new Date(day.dt_txt).toDateString()}</p>
          <img class="mx-auto" src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" />
          <p>${day.weather[0].description}</p>
          <p>Temp: ${day.main.temp}°C</p>
          <p>Humidity: ${day.main.humidity}%</p>
          <p>Wind: ${day.wind.speed} m/s</p>
        </div>
      `).join('');
    })
    .catch(() => showError('Failed to load forecast'));
}

// Display current weather data
function displayWeather(data) {
  weatherResult.innerHTML = `
    <h2 class="text-xl font-semibold">${data.name}</h2>
    <img class="mx-auto" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"/>
    <p>${data.weather[0].description}</p>
    <p>Temperature: ${data.main.temp}°C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

// Show error messages
function showError(message) {
  error.textContent = message;
  weatherResult.innerHTML = '';
  forecast.innerHTML = '';
}

// Store recent city searches in localStorage
function updateRecentCities(city) {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!cities.includes(city)) {
    cities.unshift(city); // Add to beginning
    if (cities.length > 5) cities.pop(); // Keep max 5 cities
    localStorage.setItem('recentCities', JSON.stringify(cities));
  }
  renderRecentCities();
}

// Render recent cities dropdown
function renderRecentCities() {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  recentCities.innerHTML = `<option value="">-- Select Recent City --</option>`;
  cities.forEach(city => {
    recentCities.innerHTML += `<option value="${city}">${city}</option>`;
  });
  recentCities.classList.toggle('hidden', cities.length === 0);
}

// Initialize the recent cities on load
renderRecentCities();
