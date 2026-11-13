const express = require("express");
const router = express.Router();
const { askHotelAssistant } = require("../controllers/hotelAiController");

router.post("/hotels", askHotelAssistant);

module.exports = router;
