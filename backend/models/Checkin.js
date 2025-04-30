const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    caption: {
      type: String,
      default: "",
      trim: true,
    },
    photoUrl: {
      type: String, // Example: "/uploads/168339283.jpg"
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Checkin", checkinSchema);
