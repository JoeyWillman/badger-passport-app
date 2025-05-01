const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const morgan   = require("morgan");
const dotenv   = require("dotenv");
const path     = require("path");

dotenv.config(); // Load .env

// Routes
const userRoutes     = require("./routes/User");
const locationRoutes = require("./routes/locations");
const checkinRoutes  = require("./routes/checkin");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Allow All Origins (Assignment Safe) ────────────────────────────────
app.use(cors({
  origin: true,              // Reflect request origin in header
  credentials: true,         // Allow cookies/tokens
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ─── Middleware ─────────────────────────────────────────────────────────
app.use(morgan("dev"));
app.use(express.json());

// ─── Serve Uploaded Images ──────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── API Routes ─────────────────────────────────────────────────────────
app.use("/api/users",     userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/checkin",   checkinRoutes);

// ─── Health Check ───────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Badger Passport Backend is running 🚀"));

// ─── Global Error Handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔴 Unhandled error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ─── MongoDB Connect & Server Start ─────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
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
