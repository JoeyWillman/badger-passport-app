const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config(); // Load environment variables from .env

const authMiddleware = require("./authMiddleware");
const userRoutes = require("./routes/User"); // 🔁 lowercase for cross-platform compatibility
const locationRoutes = require("./routes/location");
const checkinRoutes = require("./routes/checkin");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Core Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// 🖼️ Serve photo uploads from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔗 API Routes
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/checkin", checkinRoutes);

// 🧪 Health check
app.get("/", (req, res) => {
  res.send("Badger Passport Backend is running 🚀");
});

// 🛑 Error handler
app.use((err, req, res, next) => {
  console.error("🔴 Unhandled error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 🧠 Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("🧪 Make sure your .env file has a valid MONGO_URI");
    process.exit(1);
  });
