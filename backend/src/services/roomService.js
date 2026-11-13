const { pool } = require("../config/db");

const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  const [rows] = await pool.execute(
    `SELECT
       r.id AS room_id,
       r.hotel_id,
       r.category,
       r.price_per_night,
       r.total_rooms,
       h.name AS hotel_name,
       COALESCE(
         (
           SELECT COUNT(*)
           FROM bookings b
           WHERE b.room_id = r.id
             AND b.status = 'CONFIRMED'
             AND b.check_in < ?
             AND b.check_out > ?
         ),
         0
       ) AS booked_rooms,
       DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS database_today
     FROM rooms r
     INNER JOIN hotels h ON h.id = r.hotel_id
     WHERE r.id = ?`,
    [checkOut, checkIn, roomId],
  );

  if (rows.length === 0) {
    return null;
  }

  const room = rows[0];

  const totalRooms = Number(room.total_rooms);
  const bookedRooms = Number(room.booked_rooms);
  const availableRooms = Math.max(0, totalRooms - bookedRooms);

  // Convert the decimal price into paise to avoid
  // floating-point calculation errors.
  const priceInPaise = Math.round(Number(room.price_per_night) * 100);

  // Check-out date is exclusive.
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);

  const nights = (end - start) / (1000 * 60 * 60 * 24);

  const totalInPaise = priceInPaise * nights;

  return {
    room_id: Number(room.room_id),
    hotel_id: Number(room.hotel_id),
    hotel_name: room.hotel_name,
    category: room.category,
    price_per_night: (priceInPaise / 100).toFixed(2),
    total_rooms: totalRooms,
    booked_rooms: bookedRooms,
    available_rooms: availableRooms,
    available: availableRooms > 0,
    check_in: checkIn,
    check_out: checkOut,
    nights,
    total_amount: (totalInPaise / 100).toFixed(2),
    database_today: String(room.database_today).slice(0, 10),
  };
};

module.exports = {
  checkRoomAvailability,
};
