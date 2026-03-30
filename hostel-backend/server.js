
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ],
  credentials: true
}));

app.use(express.json());

// ── Database ──────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

connectDB();

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoute'));
app.use('/api/complaints', require('./routes/complaintRoute'));
app.use('/api/rooms',      require('./routes/roomRoute'));

// ── Health Check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Hostel Backend API is running...");
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
});