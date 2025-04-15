// models/review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  title: String,
  body: String,
  rating: Number,
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", reviewSchema);
