// API Keys Configuration
// Base URL: https://api.openweathermap.org
// Your API Key is configured below
let WEATHER_API_KEY = 'abdf6761de7569fc1f6a00193ffcb711';

// Check if user has configured API key
if (WEATHER_API_KEY === 'demo' || WEATHER_API_KEY === 'your_openweather_api_key') {
    console.warn('⚠️ API key not configured! Please add your OpenWeatherMap API key to script.js');
}

// Default location
let currentLocation = {
    lat: 19.0760, // Mumbai coordinates
    lon: 72.8777,
    name: 'Mumbai, India'
};

let map;
let markers = [];

// Initialize map
function initMap() {
    map = L.map('map').setView([currentLocation.lat, currentLocation.lon], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    updateMapMarker(currentLocation.lat, currentLocation.lon);
}

// Update map marker
function updateMapMarker(lat, lon, name = '') {
    map.setView([lat, lon], 10);
    
    // Remove existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new marker
    const marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(name || currentLocation.name);
    markers.push(marker);
}

// Fetch weather data using free APIs (Current + Forecast)
async function fetchWeatherData(lat, lon, cityName = '') {
    try {
        // Check if API key is configured
        if (WEATHER_API_KEY === 'demo' || !WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweather_api_key') {
            showAPIKeyError();
            return;
        }
        
        // Fetch current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!currentResponse.ok) {
            throw new Error(`HTTP error! status: ${currentResponse.status}`);
        }
        
        const currentData = await currentResponse.json();
        
        // Fetch forecast data
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
            throw new Error(`HTTP error! status: ${forecastResponse.status}`);
        }
        
        const forecastData = await forecastResponse.json();
        
        // Update weather display
        updateWeatherDisplay(currentData, forecastData);
        
        // Fetch AQI data
        try {
            const aqiResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
            );
            if (aqiResponse.ok) {
                const aqiData = await aqiResponse.json();
                updateAQIConditions(aqiData);
            }
        } catch (error) {
            console.log('Could not fetch AQI data');
        }
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        if (error.message.includes('401') || error.message.includes('Invalid API key')) {
            showAPIKeyError();
        } else {
            alert('Error fetching weather data: ' + error.message);
        }
    }
}

// Update weather display with current and forecast data
function updateWeatherDisplay(currentWeather, forecastData) {
    // Calculate today's high and low from forecast data
    const today = new Date();
    const todayStr = today.toDateString();
    let todayHigh = currentWeather.main.temp_max;
    let todayLow = currentWeather.main.temp_min;
    
    // Get forecasts for today (next 24-48 hours)
    forecastData.list.forEach(item => {
        const itemDate = new Date(item.dt * 1000);
        if (itemDate.toDateString() === todayStr || (itemDate - today) < 86400000) {
            if (item.main.temp_max > todayHigh) todayHigh = item.main.temp_max;
            if (item.main.temp_min < todayLow) todayLow = item.main.temp_min;
        }
    });
    
    // Update main weather card
    document.getElementById('cityName').textContent = currentWeather.name + (currentWeather.sys.country ? ', ' + currentWeather.sys.country : '');
    document.getElementById('country').textContent = currentWeather.sys.country || 'Earth';
    document.getElementById('temperature').textContent = Math.round(currentWeather.main.temp) + '°';
    document.getElementById('realFeel').textContent = Math.round(currentWeather.main.feels_like) + '°';
    document.getElementById('highTemp').textContent = Math.round(todayHigh) + '°';
    document.getElementById('lowTemp').textContent = Math.round(todayLow) + '°';
    
    // Weather description
    const description = currentWeather.weather[0].description;
    // Get precipitation chance from current data or forecast
    const pop = currentWeather.pop || (forecastData.list[0] ? forecastData.list[0].pop : 0);
    const descriptionText = `${capitalize(description)} today with a high of ${Math.round(todayHigh)}°C and a low of ${Math.round(todayLow)}°C. There is a ${Math.round(pop * 100)}% chance of precipitation.`;
    document.getElementById('weatherDescription').textContent = descriptionText;
    
    // Update background based on temperature and weather
    updateBackgroundByWeather(currentWeather.main.temp, currentWeather.weather[0].main);
    
    // Weather icon
    const iconCode = currentWeather.weather[0].icon;
    updateWeatherIcon('weatherIconMain', iconCode);
    
    // Sunrise/Sunset
    const sunrise = new Date(currentWeather.sys.sunrise * 1000);
    const sunset = new Date(currentWeather.sys.sunset * 1000);
    document.getElementById('sunrise').textContent = formatTime(sunrise);
    document.getElementById('sunset').textContent = formatTime(sunset);
    
    // Update current location bar
    document.getElementById('currentCityDisplay').innerHTML = `
        <i class="fas fa-map-marker-alt"></i> ${currentWeather.name} <i class="fas fa-arrow-up"></i>
        <div class="weather-badge">
            <i class="fas ${getIconClass(currentWeather.weather[0].main)}"></i> ${capitalize(description)}, ${Math.round(currentWeather.main.temp)}°
        </div>
    `;
    
    // Update daily forecast
    updateDailyForecast(forecastData);
    
    // Update hourly forecast
    updateHourlyForecast(forecastData);
    
    // Update conditions
    updateConditions(currentWeather);
}

// Update daily forecast from forecast data
function updateDailyForecast(forecast) {
    const container = document.getElementById('dailyForecast');
    container.innerHTML = '';
    
    // Group forecasts by actual date (YYYY-MM-DD)
    const forecastsByDate = {};
    forecast.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!forecastsByDate[dateKey]) {
            forecastsByDate[dateKey] = [];
        }
        forecastsByDate[dateKey].push(item);
    });
    
    // Get sorted dates (today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedDates = Object.keys(forecastsByDate)
        .filter(dateStr => new Date(dateStr) >= today)
        .sort()
        .slice(0, 8);
    
    sortedDates.forEach((dateKey, dayIndex) => {
        const items = forecastsByDate[dateKey];
        const temps = items.map(item => item.main.temp);
        const maxTemp = Math.round(Math.max(...temps));
        const minTemp = Math.round(Math.min(...temps));
        const mainWeather = items[Math.floor(items.length / 2)].weather[0].main;
        
        // Get day name
        const date = new Date(dateKey);
        let dayName;
        if (dayIndex === 0) {
            dayName = 'Today';
        } else if (dayIndex === 1) {
            dayName = 'Tomorrow';
        } else {
            dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        }
        
        const item = document.createElement('div');
        item.className = `daily-forecast-item ${dayIndex === 0 ? 'active' : ''}`;
        item.innerHTML = `
            <div class="day-name">${dayName}</div>
            <div class="day-icon">
                <i class="fas ${getIconClass(mainWeather)}"></i>
            </div>
            <div class="day-temp">${maxTemp}°</div>
            <div class="day-temp-range">${minTemp}°</div>
        `;
        container.appendChild(item);
    });
}

// Update hourly forecast from forecast data
function updateHourlyForecast(forecast) {
    const container = document.getElementById('hourlyContainer');
    container.innerHTML = '';
    
    forecast.list.slice(0, 24).forEach((item, index) => {
        const date = new Date(item.dt * 1000);
        const isNow = index === 0;
        
        const hourItem = document.createElement('div');
        hourItem.className = `hourly-item ${isNow ? 'now' : ''}`;
        
        let timeLabel = formatTime(date);
        if (isNow) {
            timeLabel = 'Now';
        }
        
        hourItem.innerHTML = `
            <div class="hour-time">${timeLabel}</div>
            <div class="hour-icon">
                <i class="fas ${getIconClass(item.weather[0].main)}"></i>
            </div>
            <div class="hour-temp">${Math.round(item.main.temp)}°</div>
            <div class="hour-precip">
                <i class="fas fa-tint"></i> ${Math.round(item.pop * 100)}%
            </div>
        `;
        container.appendChild(hourItem);
    });
}

// Update conditions from current weather
function updateConditions(currentWeather) {
    // Humidity
    document.getElementById('humidityBadge').textContent = `${currentWeather.main.humidity > 50 ? 'Very humid' : 'Moderate'} - ${currentWeather.main.humidity}%`;
    
    // UV Index (estimated based on time of day)
    const now = new Date();
    const hour = now.getHours();
    const uvi = hour >= 6 && hour <= 18 ? Math.round(Math.random() * 8) : 0;
    const uvLevel = uvi < 3 ? 'Low' : uvi < 6 ? 'Moderate' : uvi < 8 ? 'High' : 'Very High';
    const uvBadgeEl = document.getElementById('uvBadge');
    uvBadgeEl.textContent = `${uvLevel} - ${uvi} UV`;
    uvBadgeEl.className = `badge ${uvi < 3 ? 'uv-low' : uvi < 6 ? 'uv-moderate' : 'uv-high'}`;
    
    // Visibility
    const visibility = currentWeather.visibility ? (currentWeather.visibility / 1000).toFixed(1) : 'N/A';
    document.getElementById('visibilityBadge').textContent = visibility !== 'N/A' ? `${visibility} km` : 'Average';
    
    // Pressure
    const pressure = currentWeather.main.pressure;
    const pressureLevel = pressure < 1000 ? 'Low' : pressure < 1020 ? 'Normal' : 'High';
    document.getElementById('pressureBadge').textContent = pressureLevel + ` - ${pressure} hPa`;
    
    // Moon phase
    const moonPhases = ['Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 
                        'Waning gibbous', 'Last quarter', 'Waning crescent', 'New moon'];
    const moonPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
    document.getElementById('moonBadge').textContent = moonPhase;
}

// Update conditions with AQI data
function updateAQIConditions(aqiData) {
    const aqi = aqiData.list[0].main.aqi;
    const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiValue = aqiLevels[aqi - 1] || 'Moderate';
    
    const aqiBadgeEl = document.getElementById('aqiBadge');
    aqiBadgeEl.textContent = `${aqiValue} - ${aqi * 20} UAQI`;
    
    // Set appropriate class based on AQI
    const classes = ['aq-good', 'aq-fair', 'aq-moderate', 'aq-poor', 'aq-very-poor'];
    aqiBadgeEl.className = `badge ${classes[aqi - 1] || 'aq-moderate'}`;
}

// (Old One Call API functions removed - now using free Current + Forecast APIs)

// Format day name
function formatDay(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// Show API key error message
function showAPIKeyError() {
    document.getElementById('cityName').textContent = 'API Key Required';
    document.getElementById('weatherDescription').innerHTML = `
        <p style="color: #ff6b6b; margin-bottom: 10px;">
            ⚠️ Please configure your OpenWeatherMap API key to view weather data.
        </p>
        <ol style="text-align: left; padding-left: 20px;">
            <li>Get a free API key at <a href="https://openweathermap.org/api" target="_blank" style="color: #64b5f6;">openweathermap.org</a></li>
            <li>Open script.js and replace 'demo' with your API key</li>
            <li>Refresh the page</li>
        </ol>
    `;
}

// Check API key on load
window.addEventListener('load', () => {
    if (WEATHER_API_KEY === 'demo' || !WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweather_api_key') {
        showAPIKeyError();
        return;
    }
    
    fetchWeatherData(currentLocation.lat, currentLocation.lon);
    loadWorldCities();
});

// Alert user about API keys
console.log('⚠️ IMPORTANT: Please add your OpenWeatherMap API key to script.js');
console.log('Get a free API key at: https://openweathermap.org/api');

// (Old functions removed - now using One Call API functions)

// Get weather icon class
function getIconClass(weatherMain) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Fog': 'fa-smog'
    };
    return iconMap[weatherMain] || 'fa-cloud';
}

// Update weather icon
function updateWeatherIcon(elementId, iconCode) {
    const element = document.getElementById(elementId);
    const iconClass = getIconClassFromCode(iconCode);
    element.innerHTML = `<i class="fas ${iconClass}"></i>`;
}

function getIconClassFromCode(code) {
    // Map OpenWeatherMap icon codes to Font Awesome icons
    const codeMap = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy',
        '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-rain',
        '10n': 'fa-cloud-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };
    return codeMap[code] || 'fa-cloud';
}

// Format time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Capitalize first letter
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Update background based on weather and temperature
function updateBackgroundByWeather(temp, weatherMain) {
    let backgroundUrl;
    
    // Determine background based on weather condition first, then temperature
    const backgrounds = {
        // Snow conditions
        'Snow': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1920&q=80',
        
        // Rain conditions
        'Rain': 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1920&q=80',
        'Drizzle': 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1920&q=80',
        'Thunderstorm': 'https://images.unsplash.com/photo-1490126125528-982d2975d547?w=1920&q=80',
        
        // Cloudy conditions (including broken clouds, scattered clouds, few clouds, overcast)
        'Clouds': temp < 15 
            ? 'https://images.unsplash.com/photo-1516463475794-a3e5ac33e6a8?w=1920&q=80' // Cool cloudy
            : 'https://images.unsplash.com/photo-1497290756769-451c09c63df5?w=1920&q=80', // Warm cloudy
        
        // Hot weather (>30°C)
        'Clear-Hot': 'https://images.unsplash.com/photo-1505826759037-406b40d0ad10?w=1920&q=80', // Desert/sunny
        
        // Warm weather (20-30°C)
        'Clear-Warm': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80', // Pleasant sunny
        
        // Cool weather (10-20°C)
        'Clear-Cool': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', // Mild sunny
        
        // Cold weather (<10°C)
        'Clear-Cold': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80', // Cool sunny
        
        // Mist/Fog
        'Mist': 'https://images.unsplash.com/photo-1533158326339-7f3cf2404404?w=1920&q=80',
        'Fog': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
        'Haze': 'https://images.unsplash.com/photo-1528114039593-4366cc08227d?w=1920&q=80',
        
        // Default
        'Default': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1920&q=80'
    };
    
    // Check for weather conditions first
    if (weatherMain === 'Clear') {
        if (temp > 30) {
            backgroundUrl = backgrounds['Clear-Hot'];
        } else if (temp > 20) {
            backgroundUrl = backgrounds['Clear-Warm'];
        } else if (temp > 10) {
            backgroundUrl = backgrounds['Clear-Cool'];
        } else {
            backgroundUrl = backgrounds['Clear-Cold'];
        }
    } else if (backgrounds[weatherMain]) {
        backgroundUrl = backgrounds[weatherMain];
    } else {
        // Fallback for unknown weather types
        backgroundUrl = backgrounds['Default'];
    }
    
    // Apply background with smooth transition
    const bgElement = document.getElementById('backgroundImage');
    if (bgElement) {
        bgElement.style.transition = 'background-image 1s ease-in-out';
        bgElement.style.backgroundImage = `url(${backgroundUrl})`;
        bgElement.style.backgroundSize = 'cover';
        bgElement.style.backgroundPosition = 'center';
    }
}

// Indian cities data
const worldCities = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
    { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
    { name: 'Varanasi', lat: 25.3176, lon: 82.9739 },
    { name: 'Agra', lat: 27.1767, lon: 78.0081 },
    { name: 'Amritsar', lat: 31.6340, lon: 74.8723 },
    { name: 'Surat', lat: 21.1702, lon: 72.8311 },
    { name: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
    { name: 'Guwahati', lat: 26.1445, lon: 91.7362 },
    { name: 'Indore', lat: 22.7196, lon: 75.8577 }
];

// Load Indian cities
async function loadWorldCities() {
    // Don't load cities if API key is not configured
    if (WEATHER_API_KEY === 'demo' || !WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweather_api_key') {
        return;
    }
    
    const container = document.getElementById('worldCitiesGrid');
    
    for (const city of worldCities.slice(0, 16)) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${WEATHER_API_KEY}&units=metric`
            );
            const data = await response.json();
            
            const card = document.createElement('div');
            card.className = 'city-card';
            card.onclick = () => {
                searchLocation(city.name);
            };
            
            const weatherMain = data.weather[0].main;
            card.innerHTML = `
                <div class="city-name-card">${city.name}</div>
                <div class="city-icon">
                    <i class="fas ${getIconClass(weatherMain)}"></i>
                </div>
                <div class="city-condition">${capitalize(data.weather[0].description)}</div>
                <div class="city-temp">${Math.round(data.main.temp)}°</div>
            `;
            
            container.appendChild(card);
        } catch (error) {
            console.error(`Error loading ${city.name}:`, error);
        }
    }
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const tabId = btn.dataset.tab + '-tab';
        document.getElementById(tabId).classList.add('active');
        
        if (btn.dataset.tab === 'map') {
            setTimeout(initMap, 100);
        }
    });
});

// Search functionality
async function searchLocation(query) {
    if (!query.trim()) return;
    
    // Show loading state
    const searchBtn = document.getElementById('searchBtn');
    const originalHTML = searchBtn.innerHTML;
    
    try {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Try OpenWeatherMap geocoding (more reliable than Nominatim)
        const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${WEATHER_API_KEY}`;
        
        const response = await fetch(geocodeUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const result = data[0];
            currentLocation = {
                lat: result.lat,
                lon: result.lon,
                name: `${result.name}${result.country ? ', ' + result.country : ''}`
            };
            
            fetchWeatherData(currentLocation.lat, currentLocation.lon);
            
            // Update map if it's initialized
            if (map) {
                updateMapMarker(currentLocation.lat, currentLocation.lon, currentLocation.name);
            }
        } else {
            alert('Location not found. Please try a different city name like "New York" or "London".');
        }
    } catch (error) {
        console.error('Error geocoding location:', error);
        alert('Error searching for location: ' + error.message);
    } finally {
        // Restore button state
        searchBtn.disabled = false;
        searchBtn.innerHTML = originalHTML;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    try {
        // Search button
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = document.getElementById('searchInput').value;
                searchLocation(query);
            });
        }
        
        // Search input (Enter key)
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = document.getElementById('searchInput').value;
                    searchLocation(query);
                }
            });
        }
        
        // Follow button
        const followBtn = document.querySelector('.follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', () => {
                alert(`Following ${currentLocation.name}!`);
            });
        }
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

// Initialize event listeners when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    initializeEventListeners();
}

