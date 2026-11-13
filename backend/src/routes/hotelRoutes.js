const express = require("express");
const router = express.Router();

const {
  getHotels,
  getHotelDetails,
  searchHotels,
} = require("../controllers/hotelController");

// Keep search route before /:id
router.get("/search", searchHotels);
router.get("/", getHotels);
router.get("/:id", getHotelDetails);

module.exports = router;
