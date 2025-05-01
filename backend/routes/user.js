const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user using Firebase UID
 * @access  Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const firebaseUid = req.user.id;
    const { name } = req.body;

    const existing = await User.findOne({ firebaseUid });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = await User.create({
      firebaseUid,
      name,
      friends: [],
      visitedLocations: [],
      badges: [],
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error("❌ Signup failed:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

/**
 * @route   GET /api/users/me
 * @desc    Get profile of the current user
 * @access  Private
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.id }).select("-__v");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Fetch profile failed:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * @route   POST /api/users/visit
 * @desc    Toggle visited location
 * @access  Private
 */
router.post("/visit", authMiddleware, async (req, res) => {
  const { locationId } = req.body;
  if (!locationId) return res.status(400).json({ error: "Location ID is required" });

  try {
    const user = await User.findOne({ firebaseUid: req.user.id });
    if (!user) return res.status(404).json({ error: "User not found" });

    const alreadyVisited = user.visitedLocations.includes(locationId);
    if (alreadyVisited) {
      user.visitedLocations.pull(locationId);
    } else {
      user.visitedLocations.push(locationId);
    }

    await user.save();

    res.json({
      message: `${alreadyVisited ? "Unchecked" : "Checked"} location`,
      visitedLocations: user.visitedLocations,
    });
  } catch (err) {
    console.error("❌ Checklist update error:", err);
    res.status(500).json({ error: "Failed to update checklist" });
  }
});

/**
 * @route   GET /api/users/lookup/:uid
 * @desc    Lookup user by Firebase UID
 * @access  Private
 */
router.get("/lookup/:uid", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid }).select("name");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ User lookup failed:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * @route   PUT /api/users/add-friend/:friendUid
 * @desc    Add a friend by Firebase UID
 * @access  Private
 */
router.put("/add-friend/:friendUid", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.id });
    const friend = await User.findOne({ firebaseUid: req.params.friendUid });

    if (!user || !friend) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    if (!user.friends.includes(friend.firebaseUid)) {
      user.friends.push(friend.firebaseUid);
      await user.save();
    }

    res.json({ message: "Friend added", friends: user.friends });
  } catch (err) {
    console.error("❌ Failed to add friend:", err);
    res.status(500).json({ error: "Failed to add friend" });
  }
});

module.exports = router;
