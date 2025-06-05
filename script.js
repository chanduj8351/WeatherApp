document.addEventListener('DOMContentLoaded', function() {
    const locationInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    const loadingContainer = document.getElementById('loading');
    const currentWeatherSection = document.getElementById('current-weather');
    const forecastCardsContainer = document.getElementById('forecast-cards');

    // Default location
    fetchWeather('Hyderabad');

    // Event listeners
    searchBtn.addEventListener('click', () => {
        const location = locationInput.value.trim();
        if (location) {
            fetchWeather(location);
        }
    });

    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const location = locationInput.value.trim();
            if (location) {
                fetchWeather(location);
            }
        }
    });

    function fetchWeather(location) {
        showLoading();
        
        fetch(`https://wttr.in/${location}?format=j1`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Location not found');
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data);
                hideLoading();
            })
            .catch(error => {
                hideLoading();
                alert(`Error: ${error.message}`);
            });
    }

    function showLoading() {
        loadingContainer.style.display = 'flex';
        currentWeatherSection.innerHTML = '';
        forecastCardsContainer.innerHTML = '';
    }

    function hideLoading() {
        loadingContainer.style.display = 'none';
    }

    function displayWeather(data) {
        displayCurrentWeather(data);
        displayForecast(data);
    }

    function displayCurrentWeather(data) {
        const current = data.current_condition[0];
        const location = data.nearest_area[0];
        const locationName = `${location.areaName[0].value}, ${location.country[0].value}`;
        const weatherDesc = current.weatherDesc[0].value;
        const symbol = getEmoji(weatherDesc);
        
        const tempC = current.temp_C;
        const tempF = current.temp_F;
        const feelsLikeC = current.FeelsLikeC;
        const feelsLikeF = current.FeelsLikeF;
        
        const tempClass = getTempClass(tempC);
        const feelsLikeClass = getTempClass(feelsLikeC);
        
        currentWeatherSection.innerHTML = `
            <h2>Current Weather</h2>
            <div class="location">
                <i class="fas fa-map-marker-alt"></i> ${locationName}
            </div>
            <div class="weather-main">
                <div class="weather-icon">${symbol}</div>
                <div class="weather-desc">${weatherDesc}</div>
                <div class="temp ${tempClass}">${tempC}°C / ${tempF}°F</div>
                <div class="feels-like">Feels like: <span class="${feelsLikeClass}">${feelsLikeC}°C / ${feelsLikeF}°F</span></div>
            </div>
            <div class="weather-grid">
                <div class="weather-item">
                    <div class="weather-icon"><i class="fas fa-tint"></i></div>
                    <div class="weather-details">
                        <h3>Humidity</h3>
                        <p>${current.humidity}%</p>
                    </div>
                </div>
                <div class="weather-item">
                    <div class="weather-icon"><i class="fas fa-wind"></i></div>
                    <div class="weather-details">
                        <h3>Wind</h3>
                        <p>${current.windspeedKmph} km/h ${getWindArrow(current.winddirDegree)} (${current.winddir16Point})</p>
                    </div>
                </div>
                <div class="weather-item">
                    <div class="weather-icon"><i class="fas fa-eye"></i></div>
                    <div class="weather-details">
                        <h3>Visibility</h3>
                        <p>${current.visibility} km</p>
                    </div>
                </div>
                <div class="weather-item">
                    <div class="weather-icon"><i class="fas fa-tachometer-alt"></i></div>
                    <div class="weather-details">
                        <h3>Pressure</h3>
                        <p>${current.pressure} mb</p>
                    </div>
                </div>
            </div>
        `;
    }

    function displayForecast(data) {
        forecastCardsContainer.innerHTML = '';
        
        // Show forecast for next 3 days
        for (let i = 0; i < 3; i++) {
            const day = data.weather[i];
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // Get mid-day conditions (noon)
            const noon = day.hourly[4];
            const condition = noon.weatherDesc[0].value;
            const symbol = getEmoji(condition);
            
            forecastCardsContainer.innerHTML += `
                <div class="forecast-card">
                    <h3>${dayName}, ${dateStr}</h3>
                    <div class="forecast-icon">${symbol}</div>
                    <div class="forecast-desc">${condition}</div>
                    <div class="forecast-temp">
                        ${day.mintempC}°C - ${day.maxtempC}°C
                    </div>
                    <div class="forecast-details">
                        <p><i class="fas fa-tint"></i> Rain: <span>${noon.chanceofrain}%</span></p>
                        <p><i class="fas fa-wind"></i> Wind: <span>${noon.windspeedKmph} km/h</span></p>
                    </div>
                </div>
            `;
        }
    }

    function getEmoji(condition) {
        condition = condition.toLowerCase();
        const emojis = {
            'sunny': '☀️',
            'clear': '☀️',
            'partly cloudy': '⛅',
            'cloudy': '☁️',
            'rain': '🌧️',
            'light rain': '🌦️',
            'heavy rain': '⛈️',
            'thunderstorm': '⚡',
            'snow': '❄️',
            'light snow': '🌨️',
            'mist': '🌫️',
            'fog': '🌁',
            'overcast': '☁️'
        };
        
        for (const key in emojis) {
            if (condition.includes(key)) {
                return emojis[key];
            }
        }
        return '⛅';
    }

    function getWindArrow(degrees) {
        const arrows = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
        const index = Math.round(degrees / 45) % 8;
        return arrows[index];
    }

    function getTempClass(tempC) {
        tempC = parseFloat(tempC);
        if (tempC <= 0) return 'temp-cold';
        if (tempC >= 30) return 'temp-hot';
        return 'temp-moderate';
    }
});