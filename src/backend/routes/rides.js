const express = require("express");
const multer = require("multer");
const Ride = require("../models/Ride");
const router = express.Router();
const path = require("path");

// Setup Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// GET all rides
router.get("/", async (req, res) => {
  const rides = await Ride.find().sort({ date: -1 });
  res.json(rides);
});

// POST a new ride (with optional photo upload)
router.post("/", upload.array("photos", 10), async (req, res) => {
  const {
    name,
    date,
    locationName,
    lat,
    lng,
    distance,
    elevation,
    notes,
  } = req.body;

  const photos = req.files.map((file) => ({
    filename: file.filename,
    uploadedAt: new Date(),
    location: {
      name: locationName,
      lat: lat,
      lng: lng,
    },
  }));

  const ride = new Ride({
    name,
    date,
    location: {
      name: locationName,
      lat,
      lng,
    },
    distance,
    elevation,
    notes,
    photos,
  });

  await ride.save();
  res.status(201).json(ride);
});

module.exports = router;
