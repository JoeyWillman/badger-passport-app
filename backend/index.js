const express   = require("express");
const mongoose  = require("mongoose");
const cors      = require("cors");
const morgan    = require("morgan");
const dotenv    = require("dotenv");
const path      = require("path");

dotenv.config(); // Load environment variables from .env

const userRoutes     = require("./routes/user");
const locationRoutes = require("./routes/locations");
const checkinRoutes  = require("./routes/checkin");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────────────────
// Only allow your frontend to talk to this API:
app.use(cors({
  origin: [
    "http://localhost:3000",
    "badger-passport-app-sfd9.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// ─── Other Middleware ────────────────────────────────────────────────────
app.use(morgan("dev"));
app.use(express.json());

// ─── Static Uploads ──────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── API Routes ─────────────────────────────────────────────────────────
app.use("/api/users",     userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/checkin",   checkinRoutes);

// ─── Health Check ────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Badger Passport Backend is running 🚀"));

// ─── Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔴 Unhandled error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ─── Connect & Listen ────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
