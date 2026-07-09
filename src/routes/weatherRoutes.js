const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");

// Rute Informasi Cuaca Umum
router.get("/current", weatherController.getWeatherByCity);
router.get("/forecast", weatherController.getWeatherForecastByCity);

// Rute Cuaca spesifik Hotel berdasarkan ID Hotel
router.get("/hotels/:hotelId", weatherController.getHotelWeather);

module.exports = router;
