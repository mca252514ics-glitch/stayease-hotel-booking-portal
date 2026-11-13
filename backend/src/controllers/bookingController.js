const bookingService = require("../services/bookingService");

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

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { roomId, customerName, email, checkIn, checkOut } = req.body;

    if (
      !roomId ||
      !customerName?.trim() ||
      !email?.trim() ||
      !checkIn ||
      !checkOut
    ) {
      return res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
    }

    const parsedRoomId = Number(roomId);

    if (!Number.isSafeInteger(parsedRoomId) || parsedRoomId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    const name = customerName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (name.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Customer name cannot exceed 150 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (normalizedEmail.length > 255 || !emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid dates in YYYY-MM-DD format",
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in",
      });
    }

    const booking = await bookingService.createBooking({
      roomId: parsedRoomId,
      customerName: name,
      email: normalizedEmail,
      checkIn,
      checkOut,
    });

    return res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to create booking",
    });
  }
};

// GET /api/bookings/:reference?email=customer@example.com
const getBooking = async (req, res) => {
  try {
    const reference = req.params.reference?.trim();
    const email = req.query.email?.trim();

    if (!reference || !email) {
      return res.status(400).json({
        success: false,
        message: "Booking reference and email are required",
      });
    }

    const booking = await bookingService.getBookingByReference(
      reference,
      email,
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found. Check your reference and email.",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve booking",
    });
  }
};

// PATCH /api/bookings/:reference/cancel

const cancelBooking = async (req, res) => {
  try {
    const reference = req.params.reference?.trim();
    const email = req.body?.email?.trim();

    if (!reference || !email) {
      return res.status(400).json({
        success: false,
        message: "Booking reference and email are required"
      });
    }

    const result = await bookingService.cancelBooking(
      reference,
      email
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: result
    });

  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to cancel booking"
    });
  }
};


module.exports = {
  createBooking,
  getBooking,
  cancelBooking,
};
