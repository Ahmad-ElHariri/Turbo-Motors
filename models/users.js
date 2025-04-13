// models/user.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    min: 18,
    max: 75
  },
  points: {
    type: Number,
    default: 0
  },
  savedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
