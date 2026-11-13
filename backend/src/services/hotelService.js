
const { pool } = require("../config/db");

// Fetch all hotels with their room information
const getAllHotels = async () => {
  const [rows] = await pool.query(`
    SELECT
      h.id AS hotel_id,
      h.name,
      h.location,
      h.description,
      h.amenities,
      h.image_url,
      r.id AS room_id,
      r.category,
      r.price_per_night,
      r.total_rooms
    FROM hotels h
    LEFT JOIN rooms r ON h.id = r.hotel_id
    ORDER BY h.id DESC
  `);

  return rows;
};

// Fetch one hotel by ID
const getHotelById = async (hotelId) => {
  const [rows] = await pool.execute(
    `SELECT
       h.id AS hotel_id,
       h.name,
       h.location,
       h.description,
       h.amenities,
       h.image_url,
       r.id AS room_id,
       r.category,
       r.price_per_night,
       r.total_rooms
     FROM hotels h
     LEFT JOIN rooms r ON h.id = r.hotel_id
     WHERE h.id = ?`,
    [hotelId]
  );

  return rows;
};

// Search hotels by location
const searchHotelsByLocation = async (location) => {
  const [rows] = await pool.execute(
    `SELECT
       h.id AS hotel_id,
       h.name,
       h.location,
       h.description,
       h.amenities,
       h.image_url,
       r.id AS room_id,
       r.category,
       r.price_per_night,
       r.total_rooms
     FROM hotels h
     LEFT JOIN rooms r ON h.id = r.hotel_id
     WHERE h.location LIKE ?
     ORDER BY h.name`,
    [`%${location}%`]
  );

  return rows;
};

module.exports = {
  getAllHotels,
  getHotelById,
  searchHotelsByLocation
};
