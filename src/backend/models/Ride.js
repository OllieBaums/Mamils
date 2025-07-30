const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  filename: String,
  uploadedAt: { type: Date, default: Date.now },
  location: {
    name: String,
    lat: Number,
    lng: Number,
  },
});

const rideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  distance: Number,
  elevation: Number,
  notes: String,
  photos: [photoSchema],
});

module.exports = mongoose.model("Ride", rideSchema);
