const { Hotel } = require("../models");

exports.getWeatherByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'city' wajib dilampirkan",
        data: null,
      });
    }

    const apiKey =
      process.env.OPENWEATHER_API_KEY || "27284d23816c11099d78188088b98439";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city,
    )}&appid=${apiKey}&units=metric&lang=id`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message:
          data.message || "Gagal mengambil data cuaca dari OpenWeatherMap",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Berhasil mengambil cuaca untuk kota ${city}`,
      data: {
        city: data.name,
        country: data.sys.country,
        weather: data.weather[0].main,
        description: data.weather[0].description,
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        temp: data.main.temp,
        tempFeelsLike: data.main.feels_like,
        tempMin: data.main.temp_min,
        tempMax: data.main.temp_max,
        pressure: data.main.pressure,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      },
    });
  } catch (error) {
    console.error("Error Get Weather by City:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.getWeatherForecastByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'city' wajib dilampirkan",
        data: null,
      });
    }

    const apiKey =
      process.env.OPENWEATHER_API_KEY || "27284d23816c11099d78188088b98439";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city,
    )}&appid=${apiKey}&units=metric&lang=id`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message:
          data.message || "Gagal mengambil perkiraan cuaca dari OpenWeatherMap",
        data: null,
      });
    }

    // Ambil ramalan cuaca unik harian (misal data setiap jam 12:00 siang)
    const dailyForecasts = data.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .map((item) => ({
        date: item.dt_txt.split(" ")[0],
        temp: item.main.temp,
        weather: item.weather[0].main,
        description: item.weather[0].description,
        iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        humidity: item.main.humidity,
      }));

    return res.status(200).json({
      success: true,
      message: `Berhasil mengambil perkiraan cuaca 5 hari untuk kota ${city}`,
      data: {
        city: data.city.name,
        country: data.city.country,
        forecasts: dailyForecasts,
      },
    });
  } catch (error) {
    console.error("Error Get Weather Forecast:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

exports.getHotelWeather = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({ _id: hotelId, isDeleted: false });
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel tidak ditemukan",
        data: null,
      });
    }

    const city = hotel.city;
    const apiKey =
      process.env.OPENWEATHER_API_KEY || "27284d23816c11099d78188088b98439";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city,
    )}&appid=${apiKey}&units=metric&lang=id`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message:
          data.message || "Gagal mengambil data cuaca dari OpenWeatherMap",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Berhasil mengambil cuaca untuk hotel ${hotel.name} di kota ${city}`,
      data: {
        hotelName: hotel.name,
        city: hotel.city,
        weather: data.weather[0].main,
        description: data.weather[0].description,
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        temp: data.main.temp,
        tempFeelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      },
    });
  } catch (error) {
    console.error("Error Get Hotel Weather:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};
