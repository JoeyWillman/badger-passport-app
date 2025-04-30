const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../authMiddleware");

const router = express.Router();

// 🔐 Generate a JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ✅ Register new user
// POST /api/users/signup
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const newUser = new User({ email, password, name });
    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      email: newUser.email,
      token: generateToken(newUser),
    });
  } catch (err) {
    console.error("Signup failed:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ Login user
// POST /api/users/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      id: user._id,
      email: user.email,
      token: generateToken(user),
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Get profile
// GET /api/users/profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Fetch profile failed:", err);
    res.status(500).json({ error: "Profile fetch failed" });
  }
});

// ✅ Toggle visited location
// POST /api/users/visit
router.post("/visit", authMiddleware, async (req, res) => {
  const { locationId } = req.body;

  if (!locationId) return res.status(400).json({ error: "Location ID is required" });

  try {
    const user = await User.findById(req.user.id);

    const alreadyVisited = user.visitedLocations?.includes(locationId);
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
    console.error("Checklist update error:", err);
    res.status(500).json({ error: "Failed to update checklist" });
  }
});

module.exports = router;
