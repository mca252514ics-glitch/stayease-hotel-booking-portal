const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBooking,
  cancelBooking,
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/:reference", getBooking);
router.patch("/:reference/cancel", cancelBooking);

module.exports = router;
