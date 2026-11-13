const { pool } = require("../config/db");
const crypto = require("crypto");

// Generate a unique booking reference
const generateBookingReference = () => {
  return `HTL-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
};

// Create a booking for exactly one room
const createBooking = async ({
  roomId,
  customerName,
  email,
  checkIn,
  checkOut,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the room row. Other booking requests for this
    // room must wait until this transaction completes.
    const [roomRows] = await connection.execute(
      ` SELECT
            r.id,
            r.hotel_id,
            h.name AS hotel_name,
            r.category,
            r.price_per_night,
            r.total_rooms
        FROM rooms r
        INNER JOIN hotels h ON h.id = r.hotel_id
        WHERE r.id = ?
        FOR UPDATE`,
      [roomId],
    );

    if (roomRows.length === 0) {
      const error = new Error("Room not found");
      error.statusCode = 404;
      throw error;
    }

    const room = roomRows[0];

    // Validate against the database's current date.
    const [dateRows] = await connection.query(
      "SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today",
    );

    if (checkIn < dateRows[0].today) {
      const error = new Error("Check-in date cannot be in the past");
      error.statusCode = 400;
      throw error;
    }

    // Count overlapping confirmed bookings again inside
    // the transaction. Never trust an earlier availability check.
    const [bookingRows] = await connection.execute(
      `SELECT COUNT(*) AS booked_rooms
       FROM bookings
       WHERE room_id = ?
         AND status = 'CONFIRMED'
         AND check_in < ?
         AND check_out > ?`,
      [roomId, checkOut, checkIn],
    );

    const bookedRooms = Number(bookingRows[0].booked_rooms);
    const availableRooms = Number(room.total_rooms) - bookedRooms;

    if (availableRooms <= 0) {
      const error = new Error("Room is not available for these dates");
      error.statusCode = 409;
      throw error;
    }

    // Calculate the number of nights using UTC dates.
    const start = new Date(`${checkIn}T00:00:00Z`);
    const end = new Date(`${checkOut}T00:00:00Z`);
    const nights = (end - start) / (1000 * 60 * 60 * 24);

    // Use integer paise for accurate money calculation.
    const priceInPaise = Math.round(Number(room.price_per_night) * 100);

    const totalInPaise = priceInPaise * nights;
    const totalAmount = (totalInPaise / 100).toFixed(2);

    const bookingReference = generateBookingReference();

    // Save the booking
    const [result] = await connection.execute(
      `INSERT INTO bookings (
         booking_reference,
         room_id,
         customer_name,
         email,
         check_in,
         check_out,
         total_amount,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [
        bookingReference,
        roomId,
        customerName,
        email,
        checkIn,
        checkOut,
        totalAmount,
      ],
    );

    await connection.commit();

    return {
      booking_id: result.insertId,
      booking_reference: bookingReference,
      customer_name: customerName,
      email,
      hotel_name: room.hotel_name,
      room_category: room.category,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      price_per_night: (priceInPaise / 100).toFixed(2),
      total_amount: totalAmount,
      status: "CONFIRMED",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Retrieve a booking using reference and email
const getBookingByReference = async (reference, email) => {
  const [rows] = await pool.execute(
    `SELECT
       b.id,
       b.booking_reference,
       b.customer_name,
       b.email,
       b.check_in,
       b.check_out,
       b.total_amount,
       b.status,
       b.created_at,
       h.name AS hotel_name,
       h.location,
       r.category,
       r.price_per_night
     FROM bookings b
     INNER JOIN rooms r ON b.room_id = r.id
     INNER JOIN hotels h ON r.hotel_id = h.id
     WHERE b.booking_reference = ?
       AND LOWER(b.email) = LOWER(?)`,
    [reference, email],
  );

  return rows[0] || null;
};

// Cancel a booking
const cancelBooking = async (reference, email) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the booking row while checking its current status.
    const [rows] = await connection.execute(
      `SELECT id, status
       FROM bookings
       WHERE booking_reference = ?
         AND LOWER(email) = LOWER(?)
       FOR UPDATE`,
      [reference, email],
    );

    if (rows.length === 0) {
      const error = new Error("Booking not found");
      error.statusCode = 404;
      throw error;
    }

    if (rows[0].status === "CANCELLED") {
      const error = new Error("Booking is already cancelled");
      error.statusCode = 409;
      throw error;
    }

    await connection.execute(
      `UPDATE bookings
       SET status = 'CANCELLED',
           cancelled_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [rows[0].id],
    );

    await connection.commit();

    return {
      booking_reference: reference,
      status: "CANCELLED",
      message: "Booking cancelled successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createBooking,
  getBookingByReference,
  cancelBooking,
};
