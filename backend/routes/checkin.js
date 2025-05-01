const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../authMiddleware");
const User = require("../models/user");
const Location = require("../models/Locations");
const Checkin = require("../models/Checkin");

const router = express.Router();

// 🔧 Configure multer for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

/**
 * @route   POST /api/checkin
 * @desc    Submit a new check-in with optional photo and caption
 * @access  Private
 */
router.post("/", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const firebaseUserId = req.user.id;
    const { locationId, caption } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // ✅ Save new check-in
    const newCheckin = new Checkin({
      userId: firebaseUserId,
      locationId,
      caption,
      photoUrl,
    });
    await newCheckin.save();

    // ✅ Update visitedLocations and fetch user
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.visitedLocations.includes(locationId)) {
      user.visitedLocations.push(locationId);
    }

    // ✅ Badge logic
    const allLocations = await Location.find();
    const totalLocations = allLocations.length;
    const visitedCount = user.visitedLocations.length;

    const newBadges = [];
    const alreadyHas = (badge) => user.badges?.includes(badge);

    if (!alreadyHas("First Check-in") && visitedCount >= 1) {
      newBadges.push("First Check-in");
    }
    if (!alreadyHas("Halfway There") && visitedCount >= Math.ceil(totalLocations / 2)) {
      newBadges.push("Halfway There");
    }
    if (!alreadyHas("All Done") && visitedCount >= totalLocations) {
      newBadges.push("All Done");
    }

    // ✅ Update user badges
    user.badges = [...new Set([...(user.badges || []), ...newBadges])];
    await user.save();

    res.status(201).json({
      message: "Check-in successful",
      photoUrl,
      newBadges,
    });
  } catch (err) {
    console.error("❌ Check-in error:", err);
    res.status(500).json({ error: "Check-in failed" });
  }
});

/**
 * @route   GET /api/checkin/my
 * @desc    Get all check-ins made by the logged-in user
 * @access  Private
 */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const firebaseUserId = req.user.id;

    const checkins = await Checkin.find({ userId: firebaseUserId })
      .populate("locationId", "name")
      .sort({ timestamp: -1 });

    res.json(checkins);
  } catch (err) {
    console.error("❌ Failed to load check-ins:", err);
    res.status(500).json({ error: "Could not load your check-ins." });
  }
});

module.exports = router;
