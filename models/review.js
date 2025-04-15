const mongoose = require('mongoose');

// Define schema for reviews
const reviewSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    rating: { type: Number, required: true },
    time: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

