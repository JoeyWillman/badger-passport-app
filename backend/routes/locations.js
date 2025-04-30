const express = require("express");
const Location = require("../models/Location");
const router = express.Router();

// @route   GET /api/locations
// @desc    Get all checklist locations
// @access  Public (you can add authMiddleware if needed)
router.get("/", async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error("Failed to fetch locations:", err);
    res.status(500).json({ error: "Failed to load locations" });
  }
});

module.exports = router;
