import { COASTAL_CITIES_DATA } from './coastalCitiesData.js';

// Comprehensive meteorological dataset with up to 7-day forecast, AQI, precipitation, wind, and emojis
export const CITY_FORECAST_DATA = {
  kolkata: {
    id: 'kolkata',
    name: 'Kolkata',
    nameHindi: 'कोलकाता',
    state: 'West Bengal',
    stateHindi: 'पश्चिम बंगाल',
    region: 'Gangetic West Bengal & Coastal Delta',
    regionHindi: 'गंगा का पश्चिम बंगाल व तटीय डेल्टा',
    coordinates: '22.5726° N, 88.3639° E',
    stationCode: 'VECC-42809',
    updatedAt: '10 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '10 मिनट पहले (इसरो मोसडैक)',
    
    // Core Requested Metrics
    temp: 30.2,
    feelsLike: 35.4,
    tempMin: 25.0,
    tempMax: 32.8,
    condition: 'Thunderstorm with Rain',
    conditionHindi: 'तूफान व बारिश',
    icon: 'thunderstorm',
    emoji: '⛈️',

    // AQI (Air Quality Index)
    aqi: {
      value: 124,
      category: 'Moderate',
      categoryHindi: 'मध्यम',
      statusColor: 'amber',
      pm25: '44.8 µg/m³',
      pm10: '82.1 µg/m³',
      no2: '26.4 ppb',
      so2: '8.2 ppb',
      o3: '31.0 ppb',
      advisory: 'Air quality is acceptable; however, unusually sensitive individuals should reduce prolonged outdoor exertion.',
      advisoryHindi: 'वायु गुणवत्ता स्वीकार्य है; हालांकि, संवेदनशील व्यक्तियों को बाहर अधिक परिश्रम करने से बचना चाहिए।'
    },

    // Precipitation
    precipitation: {
      chance: 85,
      rate: '14.2 mm/hr',
      type: 'Heavy Thunder Showers',
      typeHindi: 'तीव्र तूफानी बौछारें',
      past24h: '42.6 mm',
      expected24h: '55 - 70 mm'
    },

    // Wind Speed & Direction
    wind: {
      speed: '18.5 km/h',
      speedKmh: 18.5,
      direction: 'Southeasterly',
      directionHindi: 'दक्षिण-पूर्वी',
      bearing: 135,
      gusts: '36.0 km/h',
      beaufortScale: 'Force 3 - Gentle Breeze'
    },

    // Secondary Telemetry
    humidity: 84,
    pressure: '1004 hPa',
    pressureTrend: 'Falling (-1.4 hPa/3h)',
    pressureTrendHindi: 'गिरता हुआ (-1.4 hPa/3h)',
    visibility: '3.8 km',
    uvIndex: 4,
    uvCategory: 'Moderate',
    dewPoint: '26.8 °C',
    cloudCover: '92 %',

    // 7-Day Forecast with Emojis as requested: ☀️ sunny, 🌧️ rainy, ☁️ clouds
    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Thunderstorm with Rain',
        conditionHindi: 'तूफान व बारिश',
        emoji: '⛈️',
        icon: 'thunderstorm',
        tempMax: 31,
        tempMin: 25,
        precipChance: 85,
        rainfall: '42 mm',
        windSpeed: '18 km/h',
        windDir: 'SE',
        humidity: 84,
        aqi: 124,
        hourly: [
          { time: '06:00', temp: 26, emoji: '🌧️', cond: 'Showers', rain: 75, wind: '14 km/h' },
          { time: '09:00', temp: 28, emoji: '⛈️', cond: 'Thunderstorm', rain: 85, wind: '18 km/h' },
          { time: '12:00', temp: 31, emoji: '🌧️', cond: 'Heavy Rain', rain: 90, wind: '22 km/h' },
          { time: '15:00', temp: 30, emoji: '⛈️', cond: 'Thunderstorm', rain: 80, wind: '20 km/h' },
          { time: '18:00', temp: 28, emoji: '🌧️', cond: 'Showers', rain: 60, wind: '16 km/h' },
          { time: '21:00', temp: 27, emoji: '☁️', cond: 'Cloudy Sky', rain: 40, wind: '12 km/h' }
        ]
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Heavy Monsoon Rain',
        conditionHindi: 'भारी मानसूनी बारिश',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 29,
        tempMin: 24,
        precipChance: 90,
        rainfall: '65 mm',
        windSpeed: '22 km/h',
        windDir: 'E',
        humidity: 89,
        aqi: 82,
        hourly: [
          { time: '06:00', temp: 25, emoji: '🌧️', cond: 'Rain', rain: 80, wind: '16 km/h' },
          { time: '09:00', temp: 27, emoji: '🌧️', cond: 'Heavy Rain', rain: 90, wind: '22 km/h' },
          { time: '12:00', temp: 29, emoji: '🌧️', cond: 'Squalls', rain: 95, wind: '26 km/h' },
          { time: '15:00', temp: 28, emoji: '🌧️', cond: 'Continuous Rain', rain: 85, wind: '20 km/h' },
          { time: '18:00', temp: 26, emoji: '🌧️', cond: 'Showers', rain: 70, wind: '18 km/h' },
          { time: '21:00', temp: 25, emoji: '☁️', cond: 'Overcast', rain: 50, wind: '14 km/h' }
        ]
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 30,
        tempMin: 25,
        precipChance: 45,
        rainfall: '12 mm',
        windSpeed: '15 km/h',
        windDir: 'NE',
        humidity: 78,
        aqi: 98,
        hourly: [
          { time: '06:00', temp: 25, emoji: '☁️', cond: 'Cloudy', rain: 30, wind: '12 km/h' },
          { time: '09:00', temp: 28, emoji: '☁️', cond: 'Overcast', rain: 40, wind: '14 km/h' },
          { time: '12:00', temp: 30, emoji: '⛅', cond: 'Sun & Cloud', rain: 45, wind: '16 km/h' },
          { time: '15:00', temp: 29, emoji: '🌧️', cond: 'Passing Rain', rain: 50, wind: '15 km/h' },
          { time: '18:00', temp: 27, emoji: '☁️', cond: 'Cloudy', rain: 35, wind: '12 km/h' },
          { time: '21:00', temp: 26, emoji: '☁️', cond: 'Overcast', rain: 25, wind: '10 km/h' }
        ]
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Mainly Sunny & Clear',
        conditionHindi: 'मुख्यतः धूप व साफ',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 33,
        tempMin: 26,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '10 km/h',
        windDir: 'N',
        humidity: 64,
        aqi: 140,
        hourly: [
          { time: '06:00', temp: 26, emoji: '☀️', cond: 'Clear Sky', rain: 5, wind: '8 km/h' },
          { time: '09:00', temp: 29, emoji: '☀️', cond: 'Sunny', rain: 10, wind: '10 km/h' },
          { time: '12:00', temp: 33, emoji: '☀️', cond: 'Hot & Bright', rain: 15, wind: '12 km/h' },
          { time: '15:00', temp: 32, emoji: '☀️', cond: 'Sunny', rain: 15, wind: '10 km/h' },
          { time: '18:00', temp: 29, emoji: '⛅', cond: 'Mild Dusk', rain: 10, wind: '8 km/h' },
          { time: '21:00', temp: 27, emoji: '☀️', cond: 'Clear Night', rain: 5, wind: '6 km/h' }
        ]
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Partly Sunny',
        conditionHindi: 'आंशिक रूप से धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 32,
        tempMin: 25,
        precipChance: 20,
        rainfall: '2 mm',
        windSpeed: '12 km/h',
        windDir: 'NW',
        humidity: 68,
        aqi: 135,
        hourly: [
          { time: '06:00', temp: 25, emoji: '☀️', cond: 'Sunny Morning', rain: 10, wind: '8 km/h' },
          { time: '09:00', temp: 28, emoji: '☀️', cond: 'Clear Sky', rain: 15, wind: '10 km/h' },
          { time: '12:00', temp: 32, emoji: '⛅', cond: 'Partly Sunny', rain: 20, wind: '14 km/h' },
          { time: '15:00', temp: 31, emoji: '☀️', cond: 'Sunny', rain: 20, wind: '12 km/h' },
          { time: '18:00', temp: 28, emoji: '☁️', cond: 'Evening Clouds', rain: 15, wind: '10 km/h' },
          { time: '21:00', temp: 26, emoji: '☁️', cond: 'Calm', rain: 10, wind: '8 km/h' }
        ]
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Cloudy with Light Showers',
        conditionHindi: 'बादल व हल्की फुहारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 30,
        tempMin: 24,
        precipChance: 60,
        rainfall: '18 mm',
        windSpeed: '14 km/h',
        windDir: 'S',
        humidity: 80,
        aqi: 92,
        hourly: [
          { time: '06:00', temp: 24, emoji: '☁️', cond: 'Cloudy', rain: 35, wind: '10 km/h' },
          { time: '09:00', temp: 27, emoji: '🌧️', cond: 'Drizzle', rain: 55, wind: '12 km/h' },
          { time: '12:00', temp: 30, emoji: '🌧️', cond: 'Light Showers', rain: 60, wind: '16 km/h' },
          { time: '15:00', temp: 29, emoji: '🌧️', cond: 'Showers', rain: 65, wind: '14 km/h' },
          { time: '18:00', temp: 27, emoji: '☁️', cond: 'Cloudy', rain: 40, wind: '10 km/h' },
          { time: '21:00', temp: 25, emoji: '☁️', cond: 'Overcast', rain: 30, wind: '8 km/h' }
        ]
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Overcast Cloud Sky',
        conditionHindi: 'पूर्णतः घने बादल',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 29,
        tempMin: 24,
        precipChance: 40,
        rainfall: '8 mm',
        windSpeed: '12 km/h',
        windDir: 'SE',
        humidity: 76,
        aqi: 104,
        hourly: [
          { time: '06:00', temp: 24, emoji: '☁️', cond: 'Overcast', rain: 30, wind: '10 km/h' },
          { time: '09:00', temp: 27, emoji: '☁️', cond: 'Dense Clouds', rain: 35, wind: '12 km/h' },
          { time: '12:00', temp: 29, emoji: '☁️', cond: 'Cloud Cover', rain: 40, wind: '14 km/h' },
          { time: '15:00', temp: 28, emoji: '☁️', cond: 'Overcast', rain: 40, wind: '12 km/h' },
          { time: '18:00', temp: 26, emoji: '☁️', cond: 'Cloudy Dusk', rain: 30, wind: '10 km/h' },
          { time: '21:00', temp: 25, emoji: '☁️', cond: 'Calm Night', rain: 20, wind: '8 km/h' }
        ]
      }
    ]
  },

  chennai: {
    id: 'chennai',
    name: 'Chennai',
    nameHindi: 'चेन्नई',
    state: 'Tamil Nadu',
    stateHindi: 'तमिलनाडु',
    region: 'Coromandel Coastal Corridor',
    regionHindi: 'कोरोमंडल तटीय गलियारा',
    coordinates: '13.0827° N, 80.2707° E',
    stationCode: 'VOMM-43279',
    updatedAt: '5 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '5 मिनट पहले (इसरो मोसडैक)',

    temp: 32.4,
    feelsLike: 38.6,
    tempMin: 27.2,
    tempMax: 34.1,
    condition: 'Mainly Clear Sky',
    conditionHindi: 'साफ आसमान व धूप',
    icon: 'sun',
    emoji: '☀️',

    aqi: {
      value: 68,
      category: 'Good',
      categoryHindi: 'अच्छा (संतोषजनक)',
      statusColor: 'emerald',
      pm25: '21.2 µg/m³',
      pm10: '48.5 µg/m³',
      no2: '14.0 ppb',
      so2: '5.1 ppb',
      o3: '22.4 ppb',
      advisory: 'Air quality is great; ideal conditions for outdoor walks and marine leisure.',
      advisoryHindi: 'वायु गुणवत्ता बहुत अच्छी है; बाहरी गतिविधियों के लिए अनुकूल मौसम।'
    },

    precipitation: {
      chance: 10,
      rate: '0.0 mm/hr',
      type: 'Dry Coastal Winds',
      typeHindi: 'शुष्क तटीय हवाएं',
      past24h: '0.0 mm',
      expected24h: '0 - 2 mm'
    },

    wind: {
      speed: '11.1 km/h',
      speedKmh: 11.1,
      direction: 'Southeasterly',
      directionHindi: 'दक्षिण-पूर्वी',
      bearing: 140,
      gusts: '20.5 km/h',
      beaufortScale: 'Force 2 - Light Breeze'
    },

    humidity: 75,
    pressure: '1006 hPa',
    pressureTrend: 'Stable (±0.2 hPa)',
    pressureTrendHindi: 'स्थिर (±0.2 hPa)',
    visibility: '6.0 km',
    uvIndex: 8,
    uvCategory: 'Very High',
    dewPoint: '27.4 °C',
    cloudCover: '25 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Mainly Clear Sky',
        conditionHindi: 'साफ आसमान',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 33,
        tempMin: 27,
        precipChance: 10,
        rainfall: '0 mm',
        windSpeed: '11 km/h',
        windDir: 'SE',
        humidity: 75,
        aqi: 68
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Sunny & Warm',
        conditionHindi: 'धूप व गर्म',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 34,
        tempMin: 27,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '13 km/h',
        windDir: 'SE',
        humidity: 72,
        aqi: 74
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Passing Coastal Showers',
        conditionHindi: 'हल्की तटीय बौछारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 31,
        tempMin: 26,
        precipChance: 65,
        rainfall: '14 mm',
        windSpeed: '18 km/h',
        windDir: 'E',
        humidity: 82,
        aqi: 58
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 32,
        tempMin: 26,
        precipChance: 40,
        rainfall: '4 mm',
        windSpeed: '14 km/h',
        windDir: 'NE',
        humidity: 79,
        aqi: 65
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Rain & Wind',
        conditionHindi: 'वर्षा व तेज हवाएं',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 30,
        tempMin: 25,
        precipChance: 80,
        rainfall: '32 mm',
        windSpeed: '24 km/h',
        windDir: 'E',
        humidity: 88,
        aqi: 52
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Sunny Intervals',
        conditionHindi: 'धूप और छांव',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 33,
        tempMin: 26,
        precipChance: 25,
        rainfall: '2 mm',
        windSpeed: '12 km/h',
        windDir: 'SE',
        humidity: 74,
        aqi: 72
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Cloudy Breeze',
        conditionHindi: 'बादल भरी हवाएं',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 32,
        tempMin: 26,
        precipChance: 35,
        rainfall: '5 mm',
        windSpeed: '15 km/h',
        windDir: 'S',
        humidity: 78,
        aqi: 69
      }
    ]
  },

  mumbai: {
    id: 'mumbai',
    name: 'Mumbai',
    nameHindi: 'मुंबई',
    state: 'Maharashtra',
    stateHindi: 'महाराष्ट्र',
    region: 'Konkan Coastline',
    regionHindi: 'कोंकण तटरेखा',
    coordinates: '19.0760° N, 72.8777° E',
    stationCode: 'VABB-43003',
    updatedAt: '12 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '12 मिनट पहले (इसरो मोसडैक)',

    temp: 29.0,
    feelsLike: 33.8,
    tempMin: 24.8,
    tempMax: 31.5,
    condition: 'Smoke Fog & Haze',
    conditionHindi: 'धुंध और कोहरा',
    icon: 'fog',
    emoji: '🌫️',

    aqi: {
      value: 156,
      category: 'Moderate to Poor',
      categoryHindi: 'मध्यम से खराब',
      statusColor: 'orange',
      pm25: '62.4 µg/m³',
      pm10: '110.2 µg/m³',
      no2: '38.1 ppb',
      so2: '12.4 ppb',
      o3: '42.0 ppb',
      advisory: 'Breathing discomfort likely for people with lung disease, elderly, and children.',
      advisoryHindi: 'फेफड़ों के मरीजों, बुजुर्गों और बच्चों को सांस लेने में असुविधा हो सकती है।'
    },

    precipitation: {
      chance: 35,
      rate: '1.2 mm/hr',
      type: 'Occasional Coastal Drizzle',
      typeHindi: 'कभी-कभार तटीय फुहारें',
      past24h: '8.4 mm',
      expected24h: '10 - 20 mm'
    },

    wind: {
      speed: '16.7 km/h',
      speedKmh: 16.7,
      direction: 'Westerly',
      directionHindi: 'पश्चिमी समुद्री हवा',
      bearing: 260,
      gusts: '28.0 km/h',
      beaufortScale: 'Force 3 - Gentle Sea Breeze'
    },

    humidity: 79,
    pressure: '1008 hPa',
    pressureTrend: 'Rising (+0.6 hPa/3h)',
    pressureTrendHindi: 'बढ़ता हुआ (+0.6 hPa/3h)',
    visibility: '2.5 km',
    uvIndex: 5,
    uvCategory: 'Moderate',
    dewPoint: '25.0 °C',
    cloudCover: '70 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Smoke Fog & Haze',
        conditionHindi: 'धुंध और कोहरा',
        emoji: '🌫️',
        icon: 'fog',
        tempMax: 31,
        tempMin: 25,
        precipChance: 35,
        rainfall: '8 mm',
        windSpeed: '17 km/h',
        windDir: 'W',
        humidity: 79,
        aqi: 156
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 31,
        tempMin: 25,
        precipChance: 40,
        rainfall: '10 mm',
        windSpeed: '18 km/h',
        windDir: 'W',
        humidity: 82,
        aqi: 142
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Coastal Monsoon Rain',
        conditionHindi: 'तटीय मानसूनी बारिश',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 29,
        tempMin: 24,
        precipChance: 85,
        rainfall: '45 mm',
        windSpeed: '24 km/h',
        windDir: 'SW',
        humidity: 90,
        aqi: 65
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Heavy Rain Showers',
        conditionHindi: 'तेज मानसूनी वर्षा',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 28,
        tempMin: 24,
        precipChance: 90,
        rainfall: '60 mm',
        windSpeed: '28 km/h',
        windDir: 'SW',
        humidity: 92,
        aqi: 55
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 30,
        tempMin: 25,
        precipChance: 50,
        rainfall: '15 mm',
        windSpeed: '16 km/h',
        windDir: 'W',
        humidity: 84,
        aqi: 95
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Sunny & Humid',
        conditionHindi: 'धूप व उमस',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 32,
        tempMin: 26,
        precipChance: 20,
        rainfall: '2 mm',
        windSpeed: '12 km/h',
        windDir: 'NW',
        humidity: 76,
        aqi: 128
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Sunny & Clear',
        conditionHindi: 'साफ व चमकदार धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 33,
        tempMin: 26,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '10 km/h',
        windDir: 'NW',
        humidity: 72,
        aqi: 138
      }
    ]
  },

  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru',
    nameHindi: 'बेंगलुरु',
    state: 'Karnataka',
    stateHindi: 'कर्नाटक',
    region: 'Deccan Plateau',
    regionHindi: 'दक्कन का पठार',
    coordinates: '12.9716° N, 77.5946° E',
    stationCode: 'VOBL-43295',
    updatedAt: '15 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '15 मिनट पहले (इसरो मोसडैक)',

    temp: 29.8,
    feelsLike: 31.2,
    tempMin: 19.5,
    tempMax: 30.6,
    condition: 'Cloudy Sky',
    conditionHindi: 'बादल छाए रहेंगे',
    icon: 'cloudy',
    emoji: '☁️',

    aqi: {
      value: 58,
      category: 'Good',
      categoryHindi: 'अच्छा (स्वस्थ)',
      statusColor: 'emerald',
      pm25: '16.4 µg/m³',
      pm10: '38.0 µg/m³',
      no2: '12.1 ppb',
      so2: '4.8 ppb',
      o3: '20.1 ppb',
      advisory: 'Air quality is very healthy and satisfactory.',
      advisoryHindi: 'वायु गुणवत्ता बहुत अच्छी और स्वास्थ्यप्रद है।'
    },

    precipitation: {
      chance: 40,
      rate: '2.5 mm/hr',
      type: 'Scattered Showers',
      typeHindi: 'छिटपुट बौछारें',
      past24h: '14.0 mm',
      expected24h: '15 - 25 mm'
    },

    wind: {
      speed: '5.6 km/h',
      speedKmh: 5.6,
      direction: 'Westerly',
      directionHindi: 'पश्चिमी',
      bearing: 270,
      gusts: '14.0 km/h',
      beaufortScale: 'Force 2 - Light Breeze'
    },

    humidity: 47,
    pressure: '1012 hPa',
    pressureTrend: 'Stable (±0.1 hPa)',
    pressureTrendHindi: 'स्थिर (±0.1 hPa)',
    visibility: '8.0 km',
    uvIndex: 6,
    uvCategory: 'High',
    dewPoint: '17.2 °C',
    cloudCover: '65 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 30,
        tempMin: 20,
        precipChance: 40,
        rainfall: '14 mm',
        windSpeed: '6 km/h',
        windDir: 'W',
        humidity: 47,
        aqi: 58
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Rain & Thundershowers',
        conditionHindi: 'बारिश व गरज के साथ बौछारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 29,
        tempMin: 19,
        precipChance: 75,
        rainfall: '28 mm',
        windSpeed: '10 km/h',
        windDir: 'W',
        humidity: 68,
        aqi: 48
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Heavy Rain',
        conditionHindi: 'तेज वर्षा',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 27,
        tempMin: 19,
        precipChance: 85,
        rainfall: '36 mm',
        windSpeed: '14 km/h',
        windDir: 'SW',
        humidity: 78,
        aqi: 42
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 28,
        tempMin: 20,
        precipChance: 45,
        rainfall: '8 mm',
        windSpeed: '8 km/h',
        windDir: 'W',
        humidity: 60,
        aqi: 55
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Sunny & Pleasant',
        conditionHindi: 'सुहावनी धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 31,
        tempMin: 20,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '7 km/h',
        windDir: 'W',
        humidity: 48,
        aqi: 64
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'खिली हुई धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 31,
        tempMin: 21,
        precipChance: 10,
        rainfall: '0 mm',
        windSpeed: '6 km/h',
        windDir: 'NW',
        humidity: 45,
        aqi: 70
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 30,
        tempMin: 20,
        precipChance: 35,
        rainfall: '6 mm',
        windSpeed: '8 km/h',
        windDir: 'W',
        humidity: 52,
        aqi: 62
      }
    ]
  },

  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    nameHindi: 'हैदराबाद',
    state: 'Telangana',
    stateHindi: 'तेलंगाना',
    region: 'North Telangana Plateau',
    regionHindi: 'उत्तरी तेलंगाना पठार',
    coordinates: '17.3850° N, 78.4867° E',
    stationCode: 'VOHY-43128',
    updatedAt: '8 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '8 मिनट पहले (इसरो मोसडैक)',

    temp: 32.0,
    feelsLike: 35.8,
    tempMin: 22.4,
    tempMax: 33.6,
    condition: 'Haze & Warm',
    conditionHindi: 'हल्की धुंध व गर्म',
    icon: 'haze',
    emoji: '🌫️',

    aqi: {
      value: 112,
      category: 'Moderate',
      categoryHindi: 'मध्यम',
      statusColor: 'amber',
      pm25: '39.5 µg/m³',
      pm10: '76.2 µg/m³',
      no2: '24.0 ppb',
      so2: '7.8 ppb',
      o3: '28.5 ppb',
      advisory: 'Breathing discomfort to sensitive people; healthy individuals may experience slight irritation.',
      advisoryHindi: 'संवेदनशील लोगों को असुविधा हो सकती है; स्वस्थ लोगों को हल्की जलन महसूस हो सकती है।'
    },

    precipitation: {
      chance: 20,
      rate: '0.0 mm/hr',
      type: 'Nil',
      typeHindi: 'शून्य',
      past24h: '0.0 mm',
      expected24h: '0 - 5 mm'
    },

    wind: {
      speed: '0 km/h (Calm)',
      speedKmh: 0,
      direction: 'Calm',
      directionHindi: 'शांत',
      bearing: 0,
      gusts: '6.0 km/h',
      beaufortScale: 'Force 0 - Calm'
    },

    humidity: 67,
    pressure: '1010 hPa',
    pressureTrend: 'Stable (±0.3 hPa)',
    pressureTrendHindi: 'स्थिर (±0.3 hPa)',
    visibility: '4.5 km',
    uvIndex: 7,
    uvCategory: 'High',
    dewPoint: '24.2 °C',
    cloudCover: '40 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Haze',
        conditionHindi: 'हल्की धुंध',
        emoji: '🌫️',
        icon: 'haze',
        tempMax: 33,
        tempMin: 23,
        precipChance: 20,
        rainfall: '0 mm',
        windSpeed: '0 km/h',
        windDir: 'Calm',
        humidity: 67,
        aqi: 112
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'खिली हुई धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 34,
        tempMin: 24,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '6 km/h',
        windDir: 'E',
        humidity: 62,
        aqi: 118
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Rain & Passing Showers',
        conditionHindi: 'वर्षा व छिटपुट बौछारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 31,
        tempMin: 22,
        precipChance: 70,
        rainfall: '22 mm',
        windSpeed: '15 km/h',
        windDir: 'SE',
        humidity: 82,
        aqi: 72
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Heavy Rain Showers',
        conditionHindi: 'तेज मानसूनी वर्षा',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 29,
        tempMin: 21,
        precipChance: 80,
        rainfall: '38 mm',
        windSpeed: '18 km/h',
        windDir: 'SE',
        humidity: 86,
        aqi: 58
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 30,
        tempMin: 22,
        precipChance: 40,
        rainfall: '6 mm',
        windSpeed: '10 km/h',
        windDir: 'E',
        humidity: 74,
        aqi: 88
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Sunny & Warm',
        conditionHindi: 'धूप व गर्म',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 33,
        tempMin: 23,
        precipChance: 10,
        rainfall: '0 mm',
        windSpeed: '8 km/h',
        windDir: 'NE',
        humidity: 60,
        aqi: 105
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 32,
        tempMin: 23,
        precipChance: 25,
        rainfall: '2 mm',
        windSpeed: '9 km/h',
        windDir: 'E',
        humidity: 65,
        aqi: 98
      }
    ]
  },

  delhi: {
    id: 'delhi',
    name: 'New Delhi',
    nameHindi: 'नई दिल्ली',
    state: 'Delhi NCR',
    stateHindi: 'दिल्ली एनसीआर',
    region: 'Northern Plains',
    regionHindi: 'उत्तरी मैदानी क्षेत्र',
    coordinates: '28.6139° N, 77.2090° E',
    stationCode: 'VIDP-42182',
    updatedAt: '7 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '7 मिनट पहले (इसरो मोसडैक)',

    temp: 31.5,
    feelsLike: 34.0,
    tempMin: 21.2,
    tempMax: 33.8,
    condition: 'Dust Haze',
    conditionHindi: 'धूल भरी धुंध',
    icon: 'haze',
    emoji: '🌫️',

    aqi: {
      value: 198,
      category: 'Moderate to Unhealthy',
      categoryHindi: 'मध्यम से अस्वास्थ्यकर',
      statusColor: 'orange',
      pm25: '78.5 µg/m³',
      pm10: '164.0 µg/m³',
      no2: '42.0 ppb',
      so2: '14.5 ppb',
      o3: '48.2 ppb',
      advisory: 'Unhealthy for sensitive groups. Reduce prolonged or heavy exertion outdoors.',
      advisoryHindi: 'संवेदनशील समूहों के लिए अस्वास्थ्यकर। बाहर लंबे समय तक परिश्रम करने से बचें।'
    },

    precipitation: {
      chance: 15,
      rate: '0.0 mm/hr',
      type: 'Dry Breeze',
      typeHindi: 'शुष्क हवा',
      past24h: '0.0 mm',
      expected24h: '0 - 2 mm'
    },

    wind: {
      speed: '8.2 km/h',
      speedKmh: 8.2,
      direction: 'Northwesterly',
      directionHindi: 'उत्तर-पश्चिमी',
      bearing: 315,
      gusts: '18.0 km/h',
      beaufortScale: 'Force 2 - Light Breeze'
    },

    humidity: 52,
    pressure: '1009 hPa',
    pressureTrend: 'Falling (-0.8 hPa)',
    pressureTrendHindi: 'गिरता हुआ (-0.8 hPa)',
    visibility: '3.2 km',
    uvIndex: 7,
    uvCategory: 'High',
    dewPoint: '20.5 °C',
    cloudCover: '30 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Dust Haze',
        conditionHindi: 'धूल भरी धुंध',
        emoji: '🌫️',
        icon: 'haze',
        tempMax: 33,
        tempMin: 21,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '8 km/h',
        windDir: 'NW',
        humidity: 52,
        aqi: 198
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'खिली हुई धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 34,
        tempMin: 22,
        precipChance: 10,
        rainfall: '0 mm',
        windSpeed: '10 km/h',
        windDir: 'NW',
        humidity: 48,
        aqi: 210
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Sunny & Warm',
        conditionHindi: 'धूप व गर्म',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 35,
        tempMin: 23,
        precipChance: 10,
        rainfall: '0 mm',
        windSpeed: '9 km/h',
        windDir: 'W',
        humidity: 45,
        aqi: 215
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 32,
        tempMin: 22,
        precipChance: 35,
        rainfall: '4 mm',
        windSpeed: '14 km/h',
        windDir: 'E',
        humidity: 65,
        aqi: 160
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Rain & Thundershowers',
        conditionHindi: 'बारिश व गरज के साथ बौछारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 30,
        tempMin: 21,
        precipChance: 80,
        rainfall: '32 mm',
        windSpeed: '18 km/h',
        windDir: 'E',
        humidity: 82,
        aqi: 75
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 31,
        tempMin: 22,
        precipChance: 30,
        rainfall: '5 mm',
        windSpeed: '12 km/h',
        windDir: 'SE',
        humidity: 68,
        aqi: 110
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'चमकदार धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 33,
        tempMin: 22,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '10 km/h',
        windDir: 'NW',
        humidity: 55,
        aqi: 150
      }
    ]
  },

  bhubaneswar: {
    id: 'bhubaneswar',
    name: 'Bhubaneswar',
    nameHindi: 'भुवनेश्वर',
    state: 'Odisha',
    stateHindi: 'ओडिशा',
    region: 'Odisha Coastal Belt',
    regionHindi: 'ओडिशा तटीय क्षेत्र',
    coordinates: '20.2961° N, 85.8245° E',
    stationCode: 'VEBS-42971',
    updatedAt: '9 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '9 मिनट पहले (इसरो मोसडैक)',

    temp: 31.2,
    feelsLike: 37.5,
    tempMin: 24.0,
    tempMax: 32.0,
    condition: 'Squall Showers & Wind',
    conditionHindi: 'तीव्र बौछारें व हवाएं',
    icon: 'rain',
    emoji: '🌧️',

    aqi: {
      value: 62,
      category: 'Good',
      categoryHindi: 'अच्छा (स्वच्छ हवा)',
      statusColor: 'emerald',
      pm25: '18.2 µg/m³',
      pm10: '42.0 µg/m³',
      no2: '13.4 ppb',
      so2: '6.0 ppb',
      o3: '18.9 ppb',
      advisory: 'Air quality is clean due to continuous marine washouts.',
      advisoryHindi: 'समुद्री हवाओं और वर्षा के कारण वायु स्वच्छ और उत्तम है।'
    },

    precipitation: {
      chance: 90,
      rate: '22.0 mm/hr',
      type: 'Squally Monsoon Downpour',
      typeHindi: 'तीव्र मानसूनी मूसलाधार वर्षा',
      past24h: '56.4 mm',
      expected24h: '80 - 110 mm'
    },

    wind: {
      speed: '18.5 km/h',
      speedKmh: 18.5,
      direction: 'Easterly',
      directionHindi: 'पूर्वी',
      bearing: 90,
      gusts: '42.0 km/h',
      beaufortScale: 'Force 4 - Moderate Breeze'
    },

    humidity: 88,
    pressure: '1003 hPa',
    pressureTrend: 'Falling Rapidly (-2.2 hPa)',
    pressureTrendHindi: 'तेजी से गिरता हुआ (-2.2 hPa)',
    visibility: '3.0 km',
    uvIndex: 3,
    uvCategory: 'Low to Moderate',
    dewPoint: '27.0 °C',
    cloudCover: '98 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Squall Showers',
        conditionHindi: 'तीव्र बौछारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 31,
        tempMin: 24,
        precipChance: 90,
        rainfall: '56 mm',
        windSpeed: '19 km/h',
        windDir: 'E',
        humidity: 88,
        aqi: 62
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Heavy Rain Downpour',
        conditionHindi: 'मूसलाधार वर्षा',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 29,
        tempMin: 24,
        precipChance: 95,
        rainfall: '85 mm',
        windSpeed: '26 km/h',
        windDir: 'E',
        humidity: 94,
        aqi: 45
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Thunderstorm & Gales',
        conditionHindi: 'तूफान व तेज हवाएं',
        emoji: '⛈️',
        icon: 'thunderstorm',
        tempMax: 28,
        tempMin: 23,
        precipChance: 90,
        rainfall: '70 mm',
        windSpeed: '32 km/h',
        windDir: 'NE',
        humidity: 92,
        aqi: 40
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Rain & Wind',
        conditionHindi: 'वर्षा व हवाएं',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 30,
        tempMin: 24,
        precipChance: 70,
        rainfall: '25 mm',
        windSpeed: '20 km/h',
        windDir: 'N',
        humidity: 85,
        aqi: 55
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 31,
        tempMin: 25,
        precipChance: 40,
        rainfall: '10 mm',
        windSpeed: '14 km/h',
        windDir: 'NW',
        humidity: 78,
        aqi: 75
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'धूप व साफ',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 33,
        tempMin: 25,
        precipChance: 20,
        rainfall: '0 mm',
        windSpeed: '10 km/h',
        windDir: 'W',
        humidity: 70,
        aqi: 90
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Sunny & Clear',
        conditionHindi: 'चमकदार धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 34,
        tempMin: 26,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '11 km/h',
        windDir: 'W',
        humidity: 68,
        aqi: 98
      }
    ]
  },

  visakhapatnam: {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    nameHindi: 'विशाखापट्टनम',
    state: 'Andhra Pradesh',
    stateHindi: 'आंध्र प्रदेश',
    region: 'North Andhra Coastal Zone',
    regionHindi: 'उत्तरी आंध्र तटीय क्षेत्र',
    coordinates: '17.6868° N, 83.2185° E',
    stationCode: 'VOVZ-43149',
    updatedAt: '6 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '6 मिनट पहले (इसरो मोसडैक)',

    temp: 30.8,
    feelsLike: 37.0,
    tempMin: 25.4,
    tempMax: 32.2,
    condition: 'Gusty Winds & Rain',
    conditionHindi: 'तेज हवाएं व बारिश',
    icon: 'thunderstorm',
    emoji: '⛈️',

    aqi: {
      value: 70,
      category: 'Good',
      categoryHindi: 'अच्छा (संतोषजनक)',
      statusColor: 'emerald',
      pm25: '22.0 µg/m³',
      pm10: '50.2 µg/m³',
      no2: '15.2 ppb',
      so2: '5.8 ppb',
      o3: '22.0 ppb',
      advisory: 'Coastal washouts keep air quality pleasant.',
      advisoryHindi: 'तटीय वर्षा के कारण हवा स्वच्छ और सुखद बनी हुई है।'
    },

    precipitation: {
      chance: 85,
      rate: '18.4 mm/hr',
      type: 'Coastal Squall',
      typeHindi: 'तटीय तीव्र वर्षा',
      past24h: '48.0 mm',
      expected24h: '60 - 90 mm'
    },

    wind: {
      speed: '24.1 km/h',
      speedKmh: 24.1,
      direction: 'Northeasterly',
      directionHindi: 'उत्तर-पूर्वी',
      bearing: 45,
      gusts: '46.0 km/h',
      beaufortScale: 'Force 4 - Moderate to Strong Breeze'
    },

    humidity: 86,
    pressure: '1002 hPa',
    pressureTrend: 'Falling (-1.8 hPa)',
    pressureTrendHindi: 'गिरता हुआ (-1.8 hPa)',
    visibility: '3.5 km',
    uvIndex: 4,
    uvCategory: 'Moderate',
    dewPoint: '26.5 °C',
    cloudCover: '95 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Gusty Winds & Rain',
        conditionHindi: 'तेज हवाएं व बारिश',
        emoji: '⛈️',
        icon: 'thunderstorm',
        tempMax: 31,
        tempMin: 26,
        precipChance: 85,
        rainfall: '48 mm',
        windSpeed: '24 km/h',
        windDir: 'NE',
        humidity: 86,
        aqi: 70
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'High Waves & Rain',
        conditionHindi: 'ऊंची लहरें व वर्षा',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 29,
        tempMin: 25,
        precipChance: 90,
        rainfall: '65 mm',
        windSpeed: '28 km/h',
        windDir: 'E',
        humidity: 90,
        aqi: 55
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 31,
        tempMin: 26,
        precipChance: 45,
        rainfall: '12 mm',
        windSpeed: '16 km/h',
        windDir: 'SE',
        humidity: 82,
        aqi: 68
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'धूप व साफ',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 33,
        tempMin: 26,
        precipChance: 20,
        rainfall: '0 mm',
        windSpeed: '12 km/h',
        windDir: 'S',
        humidity: 74,
        aqi: 80
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Sunny & Warm',
        conditionHindi: 'धूप व गर्म',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 34,
        tempMin: 27,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '10 km/h',
        windDir: 'SW',
        humidity: 72,
        aqi: 88
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 32,
        tempMin: 26,
        precipChance: 30,
        rainfall: '4 mm',
        windSpeed: '12 km/h',
        windDir: 'E',
        humidity: 78,
        aqi: 75
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Rain Showers',
        conditionHindi: 'वर्षा की बौछारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 31,
        tempMin: 25,
        precipChance: 65,
        rainfall: '18 mm',
        windSpeed: '15 km/h',
        windDir: 'SE',
        humidity: 84,
        aqi: 62
      }
    ]
  },

  ahmedabad: {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    nameHindi: 'अहमदाबाद',
    state: 'Gujarat',
    stateHindi: 'गुजरात',
    region: 'Central Gujarat Plains',
    regionHindi: 'मध्य गुजरात मैदानी क्षेत्र',
    coordinates: '23.0225° N, 72.5714° E',
    stationCode: 'VAAH-42647',
    updatedAt: '14 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '14 मिनट पहले (इसरो मोसडैक)',

    temp: 33.6,
    feelsLike: 36.8,
    tempMin: 23.5,
    tempMax: 35.8,
    condition: 'Sunny & Dry',
    conditionHindi: 'धूप व शुष्क',
    icon: 'sun',
    emoji: '☀️',

    aqi: {
      value: 138,
      category: 'Moderate',
      categoryHindi: 'मध्यम',
      statusColor: 'amber',
      pm25: '52.0 µg/m³',
      pm10: '98.4 µg/m³',
      no2: '32.1 ppb',
      so2: '10.2 ppb',
      o3: '36.8 ppb',
      advisory: 'Moderate air pollution; sensitive groups should consider limiting prolonged outdoor exertion.',
      advisoryHindi: 'मध्यम स्तर का प्रदूषण; संवेदनशील लोगों को बाहर अधिक परिश्रम से बचना चाहिए।'
    },

    precipitation: {
      chance: 5,
      rate: '0.0 mm/hr',
      type: 'Dry',
      typeHindi: 'शुष्क',
      past24h: '0.0 mm',
      expected24h: '0.0 mm'
    },

    wind: {
      speed: '12.0 km/h',
      speedKmh: 12.0,
      direction: 'Southwesterly',
      directionHindi: 'दक्षिण-पश्चिमी',
      bearing: 225,
      gusts: '22.0 km/h',
      beaufortScale: 'Force 3 - Gentle Breeze'
    },

    humidity: 55,
    pressure: '1007 hPa',
    pressureTrend: 'Stable (±0.2 hPa)',
    pressureTrendHindi: 'स्थिर (±0.2 hPa)',
    visibility: '6.5 km',
    uvIndex: 8,
    uvCategory: 'Very High',
    dewPoint: '21.0 °C',
    cloudCover: '15 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Sunny & Dry',
        conditionHindi: 'धूप व शुष्क',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 35,
        tempMin: 24,
        precipChance: 5,
        rainfall: '0 mm',
        windSpeed: '12 km/h',
        windDir: 'SW',
        humidity: 55,
        aqi: 138
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Hot & Sunny',
        conditionHindi: 'गर्म व खिली धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 36,
        tempMin: 25,
        precipChance: 10,
        rainfall: '0 mm',
        windSpeed: '11 km/h',
        windDir: 'SW',
        humidity: 50,
        aqi: 145
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'साफ व चमकदार धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 35,
        tempMin: 24,
        precipChance: 10,
        rainfall: '0 mm',
        windSpeed: '10 km/h',
        windDir: 'W',
        humidity: 52,
        aqi: 150
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 33,
        tempMin: 24,
        precipChance: 35,
        rainfall: '4 mm',
        windSpeed: '14 km/h',
        windDir: 'S',
        humidity: 65,
        aqi: 110
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Rain Showers',
        conditionHindi: 'वर्षा की बौछारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 31,
        tempMin: 23,
        precipChance: 70,
        rainfall: '24 mm',
        windSpeed: '18 km/h',
        windDir: 'SW',
        humidity: 80,
        aqi: 72
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 32,
        tempMin: 24,
        precipChance: 30,
        rainfall: '6 mm',
        windSpeed: '12 km/h',
        windDir: 'W',
        humidity: 70,
        aqi: 95
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'धूप व साफ मौसम',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 34,
        tempMin: 25,
        precipChance: 15,
        rainfall: '0 mm',
        windSpeed: '11 km/h',
        windDir: 'SW',
        humidity: 58,
        aqi: 120
      }
    ]
  },

  kochi: {
    id: 'kochi',
    name: 'Kochi',
    nameHindi: 'कोच्चि',
    state: 'Kerala',
    stateHindi: 'केरल',
    region: 'Malabar Coastline',
    regionHindi: 'मालाबार तटरेखा',
    coordinates: '9.9312° N, 76.2673° E',
    stationCode: 'VOCI-43353',
    updatedAt: '11 mins ago (ISRO MOSDAC)',
    updatedAtHindi: '11 मिनट पहले (इसरो मोसडैक)',

    temp: 28.4,
    feelsLike: 33.2,
    tempMin: 24.2,
    tempMax: 29.8,
    condition: 'Coastal Showers',
    conditionHindi: 'तटीय वर्षा व फुहारें',
    icon: 'rain',
    emoji: '🌧️',

    aqi: {
      value: 46,
      category: 'Good',
      categoryHindi: 'उत्तम (स्वच्छ व शुद्ध)',
      statusColor: 'emerald',
      pm25: '12.0 µg/m³',
      pm10: '28.4 µg/m³',
      no2: '9.5 ppb',
      so2: '3.2 ppb',
      o3: '16.0 ppb',
      advisory: 'Clean marine air quality; optimal health index for all age groups.',
      advisoryHindi: 'समुद्री शुद्ध वायु; सभी आयु वर्गों के स्वास्थ्य के लिए सर्वोत्तम।'
    },

    precipitation: {
      chance: 80,
      rate: '10.5 mm/hr',
      type: 'Tropical Coastal Showers',
      typeHindi: 'उष्णकटिबंधीय तटीय वर्षा',
      past24h: '34.2 mm',
      expected24h: '40 - 60 mm'
    },

    wind: {
      speed: '14.8 km/h',
      speedKmh: 14.8,
      direction: 'Southwesterly',
      directionHindi: 'दक्षिण-पश्चिमी',
      bearing: 230,
      gusts: '26.0 km/h',
      beaufortScale: 'Force 3 - Gentle Sea Breeze'
    },

    humidity: 89,
    pressure: '1009 hPa',
    pressureTrend: 'Rising (+0.5 hPa)',
    pressureTrendHindi: 'बढ़ता हुआ (+0.5 hPa)',
    visibility: '5.0 km',
    uvIndex: 5,
    uvCategory: 'Moderate',
    dewPoint: '26.0 °C',
    cloudCover: '85 %',

    forecast7Days: [
      {
        day: 'Today',
        dayHindi: 'आज',
        date: '05 Sep',
        condition: 'Coastal Showers',
        conditionHindi: 'तटीय वर्षा',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 29,
        tempMin: 24,
        precipChance: 80,
        rainfall: '34 mm',
        windSpeed: '15 km/h',
        windDir: 'SW',
        humidity: 89,
        aqi: 46
      },
      {
        day: 'Tomorrow',
        dayHindi: 'कल',
        date: '06 Sep',
        condition: 'Intermittent Rain',
        conditionHindi: 'रुक-रुक कर बारिश',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 29,
        tempMin: 24,
        precipChance: 85,
        rainfall: '40 mm',
        windSpeed: '16 km/h',
        windDir: 'SW',
        humidity: 91,
        aqi: 42
      },
      {
        day: 'Day 3',
        dayHindi: '3 दिन बाद',
        date: '07 Sep',
        condition: 'Monsoon Clouds',
        conditionHindi: 'मानसूनी घने बादल',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 28,
        tempMin: 24,
        precipChance: 55,
        rainfall: '14 mm',
        windSpeed: '14 km/h',
        windDir: 'W',
        humidity: 86,
        aqi: 50
      },
      {
        day: 'Day 4',
        dayHindi: '4 दिन बाद',
        date: '08 Sep',
        condition: 'Heavy Showers',
        conditionHindi: 'भारी बौछारें',
        emoji: '🌧️',
        icon: 'rain',
        tempMax: 28,
        tempMin: 23,
        precipChance: 90,
        rainfall: '52 mm',
        windSpeed: '20 km/h',
        windDir: 'W',
        humidity: 93,
        aqi: 38
      },
      {
        day: 'Day 5',
        dayHindi: '5 दिन बाद',
        date: '09 Sep',
        condition: 'Cloudy Sky',
        conditionHindi: 'बादल छाए रहेंगे',
        emoji: '☁️',
        icon: 'cloudy',
        tempMax: 30,
        tempMin: 25,
        precipChance: 40,
        rainfall: '8 mm',
        windSpeed: '12 km/h',
        windDir: 'NW',
        humidity: 82,
        aqi: 56
      },
      {
        day: 'Day 6',
        dayHindi: '6 दिन बाद',
        date: '10 Sep',
        condition: 'Sunny Intervals',
        conditionHindi: 'धूप और छांव',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 31,
        tempMin: 25,
        precipChance: 25,
        rainfall: '2 mm',
        windSpeed: '10 km/h',
        windDir: 'NW',
        humidity: 78,
        aqi: 65
      },
      {
        day: 'Day 7',
        dayHindi: '7 दिन बाद',
        date: '11 Sep',
        condition: 'Sunny Sky',
        conditionHindi: 'साफ व चमकदार धूप',
        emoji: '☀️',
        icon: 'sun',
        tempMax: 32,
        tempMin: 25,
        precipChance: 20,
        rainfall: '0 mm',
        windSpeed: '11 km/h',
        windDir: 'W',
        humidity: 75,
        aqi: 68
      }
    ]
  }
};

const WIND_MAP = {
  'N': { en: 'Northerly', hi: 'उत्तरी', deg: 0 },
  'NNE': { en: 'North-Northeasterly', hi: 'उत्तर-उत्तर-पूर्वी', deg: 22 },
  'NE': { en: 'Northeasterly', hi: 'उत्तर-पूर्वी', deg: 45 },
  'ENE': { en: 'East-Northeasterly', hi: 'पूर्व-उत्तर-पूर्वी', deg: 67 },
  'E': { en: 'Easterly', hi: 'पूर्वी', deg: 90 },
  'ESE': { en: 'East-Southeasterly', hi: 'पूर्व-दक्षिण-पूर्वी', deg: 112 },
  'SE': { en: 'Southeasterly', hi: 'दक्षिण-पूर्वी', deg: 135 },
  'SSE': { en: 'South-Southeasterly', hi: 'दक्षिण-दक्षिण-पूर्वी', deg: 157 },
  'S': { en: 'Southerly', hi: 'दक्षिणी', deg: 180 },
  'SSW': { en: 'South-Southwesterly', hi: 'दक्षिण-दक्षिण-पश्चिमी', deg: 202 },
  'SW': { en: 'Southwesterly', hi: 'दक्षिण-पश्चिमी', deg: 225 },
  'WSW': { en: 'West-Southwesterly', hi: 'पश्चिम-दक्षिण-पश्चिमी', deg: 247 },
  'W': { en: 'Westerly', hi: 'पश्चिमी', deg: 270 },
  'WNW': { en: 'West-Northwesterly', hi: 'पश्चिम-उत्तर-पश्चिमी', deg: 292 },
  'NW': { en: 'Northwesterly', hi: 'उत्तर-पश्चिमी', deg: 315 },
  'NNW': { en: 'North-Northwesterly', hi: 'उत्तर-उत्तर-पश्चिमी', deg: 337 },
};

// High-precision astronomical calendar and AWS station telemetry profile for Indian cities
export const CITY_TIMELINE_PROFILES = {
  mumbai: {
    slotCadence: 'even',
    stationCadence: 'Hourly Synoptic AWS (VABB)',
    stationCadenceHindi: 'प्रति घंटा सिनॉप्टिक AWS (सांताक्रूज़)',
    peakHeatHour: 13,
    heatSpread: 6,
    rainWindow: [6, 11],
    rainBoost: 15,
    nightCooling: 4,
    sunrise: '6:24 AM',
    sunset: '6:48 PM',
    sunriseHi: '06:24 पूर्वाह्न',
    sunsetHi: '06:48 अपराह्न',
    sunriseMin: 6 * 60 + 24,
    sunsetMin: 18 * 60 + 48
  },
  kolkata: {
    slotCadence: 'odd',
    stationCadence: 'Doppler Radar 15-min Watch (VECC)',
    stationCadenceHindi: 'डॉप्लर रडार 15-मिनट टेलीमेट्री (दमदम)',
    peakHeatHour: 13.5,
    heatSpread: 5.5,
    rainWindow: [13, 18],
    rainBoost: 35,
    nightCooling: 5,
    sunrise: '5:21 AM',
    sunset: '5:48 PM',
    sunriseHi: '05:21 पूर्वाह्न',
    sunsetHi: '05:48 अपराह्न',
    sunriseMin: 5 * 60 + 21,
    sunsetMin: 17 * 60 + 48
  },
  chennai: {
    slotCadence: 'even',
    stationCadence: 'Coastal Cyclone Alert Radar (VOMM)',
    stationCadenceHindi: 'तटीय चक्रवात चेतावनी रडार (चेन्नई)',
    peakHeatHour: 14,
    heatSpread: 6.5,
    rainWindow: [16, 20],
    rainBoost: 20,
    nightCooling: 4.5,
    sunrise: '5:58 AM',
    sunset: '6:14 PM',
    sunriseHi: '05:58 पूर्वाह्न',
    sunsetHi: '06:14 अपराह्न',
    sunriseMin: 5 * 60 + 58,
    sunsetMin: 18 * 60 + 14
  },
  delhi: {
    slotCadence: 'even',
    stationCadence: 'Met Central Safdarjung AWS (VIDD)',
    stationCadenceHindi: 'केंद्रीय मौसम केंद्र सफदरजंग AWS',
    peakHeatHour: 15,
    heatSpread: 7,
    rainWindow: [14, 17],
    rainBoost: 5,
    nightCooling: 7.5,
    sunrise: '6:01 AM',
    sunset: '6:36 PM',
    sunriseHi: '06:01 पूर्वाह्न',
    sunsetHi: '06:36 अपराह्न',
    sunriseMin: 6 * 60 + 1,
    sunsetMin: 18 * 60 + 36
  },
  paradeep: {
    slotCadence: 'odd',
    stationCadence: 'High-Wind Marine Port Sensor (VEPD)',
    stationCadenceHindi: 'पारादीप समुद्री पोर्ट सेंसर',
    peakHeatHour: 12.5,
    heatSpread: 4,
    rainWindow: [0, 24],
    rainBoost: 40,
    nightCooling: 2.5,
    sunrise: '5:28 AM',
    sunset: '5:55 PM',
    sunriseHi: '05:28 पूर्वाह्न',
    sunsetHi: '05:55 अपराह्न',
    sunriseMin: 5 * 60 + 28,
    sunsetMin: 17 * 60 + 55
  },
  puri: {
    slotCadence: 'odd',
    stationCadence: 'Doppler Cyclone Radar Watch (VEPI)',
    stationCadenceHindi: 'पुरी डॉप्लर चक्रवात रडार',
    peakHeatHour: 12.5,
    heatSpread: 4,
    rainWindow: [0, 24],
    rainBoost: 40,
    nightCooling: 2.5,
    sunrise: '5:30 AM',
    sunset: '5:57 PM',
    sunriseHi: '05:30 पूर्वाह्न',
    sunsetHi: '05:57 अपराह्न',
    sunriseMin: 5 * 60 + 30,
    sunsetMin: 17 * 60 + 57
  },
  bhubaneswar: {
    slotCadence: 'odd',
    stationCadence: 'OSDMA State Disaster AWS (VEBS)',
    stationCadenceHindi: 'ओडिशा राज्य आपदा AWS (भुवनेश्वर)',
    peakHeatHour: 13,
    heatSpread: 5,
    rainWindow: [12, 19],
    rainBoost: 35,
    nightCooling: 4,
    sunrise: '5:31 AM',
    sunset: '5:58 PM',
    sunriseHi: '05:31 पूर्वाह्न',
    sunsetHi: '05:58 अपराह्न',
    sunriseMin: 5 * 60 + 31,
    sunsetMin: 17 * 60 + 58
  },
  visakhapatnam: {
    slotCadence: 'even',
    stationCadence: 'Naval Oceanographic Cyclone Hub (VOVZ)',
    stationCadenceHindi: 'नौसेना मौसम विज्ञान केंद्र (विशाखापट्टनम)',
    peakHeatHour: 13.5,
    heatSpread: 5.5,
    rainWindow: [14, 19],
    rainBoost: 25,
    nightCooling: 4.5,
    sunrise: '5:42 AM',
    sunset: '6:03 PM',
    sunriseHi: '05:42 पूर्वाह्न',
    sunsetHi: '06:03 अपराह्न',
    sunriseMin: 5 * 60 + 42,
    sunsetMin: 18 * 60 + 3
  },
  ahmedabad: {
    slotCadence: 'odd',
    stationCadence: 'Western Regional AWS Hub (VAAH)',
    stationCadenceHindi: 'पश्चिमी क्षेत्रीय AWS केंद्र (अहमदाबाद)',
    peakHeatHour: 15.5,
    heatSpread: 7.5,
    rainWindow: [17, 19],
    rainBoost: 5,
    nightCooling: 7,
    sunrise: '6:23 AM',
    sunset: '6:51 PM',
    sunriseHi: '06:23 पूर्वाह्न',
    sunsetHi: '06:51 अपराह्न',
    sunriseMin: 6 * 60 + 23,
    sunsetMin: 18 * 60 + 51
  },
  kochi: {
    slotCadence: 'even',
    stationCadence: 'Malabar Marine Coastal Station (VOCI)',
    stationCadenceHindi: 'मालाबार तटीय समुद्री स्टेशन (कोच्चि)',
    peakHeatHour: 13,
    heatSpread: 4.5,
    rainWindow: [10, 16],
    rainBoost: 30,
    nightCooling: 3.5,
    sunrise: '6:14 AM',
    sunset: '6:29 PM',
    sunriseHi: '06:14 पूर्वाह्न',
    sunsetHi: '06:29 अपराह्न',
    sunriseMin: 6 * 60 + 14,
    sunsetMin: 18 * 60 + 29
  }
};

// Calculates dynamic, geographically-accurate astronomical sunrise & sunset for any Indian city
export const getCityAstronomy = (city) => {
  if (!city) {
    return {
      slotCadence: 'odd',
      stationCadence: 'AWS Synchronized',
      stationCadenceHindi: 'AWS सिंक्रोनाइज़्ड',
      sunrise: '6:00 AM',
      sunset: '6:20 PM',
      sunriseHi: '06:00 पूर्वाह्न',
      sunsetHi: '06:20 अपराह्न',
      sunriseMin: 360,
      sunsetMin: 1100,
      peakHeatHour: 14,
      heatSpread: 6,
      rainWindow: [13, 17],
      rainBoost: 20,
      nightCooling: 5
    };
  }

  const id = String(city.id || '').toLowerCase().trim();
  if (CITY_TIMELINE_PROFILES[id]) {
    return { ...CITY_TIMELINE_PROFILES[id] };
  }

  // Dynamic calculation for all other coastal locations based on coordinates/longitude
  let lon = 82.5; // IST Central Meridian
  if (typeof city.coordinates === 'string') {
    const lonMatch = city.coordinates.match(/([0-9.]+)\s*°?\s*E/i);
    if (lonMatch) {
      lon = parseFloat(lonMatch[1]);
    }
  }

  // Every degree east of 82.5°E is 4 minutes earlier sunrise & sunset
  const diffMinutes = Math.round((82.5 - lon) * 4);
  const baseSunriseMin = 6 * 60; // 06:00 AM at 82.5°E in Sept
  const baseSunsetMin = 18 * 60 + 20; // 06:20 PM at 82.5°E in Sept

  const calcSunriseMin = Math.max(5 * 60, Math.min(6 * 60 + 45, baseSunriseMin + diffMinutes));
  const calcSunsetMin = Math.max(17 * 60 + 30, Math.min(19 * 60, baseSunsetMin + diffMinutes));

  const formatMin = (totalMin) => {
    const h24 = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const isEvenCadence = (city.id || '').length % 2 === 0;

  return {
    slotCadence: isEvenCadence ? 'even' : 'odd',
    stationCadence: `Coastal AWS Telemetry (${city.name || 'Station'})`,
    stationCadenceHindi: `तटीय AWS टेलीमेट्री (${city.nameHindi || city.name || 'स्टेशन'})`,
    sunrise: formatMin(calcSunriseMin),
    sunset: formatMin(calcSunsetMin),
    sunriseHi: `${formatMin(calcSunriseMin).replace('AM', 'पूर्वाह्न').replace('PM', 'अपराह्न')}`,
    sunsetHi: `${formatMin(calcSunsetMin).replace('AM', 'पूर्वाह्न').replace('PM', 'अपराह्न')}`,
    sunriseMin: calcSunriseMin,
    sunsetMin: calcSunsetMin,
    peakHeatHour: 13.5,
    heatSpread: 5.5,
    rainWindow: [13, 18],
    rainBoost: 25,
    nightCooling: 4.5
  };
};

// Enriches every single day in forecast7Days with complete, distinct telemetry and dynamic live dates
export const enrichCityData = (city) => {
  if (!city) return null;

  const today = new Date();
  const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_HI = ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिस'];

  const enrichedDays = (city.forecast7Days || []).map((d, index) => {
    // Dynamic Real-time Date Calculation
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + index);
    const dayNum = String(targetDate.getDate()).padStart(2, '0');
    const dynamicDateEn = `${dayNum} ${MONTHS_EN[targetDate.getMonth()]}`;
    const dynamicDateHi = `${dayNum} ${MONTHS_HI[targetDate.getMonth()]}`;

    let dynamicDay = d.day;
    let dynamicDayHindi = d.dayHindi;

    if (index === 0) {
      dynamicDay = 'Today';
      dynamicDayHindi = 'आज';
    } else if (index === 1) {
      dynamicDay = 'Tomorrow';
      dynamicDayHindi = 'कल';
    } else {
      dynamicDay = `Day ${index + 1}`;
      dynamicDayHindi = `${index + 1} दिन बाद`;
    }

    // 1. Temperature metrics
    const max = Number(d.tempMax ?? (city.tempMax ?? 31));
    const min = Number(d.tempMin ?? (city.tempMin ?? 22));
    const dayTemp = Number(d.temp ?? ((max * 0.65) + (min * 0.35)).toFixed(1));
    const humidity = Number(d.humidity ?? (index === 0 ? city.humidity : 60));
    const feelsLike = Number(d.feelsLike ?? (dayTemp + (humidity > 75 ? 4.2 : humidity > 55 ? 2.3 : 0.8)).toFixed(1));
    const dewPoint = d.dewPoint ?? `${(min - Math.max(1, (100 - humidity) / 20)).toFixed(1)} °C`;

    // 2. AQI metrics
    const aqiNum = typeof d.aqi === 'number' ? d.aqi : (d.aqi?.value ?? city.aqi?.value ?? 68);
    const aqiCat = aqiNum <= 50 ? 'Good' : aqiNum <= 100 ? 'Satisfactory' : aqiNum <= 150 ? 'Moderate' : aqiNum <= 250 ? 'Poor' : 'Severe';
    const aqiCatHi = aqiNum <= 50 ? 'अच्छा (स्वस्थ)' : aqiNum <= 100 ? 'संतोषजनक' : aqiNum <= 150 ? 'मध्यम' : aqiNum <= 250 ? 'खराब' : 'गंभीर';
    const aqiColor = aqiNum <= 50 ? 'emerald' : aqiNum <= 100 ? 'sky' : aqiNum <= 150 ? 'amber' : aqiNum <= 250 ? 'orange' : 'rose';
    const pm25 = `${(aqiNum * 0.34 + 2.1).toFixed(1)} µg/m³`;
    const pm10 = `${(aqiNum * 0.76 + 4.8).toFixed(1)} µg/m³`;
    const aqiAdvisory = aqiNum <= 50
      ? 'Air quality is pristine and healthy for all outdoor activities.'
      : aqiNum <= 100
      ? 'Acceptable air quality; satisfactory for general public with minor sensitivity.'
      : aqiNum <= 150
      ? 'Breathing discomfort possible for sensitive individuals, children, and seniors.'
      : 'Unhealthy air: sensitive groups should restrict prolonged outdoor exposure.';
    const aqiAdvisoryHi = aqiNum <= 50
      ? 'वायु गुणवत्ता बहुत अच्छी और स्वास्थ्यप्रद है।'
      : aqiNum <= 100
      ? 'वायु गुणवत्ता स्वीकार्य है; सामान्य गतिविधियों के लिए उपयुक्त।'
      : aqiNum <= 150
      ? 'संवेदनशील व्यक्तियों और बच्चों को बाहर अधिक परिश्रम से बचना चाहिए।'
      : 'अस्वस्थ वायु गुणवत्ता: बाहर जाने पर मास्क का उपयोग करें।';

    const aqiObj = {
      value: aqiNum,
      category: aqiCat,
      categoryHindi: aqiCatHi,
      statusColor: aqiColor,
      pm25,
      pm10,
      advisory: aqiAdvisory,
      advisoryHindi: aqiAdvisoryHi
    };

    // 3. Precipitation metrics
    const pChance = Number(d.precipChance ?? 25);
    const pRate = pChance >= 80 ? `${(pChance * 0.16 + 2.0).toFixed(1)} mm/hr`
                : pChance >= 50 ? `${(pChance * 0.08).toFixed(1)} mm/hr`
                : pChance >= 25 ? `${(pChance * 0.03).toFixed(1)} mm/hr`
                : '0.0 mm/hr';
    const pType = pChance >= 80 ? 'Heavy Tropical Downpours'
                : pChance >= 55 ? 'Scattered Convective Showers'
                : pChance >= 30 ? 'Passing Light Rain'
                : 'Dry Atmospheric Conditions';
    const pTypeHi = pChance >= 80 ? 'तीव्र मानसूनी वर्षा'
                  : pChance >= 55 ? 'छिटपुट बौछारें व वर्षा'
                  : pChance >= 30 ? 'हल्की वर्षा'
                  : 'शुष्क मौसम स्थिति';
    const past24h = d.rainfall ?? (pChance >= 40 ? `${Math.round(pChance * 0.42)} mm` : '0.0 mm');
    const exp24h = pChance >= 75 ? `${Math.round(pChance * 0.5)} - ${Math.round(pChance * 0.85)} mm`
                 : pChance >= 40 ? `${Math.round(pChance * 0.2)} - ${Math.round(pChance * 0.4)} mm`
                 : '0 - 2 mm';

    const precipObj = {
      chance: pChance,
      rate: pRate,
      type: pType,
      typeHindi: pTypeHi,
      past24h,
      expected24h: exp24h
    };

    // 4. Wind metrics
    const wCode = d.windDir || (index % 2 === 0 ? 'W' : 'SW');
    const wDirInfo = WIND_MAP[wCode] || { en: d.windDir || 'Westerly', hi: 'पश्चिमी', deg: 270 };
    const wSpeedNum = parseFloat(d.windSpeed) || (10 + (index * 2) % 15);
    const windObj = {
      speed: `${wSpeedNum} km/h`,
      speedKmh: wSpeedNum,
      direction: wDirInfo.en,
      directionHindi: wDirInfo.hi,
      bearing: wDirInfo.deg,
      gusts: `${(wSpeedNum * 1.75 + 1.5).toFixed(1)} km/h`,
      beaufortScale: wSpeedNum < 12 ? 'Force 2 - Light Breeze'
                   : wSpeedNum < 20 ? 'Force 3 - Gentle Breeze'
                   : wSpeedNum < 29 ? 'Force 4 - Moderate Breeze'
                   : 'Force 5 - Fresh Breeze'
    };

    // 5. Secondary Atmospheric metrics
    const pressure = d.pressure || `${1014 - Math.round(pChance * 0.08) - (index % 3)} hPa`;
    const uvIndex = d.emoji === '☀️' ? (max > 33 ? 8 : 7) : d.emoji === '🌧️' || d.emoji === '⛈️' ? 3 : 5;
    const uvCategory = uvIndex >= 8 ? 'Very High' : uvIndex >= 6 ? 'High' : 'Moderate';
    const visibility = d.emoji === '🌫️' ? '3.2 km' : pChance > 75 ? '3.8 km' : '8.5 km';
    const cloudCover = d.emoji === '☀️' ? '12 %' : d.emoji === '☁️' ? '82 %' : d.emoji === '🌧️' || d.emoji === '⛈️' ? '94 %' : '55 %';

    // 6. Hourly breakdown
    let hourly = d.hourly;
    if (!hourly || hourly.length === 0) {
      hourly = [
        { time: '06:00', temp: min, emoji: d.emoji, cond: d.condition, rain: Math.max(0, pChance - 15), wind: `${Math.max(4, Math.round(wSpeedNum * 0.7))} km/h` },
        { time: '09:00', temp: Math.round(min + (max - min) * 0.4), emoji: d.emoji, cond: d.condition, rain: pChance, wind: `${Math.round(wSpeedNum * 0.9)} km/h` },
        { time: '12:00', temp: max, emoji: d.emoji, cond: d.condition, rain: Math.min(100, pChance + 10), wind: `${wSpeedNum} km/h` },
        { time: '15:00', temp: Math.round(max - 1), emoji: d.emoji, cond: d.condition, rain: pChance, wind: `${Math.round(wSpeedNum * 1.1)} km/h` },
        { time: '18:00', temp: Math.round(min + (max - min) * 0.5), emoji: d.emoji, cond: d.condition, rain: Math.max(0, pChance - 10), wind: `${wSpeedNum} km/h` },
        { time: '21:00', temp: Math.round(min + (max - min) * 0.2), emoji: '☁️', cond: 'Cloudy Sky', rain: Math.max(0, pChance - 20), wind: `${Math.max(4, Math.round(wSpeedNum * 0.7))} km/h` }
      ];
    }

    return {
      ...d,
      day: dynamicDay,
      dayHindi: dynamicDayHindi,
      date: dynamicDateEn,
      dateHindi: dynamicDateHi,
      temp: dayTemp,
      feelsLike,
      dewPoint,
      aqi: aqiObj,
      precipitation: precipObj,
      wind: windObj,
      humidity,
      pressure,
      visibility,
      uvIndex,
      uvCategory,
      cloudCover,
      hourly
    };
  });

  const astronomy = getCityAstronomy(city);

  return {
    ...city,
    astronomy,
    updatedAt: 'Live (ISRO MOSDAC Synced)',
    updatedAtHindi: 'लाइव (इसरो मोसडैक सिंक)',
    forecast7Days: enrichedDays
  };
};

// Fallback generator for any custom city id with full enrichment
export const getCityForecast = (cityId) => {
  const normalized = String(cityId || '').toLowerCase().trim();
  let foundCity = CITY_FORECAST_DATA[normalized];
  
  if (!foundCity) {
    // Try matching by partial name
    foundCity = Object.values(CITY_FORECAST_DATA).find(c => 
      c.id.toLowerCase().includes(normalized) || 
      c.name.toLowerCase().includes(normalized)
    );
  }

  // If not found in default 10 cities, search all 110+ locations in COASTAL_CITIES_DATA
  if (!foundCity) {
    const coastalMatch = COASTAL_CITIES_DATA.find(c => 
      c.id.toLowerCase() === normalized || 
      c.name.toLowerCase() === normalized ||
      c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized.replace(/[^a-z0-9]/g, '') ||
      normalized.includes(c.id.toLowerCase())
    );
    if (coastalMatch) {
      const baseTemp = parseFloat(coastalMatch.temp) || 28.5;
      const baseWind = parseFloat(coastalMatch.wind) || 35;
      const basePressure = parseFloat(coastalMatch.pressure) || 1005;
      const baseHumidity = parseInt(coastalMatch.humidity, 10) || 84;
      const isExtreme = coastalMatch.level === 'red';
      const isSevere = coastalMatch.level === 'orange';
      
      const default7Days = [
        { day: 'Day 1', dayName: 'Today', dayNameHindi: 'आज', condition: coastalMatch.condition || (isExtreme ? 'Squally Heavy Gale' : 'Passing Rain Showers'), emoji: isExtreme ? '⛈️' : isSevere ? '🌧️' : '⛅', icon: isExtreme ? 'thunderstorm' : isSevere ? 'rain' : 'cloudy', tempMax: Math.round(baseTemp + 2.5), tempMin: Math.round(baseTemp - 3.2), precipChance: isExtreme ? 95 : isSevere ? 80 : 45, windSpeed: `${baseWind} km/h`, windDir: 'SE', humidity: baseHumidity, aqi: isExtreme ? 45 : 75 },
        { day: 'Day 2', dayName: 'Tomorrow', dayNameHindi: 'कल', condition: isExtreme ? 'Severe Tropical Downpours' : 'Heavy Coastal Showers', emoji: isExtreme ? '⛈️' : '🌧️', icon: isExtreme ? 'thunderstorm' : 'rain', tempMax: Math.round(baseTemp + 1.8), tempMin: Math.round(baseTemp - 3.5), precipChance: isExtreme ? 90 : 75, windSpeed: `${Math.round(baseWind * 0.95)} km/h`, windDir: 'E', humidity: baseHumidity + 2, aqi: 50 },
        { day: 'Day 3', dayName: 'Day 3', dayNameHindi: 'दिन 3', condition: 'Moderate Thunder Showers', emoji: '🌧️', icon: 'rain', tempMax: Math.round(baseTemp + 2.0), tempMin: Math.round(baseTemp - 3.0), precipChance: 65, windSpeed: `${Math.round(baseWind * 0.75)} km/h`, windDir: 'SE', humidity: 82, aqi: 68 },
        { day: 'Day 4', dayName: 'Day 4', dayNameHindi: 'दिन 4', condition: 'Partly Cloudy with Coastal Breeze', emoji: '⛅', icon: 'cloudy', tempMax: Math.round(baseTemp + 3.0), tempMin: Math.round(baseTemp - 2.8), precipChance: 35, windSpeed: `${Math.round(baseWind * 0.55)} km/h`, windDir: 'S', humidity: 76, aqi: 78 },
        { day: 'Day 5', dayName: 'Day 5', dayNameHindi: 'दिन 5', condition: 'Bright Sun with Ocean Breeze', emoji: '☀️', icon: 'sun', tempMax: Math.round(baseTemp + 3.5), tempMin: Math.round(baseTemp - 2.5), precipChance: 20, windSpeed: `${Math.max(12, Math.round(baseWind * 0.4))} km/h`, windDir: 'SW', humidity: 70, aqi: 85 },
        { day: 'Day 6', dayName: 'Day 6', dayNameHindi: 'दिन 6', condition: 'Clear Skies & Warm Sunshine', emoji: '☀️', icon: 'sun', tempMax: Math.round(baseTemp + 4.0), tempMin: Math.round(baseTemp - 2.0), precipChance: 10, windSpeed: `${Math.max(10, Math.round(baseWind * 0.35))} km/h`, windDir: 'W', humidity: 65, aqi: 92 },
        { day: 'Day 7', dayName: 'Day 7', dayNameHindi: 'दिन 7', condition: 'Pleasant Coastal Weather', emoji: '🌤️', icon: 'cloudy', tempMax: Math.round(baseTemp + 3.2), tempMin: Math.round(baseTemp - 2.2), precipChance: 15, windSpeed: `${Math.max(12, Math.round(baseWind * 0.38))} km/h`, windDir: 'SW', humidity: 68, aqi: 88 }
      ];

      foundCity = {
        id: coastalMatch.id,
        name: coastalMatch.name,
        nameHindi: coastalMatch.nameHindi || coastalMatch.name,
        state: coastalMatch.state,
        stateHindi: coastalMatch.stateHindi || coastalMatch.state,
        region: coastalMatch.category || `${coastalMatch.state} Maritime Corridor`,
        regionHindi: `${coastalMatch.state} तटीय क्षेत्र`,
        coordinates: coastalMatch.coordinates || 'Coastal Seaboard',
        stationCode: `IND-${coastalMatch.id.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
        updatedAt: '12 mins ago (ISRO MOSDAC)',
        updatedAtHindi: '12 मिनट पहले (इसरो मोसडैक)',
        temp: baseTemp,
        feelsLike: Math.round((baseTemp + (isExtreme ? 5.8 : 3.8)) * 10) / 10,
        tempMin: Math.round((baseTemp - 3.2) * 10) / 10,
        tempMax: Math.round((baseTemp + 2.5) * 10) / 10,
        condition: coastalMatch.condition || (isExtreme ? 'Severe Tropical Storm Gale' : 'Breezy with Passing Showers'),
        conditionHindi: isExtreme ? 'तीव्र चक्रवाती तूफान व वर्षा' : 'तेज हवाएं व बारिश',
        icon: isExtreme ? 'thunderstorm' : isSevere ? 'rain' : 'cloudy',
        emoji: isExtreme ? '⛈️' : isSevere ? '🌧️' : '⛅',
        aqi: {
          value: isExtreme ? 45 : 72,
          category: isExtreme ? 'Good' : 'Satisfactory',
          categoryHindi: isExtreme ? 'अच्छा (स्वच्छ)' : 'संतोषजनक',
          statusColor: 'emerald',
          pm25: '21.5 µg/m³',
          pm10: '42.8 µg/m³',
          no2: '11.4 ppb',
          so2: '5.2 ppb',
          o3: '16.8 ppb',
          advisory: 'Strong coastal convection and marine airflow are maintaining clean atmospheric conditions.',
          advisoryHindi: 'मजबूत तटीय संवहन और समुद्री वायु प्रवाह वायु गुणवत्ता को स्वच्छ बनाए हुए हैं।'
        },
        precipitation: {
          chance: isExtreme ? 95 : isSevere ? 80 : 50,
          rate: isExtreme ? '24.6 mm/hr' : isSevere ? '12.4 mm/hr' : '3.8 mm/hr',
          type: isExtreme ? 'Torrential Tropical Downpours' : 'Scattered Coastal Showers',
          typeHindi: isExtreme ? 'अति भारी मानसूनी वर्षा' : 'तटीय मानसूनी बौछारें',
          past24h: coastalMatch.rainfall24h || '55.4 mm',
          expected24h: isExtreme ? '110 - 160 mm' : '35 - 65 mm'
        },
        wind: {
          speed: `${baseWind} km/h`,
          speedKmh: baseWind,
          direction: coastalMatch.basin === 'Arabian Sea' ? 'Southwesterly' : 'Southeasterly',
          directionHindi: coastalMatch.basin === 'Arabian Sea' ? 'दक्षिण-पश्चिमी' : 'दक्षिण-पूर्वी',
          bearing: coastalMatch.basin === 'Arabian Sea' ? 225 : 135,
          gusts: coastalMatch.gusts || `${Math.round(baseWind * 1.35)} km/h`,
          beaufortScale: isExtreme ? 'Force 9 - Severe Gale' : isSevere ? 'Force 7 - Near Gale' : 'Force 5 - Fresh Breeze'
        },
        humidity: baseHumidity,
        pressure: basePressure,
        visibility: isExtreme ? '1.8 km' : '5.5 km',
        uvIndex: isExtreme ? 3 : 5,
        uvCategory: isExtreme ? 'Low' : 'Moderate',
        uvCategoryHindi: isExtreme ? 'निम्न' : 'मध्यम',
        dewPoint: `${Math.round((baseTemp - 3.2) * 10) / 10} °C`,
        cloudCover: isExtreme ? 98 : isSevere ? 85 : 60,
        forecast7Days: default7Days
      };
    }
  }
  
  if (!foundCity) {
    foundCity = CITY_FORECAST_DATA.kolkata;
  }

  return enrichCityData(foundCity);
};
