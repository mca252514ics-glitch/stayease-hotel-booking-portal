const roomService = require("../services/roomService");

// Validate YYYY-MM-DD and reject impossible dates.
const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

// GET /api/rooms/:roomId/availability
const getRoomAvailability = async (req, res) => {
  try {
    const roomId = Number(req.params.roomId);
    const { checkIn, checkOut } = req.query;

    // Validate room ID
    if (!Number.isSafeInteger(roomId) || roomId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    // Validate required dates
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Check-in and check-out dates are required",
      });
    }

    // Validate date format and actual calendar dates
    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      return res.status(400).json({
        success: false,
        message: "Dates must be valid and use YYYY-MM-DD format",
      });
    }

    // Check-out must be after check-in
    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const result = await roomService.checkRoomAvailability(
      roomId,
      checkIn,
      checkOut,
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Use the database's current date to avoid relying on
    // a potentially different application-server timezone.
    if (checkIn < String(result.database_today).slice(0, 10)) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past",
      });
    }

    // Remove internal date field from the API response
    const { database_today, ...response } = result;

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Room availability error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to check room availability",
    });
  }
};

module.exports = {
  getRoomAvailability,
};
