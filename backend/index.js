const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const morgan   = require("morgan");
const dotenv   = require("dotenv");
const path     = require("path");

dotenv.config(); // Load .env

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Import Routes (FIXED lowercase filenames) ──────────────────────────
const userRoutes     = require("./routes/blob");      // 
const locationRoutes = require("./routes/locations");
const checkinRoutes  = require("./routes/checkin");

// ─── CORS Config (Assignment Safe) ──────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Middleware ─────────────────────────────────────────────────────────
app.use(morgan("dev"));
app.use(express.json());

// ─── Static Folder for Uploaded Images ──────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Register API Routes ────────────────────────────────────────────────
app.use("/api/users",     userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/checkin",   checkinRoutes);

console.log("✅ All route modules registered.");

// ─── Health Check ───────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Badger Passport Backend is running 🚀");
});

// ─── Global Error Handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔴 Unhandled error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ─── Connect to MongoDB and Start Server ────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});
