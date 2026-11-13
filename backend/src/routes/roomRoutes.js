
const express = require("express");
const router = express.Router();

const {
  getRoomAvailability
} = require("../controllers/roomController");

router.get("/:roomId/availability", getRoomAvailability);

module.exports = router;
