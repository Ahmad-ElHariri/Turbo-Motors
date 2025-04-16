// models/booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  reservation: {
    pickupLocation: String,
    dropoffLocation: String,
    pickupDateTime: Date,
    dropoffDateTime: Date,
    driverAge: Number
  },
  selectedCars: [{
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },
    dailyRate: Number // Store price at the time of booking
  }],
  extras: {
    chauffeur: { type: Boolean, default: false },
    babySeat: { type: Boolean, default: false },
    navigator: { type: Boolean, default: false },
    gps: { type: Boolean, default: false },
    insurance: { type: String, enum: ["full", "tires", "additionalDriver", "none"], default: "none" },
    fuel: { type: String, enum: ["prepaid", "payOnReturn", "none"], default: "none" }
  },
  couponCode: { type: String, default: null },
  totalPrice: Number,
  status: { type: String, enum: ["saved", "paid", "cancelled", "quotation"], default: "saved" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
