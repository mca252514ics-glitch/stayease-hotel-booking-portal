const hotelService = require("../services/hotelService");

// GET /api/hotels
const getHotels = async (req, res) => {
  try {
    const hotels = await hotelService.getAllHotels();

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    console.error("Get hotels error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch hotels",
    });
  }
};

// GET /api/hotels/:id
const getHotelDetails = async (req, res) => {
  try {
    const hotelId = Number(req.params.id);

    if (!Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID",
      });
    }

    const rows = await hotelService.getHotelById(hotelId);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    // The LEFT JOIN can return multiple rows if a hotel has
    // multiple room categories. Group them into one hotel object.
    const first = rows[0];

    const hotel = {
      id: first.hotel_id,
      name: first.name,
      location: first.location,
      description: first.description,
      amenities: first.amenities,
      image_url: first.image_url,
      rooms: rows
        .filter((row) => row.room_id !== null)
        .map((row) => ({
          id: row.room_id,
          category: row.category,
          price_per_night: row.price_per_night,
          total_rooms: row.total_rooms,
        })),
    };

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error("Get hotel details error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch hotel details",
    });
  }
};

// GET /api/hotels/search?location=Mumbai
const searchHotels = async (req, res) => {
  try {
    const location = req.query.location?.trim();

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    const hotels = await hotelService.searchHotelsByLocation(location);

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    console.error("Search hotels error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to search hotels",
    });
  }
};

module.exports = {
  getHotels,
  getHotelDetails,
  searchHotels,
};
