const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Make sure this matches your model name
const authMiddleware = require("../authMiddleware");

const router = express.Router();

// 🔐 Generate JWT (if needed elsewhere)
const generateToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ✅ Create/Sync user with Firebase UID
router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  const firebaseUid = req.user.id;

  try {
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({ firebaseUid, name, visitedLocations: [], badges: [] });
      await user.save();
      return res.status(201).json({ message: "User created", id: user._id });
    } else {
      return res.status(200).json({ message: "User already exists", id: user._id });
    }
  } catch (err) {
    console.error("User creation error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// ✅ Get profile (secure)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const firebaseUid = req.user.id;
    const user = await User.findOne({ firebaseUid }).select("-__v");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Could not fetch profile" });
  }
});

// ✅ Toggle visited location
router.post("/visit", authMiddleware, async (req, res) => {
  const { locationId } = req.body;
  const firebaseUid = req.user.id;

  if (!locationId) {
    return res.status(400).json({ error: "Location ID is required" });
  }

  try {
    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.visitedLocations.indexOf(locationId);
    const isVisited = index !== -1;

    if (isVisited) {
      user.visitedLocations.splice(index, 1);
    } else {
      user.visitedLocations.push(locationId);
    }

    await user.save();
    res.json({
      message: isVisited ? "Location unchecked" : "Location checked",
      visitedLocations: user.visitedLocations,
    });
  } catch (err) {
    console.error("Visit toggle error:", err);
    res.status(500).json({ error: "Could not update visited list" });
  }
});

// ✅ Lookup user name
router.get("/lookup/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("User lookup error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;
