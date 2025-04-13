// models/reservation.js
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "x" },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },

  pickupLocation: String,
  dropoffLocation: String,
  pickupDate: Date,
  dropoffDate: Date,
  driverName: String,
  driverAge: Number,

  services: {
    chauffeur: Boolean,
    babySeat: Boolean,
    navigator: Boolean,
    gps: Boolean,
    insurance: {
      type: String, // "Full", "Tires", "Additional Driver"
    },
    fuelOption: {
      type: String, // "Prepaid", "PayOnReturn"
    }
  },

  status: {
    type: String,
    enum: ["saved", "completed", "cancelled", "quotation"],
    default: "saved"
  },

  totalPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reservation", reservationSchema);
