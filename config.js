const mongoose = require('mongoose');
const connect = mongoose.connect("mongodb+srv://Coder_1:MyPass123@cluster1.xs6lxac.mongodb.net/trial?retryWrites=true&w=majority&appName=Cluster1");

// Check database connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    age: {
      type: Number,
      min: 18,
      max: 75,
      default: null
    },
    points: {
      type: Number,
      default: 0
    }
});

// collection part
const collection = new mongoose.model("x", Loginschema);

module.exports = collection;