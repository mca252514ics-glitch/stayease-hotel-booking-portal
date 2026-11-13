require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const hotelRoutes = require("./routes/hotelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const hotelAiRoutes = require("./routes/hotelAiRoutes");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/ai", hotelAiRoutes);
// Root API
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hotel Booking Portal API is running!",
  });
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const { pool } = require("./config/db");
    await pool.query("SELECT 1");

    res.status(200).json({
      success: true,
      message: "Backend and MySQL are working!",
      database: "Connected",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      database: "Disconnected",
    });
  }
});

// Hotel routes
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

module.exports = app;
