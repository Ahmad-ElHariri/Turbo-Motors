const mongoose = require('mongoose');

// Replace the connection string with the one pointing to your All_database
const connect = mongoose.connect("mongodb+srv://Coder_1:MyPass123@cluster1.xs6lxac.mongodb.net/All_database?retryWrites=true&w=majority&appName=Cluster1");

// Check if the database is connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch((err) => {
    console.log("Database cannot be Connected", err);
})

// Create Schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
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
    },
    profilePicture: {
      type: String, // Store the image URL or file path
      default: "/images/default-profile.jpeg"
    },
    displayName: {
      type: String,
      default: ""
    }
    
    
});

// Create collection from schema
const collection = new mongoose.model("user", Loginschema);

module.exports = collection;
