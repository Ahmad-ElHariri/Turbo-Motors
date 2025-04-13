// models/car.js
const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  brand: String,
  model: String,
  year: Number,
  group: String, // e.g., SUV, Electric, Bus...
  specs: {
    engineSize: Number,
    doors: Number,
    passengers: Number,
    fuelType: String,
    gearbox: String,
    hasAC: Boolean,
    electricWindows: Boolean,
  },
  pricePerDay: Number,
  image: String, // store image URL or path in /public/images
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model("Car", carSchema);
