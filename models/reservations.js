// models/reservations.js

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupLocation: {
    type: String,
    required: true
  },
  dropoffLocation: {
    type: String,
    required: true
  },
  pickupDateTime: {
    type: Date,
    required: true
  },
  dropoffDateTime: {
    type: Date,
    required: true
  },
  driverAge: {
    type: Number,
    required: true,
    min: 18,
    max: 75
  }
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
