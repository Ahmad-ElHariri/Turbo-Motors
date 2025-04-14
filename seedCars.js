
const mongoose = require("mongoose");
const Car = require("./models/car");
require("dotenv").config();
const cars = [
    {
      group: "Electric",
      brand: "Tesla",
      model: "Model 3",
      image: "tesla-model-3.jpeg",
      specs: {
        engineSize: 0,
        doors: 4,
        passengers: 5,
        fuelType: "Electric",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 54,
      available: true,
    },
    {
      group: "Electric",
      brand: "Hyundai",
      model: "Ioniq 5",
      image: "hyundai-ioniq-5.jpeg",
      specs: {
        engineSize: 0,
        doors: 4,
        passengers: 5,
        fuelType: "Electric",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 48,
      available: true,
    },
    {
      group: "Electric",
      brand: "Nissan",
      model: "Leaf",
      image: "nissan-leaf-6.jpg",
      specs: {
        engineSize: 0,
        doors: 4,
        passengers: 5,
        fuelType: "Electric",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 42,
      available: true,
    },
    {
      group: "Luxury",
      brand: "Mercedes",
      model: "S-Class",
      image: "mercedes-s-10.jpeg",
      specs: {
        engineSize: 3000,
        doors: 4,
        passengers: 5,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 130,
      available: true,
    },
    {
      group: "Luxury",
      brand: "BMW",
      model: "7 Series",
      image: "bmw-7-10.jpeg",
      specs: {
        engineSize: 3000,
        doors: 4,
        passengers: 5,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 120,
      available: true,
    },
    {
      group: "Luxury",
      brand: "Audi",
      model: "A8",
      image: "audi-a8-12.jpeg",
      specs: {
        engineSize: 3000,
        doors: 4,
        passengers: 5,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 125,
      available: true,
    },
    {
      group: "SUV",
      brand: "Lexus",
      model: "LX",
      image: "lexus-lx-2.jpeg",
      specs: {
        engineSize: 3500,
        doors: 4,
        passengers: 7,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 98,
      available: true,
    },
    {
      group: "SUV",
      brand: "Toyota",
      model: "Land Cruiser",
      image: "toyota-land-cruiser-1.jpeg",
      specs: {
        engineSize: 4500,
        doors: 4,
        passengers: 7,
        fuelType: "Diesel",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 105,
      available: true,
    },
    {
      group: "SUV",
      brand: "Nissan",
      model: "Patrol",
      image: "nissan-patrol-3.jpg",
      specs: {
        engineSize: 4000,
        doors: 4,
        passengers: 7,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 100,
      available: true,
    },
    {
      group: "Convertible",
      brand: "Ford",
      model: "Mustang",
      image: "ford-mustang-8.jpeg",
      specs: {
        engineSize: 5000,
        doors: 2,
        passengers: 4,
        fuelType: "Gasoline",
        gearbox: "Manual",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 90,
      available: true,
    },
    {
      group: "Convertible",
      brand: "Audi",
      model: "A5 Cabriolet",
      image: "audi-a5-9.jpeg",
      specs: {
        engineSize: 2000,
        doors: 2,
        passengers: 4,
        fuelType: "Gasoline",
        gearbox: "Automatic",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 88,
      available: true,
    },
    {
      group: "Convertible",
      brand: "BMW",
      model: "Z4",
      image: "bmw-z4-7.jpg",
      specs: {
        engineSize: 2500,
        doors: 2,
        passengers: 2,
        fuelType: "Gasoline",
        gearbox: "Manual",
        hasAC: true,
        electricWindows: true,
      },
      pricePerDay: 95,
      available: true,
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
  