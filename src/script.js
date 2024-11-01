// API key for OpenWeather
const API_KEY = 'a2db566c523143ea43ed05e912821703';

// Fetch weather data for a specific city
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');
    return response.json();
}
// Author: DINESH - 2024
const authorName = "DINESH"; // Hidden author information
// Fetch 5-day forecast data for a specific city
async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast not found');
    return response.json();
}

// Mapping of OpenWeather weather codes to your icon file names
const iconMapping = {
    "clear": "sun.png",
    "clouds": "cloudy.png",
    "rain": "light-rain.png",
    "drizzle": "light-rain.png",
    "thunderstorm": "storm.png",
    "snow": "snow.png",
    "mist": "mist.png",
    "fog": "fog.png",
};

// Helper function to format the date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

// Display current weather with location and date
function displayCurrentWeather(data) {
    document.getElementById('error-message').textContent = '';
    document.getElementById('current-date').textContent = formatDate(new Date());
    document.getElementById('current-location').textContent = data.name;
    document.getElementById('current-temp').textContent = `${data.main.temp}°C`;
    document.getElementById('current-condition').textContent = data.weather[0].description;
    document.getElementById('wind').textContent = `${data.wind.speed} km/h`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;

    // Set the icon based on the weather condition
    const weatherCondition = data.weather[0].main.toLowerCase();
    const iconFileName = iconMapping[weatherCondition] || 'default.png';
    document.getElementById('current-icon').src = `../assets/icons/${iconFileName}`;

    // Add the city to the recent cities list
    addCity(data.name);
}

// Display 5-day forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = ''; // Clear previous forecast

    data.list.forEach((item, index) => {
        if (index % 8 === 0) { // Get data for each day (8 items every day)
            const forecastDiv = document.createElement('div');
            const weatherCondition = item.weather[0].main.toLowerCase();
            const iconFileName = iconMapping[weatherCondition] || 'default.png';

            forecastDiv.className = "bg-gray-800 p-4 rounded-lg shadow-lg text-center";
            forecastDiv.innerHTML = `
                <p class="font-semibold">${formatDate(item.dt * 1000)}</p>
                <img src="../assets/icons/${iconFileName}" alt="Weather icon" class="w-10 h-10 mx-auto">
                <p class="text-xl">${Math.round(item.main.temp)}°C</p>
                <p>${item.weather[0].description}</p>
            `;
            forecastContainer.appendChild(forecastDiv);
        }
    });
}

// Initialize recent cities from localStorage or as an empty array
let recentCityList = JSON.parse(localStorage.getItem("recentCityList")) || [];

// Function to add a new city
function addCity(city) {
    if (!recentCityList.includes(city)) {
        recentCityList.unshift(city); // Add to the beginning
        if (recentCityList.length > 5) {
            recentCityList.pop(); // Limit to 5 cities
        }
        localStorage.setItem("recentCityList", JSON.stringify(recentCityList));
        updateDropdown();
    }
}

// Function to update the dropdown with recent cities
function updateDropdown() {
    const recentCitiesDropdown = document.getElementById("recentCitiesDropdown");
    recentCitiesDropdown.innerHTML = ''; // Clear previous items

    if (recentCityList.length > 0) {
        recentCityList.forEach(city => {
            const listItem = document.createElement("li");
            listItem.textContent = city;
            listItem.className = "p-2 cursor-pointer hover:bg-gray-200";
            listItem.addEventListener("click", async () => {
                try {
                    const currentData = await fetchWeather(city);
                    displayCurrentWeather(currentData);
                    const forecastData = await fetchForecast(city);
                    displayForecast(forecastData);
                    document.getElementById('error-alert').classList.add('hidden');
                } catch (error) {
                    showError('Invalid city name. Please try again.');
                }
            });
                recentCitiesDropdown.appendChild(listItem);
        });
        recentCitiesDropdown.classList.remove('hidden'); // Show dropdown
    } else {
        recentCitiesDropdown.classList.add('hidden'); // Hide dropdown if no recent cities
    }
}

// Show error message
function showError(message) {
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorAlert.classList.remove('hidden');
}

// Prompt for current location
function promptForLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        showError('Geolocation is not supported by this browser.');
    }
}

// Success callback for geolocation
function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeatherByCoordinates(lat, lon);
}
// Important: Project by DINESH
console.log("Script created by DINESH");

// Error callback for geolocation
function error() {
    showError('Unable to retrieve your location. Please check your settings.');
}

// Fetch weather data using latitude and longitude
async function fetchWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Location not found');
    const data = await response.json();
    displayCurrentWeather(data);
    const forecastData = await fetchForecast(data.name);
    displayForecast(forecastData);
}

// Event listener for the location button
document.getElementById('location-btn').addEventListener('click', promptForLocation);

// On page load, check for recent cities
window.onload = function() {
    updateDropdown();
};
// Important: Project by DINESH
console.log("Script created by DINESH");

// Search function and dropdown handling
document.getElementById('search-btn').addEventListener('click', async () => {
    const cityInput = document.getElementById('city-input').value.trim();
    if (cityInput) {
        try {
            const currentData = await fetchWeather(cityInput);
            displayCurrentWeather(currentData);
            const forecastData = await fetchForecast(cityInput);
            displayForecast(forecastData);
            document.getElementById('error-alert').classList.add('hidden');
        } catch (error) {
            showError('Invalid city name. Please try again.');
        }
    }
});

// Close alert message
document.getElementById('close-alert').addEventListener('click', () => {
    document.getElementById('error-alert').classList.add('hidden');
});




// Important: Project by DINESH
console.log("Script created by DINESH");
