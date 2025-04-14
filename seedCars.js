// seedCars.js
const mongoose = require("mongoose");
const Car = require("./models/car");
require("dotenv").config();

const cars = [
  {
    "group": "Electric",
    "brand": "Tesla",
    "model": "Model 3",
    "image": "tesla-model-3.jpeg",
    "engineSize": 0,
    "doors": 4,
    "passengers": 5,
    "fuel": "Electric",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 54
  },
  {
    "group": "Electric",
    "brand": "Hyundai",
    "model": "Ioniq 5",
    "image": "hyundai-ioniq-5.jpeg",
    "engineSize": 0,
    "doors": 4,
    "passengers": 5,
    "fuel": "Electric",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 48
  },
  {
    "group": "Electric",
    "brand": "Nissan",
    "model": "Leaf",
    "image": "nissan-leaf-6.jpg",
    "engineSize": 0,
    "doors": 4,
    "passengers": 5,
    "fuel": "Electric",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 42
  },
  {
    "group": "Luxury",
    "brand": "Mercedes",
    "model": "S-Class",
    "image": "mercedes-s-10.jpeg",
    "engineSize": 3000,
    "doors": 4,
    "passengers": 5,
    "fuel": "Gasoline",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 130
  },
  {
    "group": "Luxury",
    "brand": "BMW",
    "model": "7 Series",
    "image": "bmw-7-10.jpeg",
    "engineSize": 3000,
    "doors": 4,
    "passengers": 5,
    "fuel": "Gasoline",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 120
  },
  {
    "group": "Luxury",
    "brand": "Audi",
    "model": "A8",
    "image": "audi-a8-12.jpeg",
    "engineSize": 3000,
    "doors": 4,
    "passengers": 5,
    "fuel": "Gasoline",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 125
  },
  {
    "group": "SUV",
    "brand": "Lexus",
    "model": "LX",
    "image": "lexus-lx-2.jpeg",
    "engineSize": 3500,
    "doors": 4,
    "passengers": 7,
    "fuel": "Gasoline",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 98
  },
  {
    "group": "SUV",
    "brand": "Toyota",
    "model": "Land Cruiser",
    "image": "toyota-land-cruiser-1.jpeg",
    "engineSize": 4500,
    "doors": 4,
    "passengers": 7,
    "fuel": "Diesel",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 105
  },
  {
    "group": "SUV",
    "brand": "Nissan",
    "model": "Patrol",
    "image": "nissan-patrol-3.jpg",
    "engineSize": 4000,
    "doors": 4,
    "passengers": 7,
    "fuel": "Gasoline",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 100
  },
  {
    "group": "Convertible",
    "brand": "Ford",
    "model": "Mustang",
    "image": "ford-mustang-8.jpeg",
    "engineSize": 5000,
    "doors": 2,
    "passengers": 4,
    "fuel": "Gasoline",
    "gearbox": "Manual",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 90
  },
  {
    "group": "Convertible",
    "brand": "Audi",
    "model": "A5 Cabriolet",
    "image": "audi-a5-9.jpeg",
    "engineSize": 2000,
    "doors": 2,
    "passengers": 4,
    "fuel": "Gasoline",
    "gearbox": "Automatic",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 88
  },
  {
    "group": "Convertible",
    "brand": "BMW",
    "model": "Z4",
    "image": "bmw-z4-7.jpg",
    "engineSize": 2500,
    "doors": 2,
    "passengers": 2,
    "fuel": "Gasoline",
    "gearbox": "Manual",
    "ac": true,
    "electricWindows": true,
    "pricePerDay": 95
  }
];

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    return Car.insertMany(cars);
  })
  .then(() => {
    console.log("Car data seeded");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Seeding failed", err);
  });