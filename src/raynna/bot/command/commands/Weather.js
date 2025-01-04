require('dotenv').config();
const axios = require('axios');
const countries = require('i18n-iso-countries');

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

class Weather {
    constructor() {
        this.name = 'Weather';
        this.triggers = ['väder', 'v', 'weater', 'weathar'];
        this.apiKey = process.env.WEATHER_KEY;
        this.game = "General";
        this.weatherEmojis = {
            clear: '☀️',
            clouds: '☁️',
            rain: '🌧️',
            snow: '❄️',
            thunderstorm: '⛈️',
            drizzle: '🌦️',
            mist: '🌫️',
            fog: '🌫️',
            wind: '💨',
        };
        this.humidityEmoji = '💧';
        this.windEmoji = '🍃';
    }

    async fetchWeather(location, country = '') {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}${country ? ',' + country : ''}&appid=${this.apiKey}&units=metric`;

        try {
            const response = await axios.get(apiUrl);
            return response.data;
        } catch (error) {
            console.error('Error fetching weather data:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Unable to fetch weather data.');
        }
    }


    getCountryNameWithFlag(countryCode) {
        const countryName = countries.getName(countryCode, 'en') || countryCode;
        const flagEmoji = countryCode
            .toUpperCase()
            .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
        return `${flagEmoji} ${countryName}`;
    }

    getWeatherEmoji(description) {
        const key = Object.keys(this.weatherEmojis).find(emojiKey =>
            description.toLowerCase().includes(emojiKey)
        );
        return this.weatherEmojis[key] || '🌡️';
    }

    getTemperatureText(temp, feel) {
        let text = `🌡️${temp}°C`;
        if (feel > temp)
            text += `(Feels 🔥${feel}°C)`;
        if (feel < temp)
            text += `(Feels ❄️${feel}°C)`;
        return text;
    }

    formatWeatherResponse(data) {
        const { name, sys, main, weather, wind, rain, snow } = data;
        const { temp, feels_like, humidity } = main;
        const { country } = sys;

        const location = `${name}, ${this.getCountryNameWithFlag(country)}`;
        const temperature = this.getTemperatureText(temp, feels_like);
        const weatherDescription = weather[0].description;
        const weatherEmoji = this.getWeatherEmoji(weatherDescription);
        const humidityText = `${this.humidityEmoji}${humidity}%`;
        const windText = `${this.windEmoji}${wind.speed} m/s`;

        let precipitation = '';
        if (rain && rain['1h']) {
            precipitation = `🌧️${rain['1h']} mm/h`;
        } else if (snow && snow['1h']) {
            precipitation = `❄️${snow['1h']} mm/h`;
        }

        const baseResponse = `${location}: ${weatherEmoji}${weatherDescription}, ${temperature}, ${humidityText}, ${windText}`;
        return precipitation ? `${baseResponse}, ${precipitation}` : baseResponse;
    }

    async execute(tags, channel, argument) {
        const location = argument ? argument.trim() : '';
        const locationParts = location.split(',');
        const city = locationParts[0].trim();
        let country = locationParts[1]?.trim() || 'SE';

        if (!city) {
            return `Please provide a location after !weather.`;
        }

        try {
            let weatherData = await this.fetchWeather(city, country);
            let weatherResponse = this.formatWeatherResponse(weatherData);
            return `${weatherResponse}`;
        } catch (error) {
            if (country === 'SE') {
                country = '';
                try {
                    let weatherData = await this.fetchWeather(city, country);
                    let weatherResponse = this.formatWeatherResponse(weatherData);
                    return `${weatherResponse}`;
                } catch (error) {
                    return `Unable to find weather for ${city}. Please check the location and try again.`;
                }
            } else {
                return `Unable to find weather for ${city}, ${country}. Please check the location and try again.`;
            }
        }
    }

}

module.exports = Weather;
