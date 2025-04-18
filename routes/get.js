

// routes/get.js
const express = require("express");
const router = express.Router();
const collection = require("../models/users");
const Car = require("../models/car");
const Review = require("../models/review");
const Reservation = require("../models/reservations");
const Booking = require("../models/booking");
const calculateTotal = require("../utils/price");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Home
router.get("/", (req, res) => {
    res.redirect("/home");
});
router.get("/home", async (req, res) => {
  const cookieUser = req.cookies.user;
  const user = cookieUser ? await collection.findById(cookieUser.id) : null;

  const groups = ['Electric', 'Luxury', 'SUV', 'Convertible'];
  const selectedGroups = groups.sort(() => 0.5 - Math.random()).slice(0, 3);

  try {
    const randomCars = [];
    for (let group of selectedGroups) {
      const car = await Car.aggregate([
        { $match: { group: group } },
        { $sample: { size: 1 } }
      ]);
      if (car.length > 0) randomCars.push(car[0]);
    }

    const allReviews = await Review.find()
      .sort({ time: -1 })
      .populate("userId", "name displayName profilePicture");

    const uniqueUserReviews = [];
    const seenUserIds = new Set();
    for (const review of allReviews) {
      const userId = review.userId?._id?.toString();
      if (!seenUserIds.has(userId)) {
        uniqueUserReviews.push(review);
        seenUserIds.add(userId);
      }
    }

    let selectedReviews = [];
    if (uniqueUserReviews.length <= 3) {
      selectedReviews = uniqueUserReviews;
    } else {
      selectedReviews = uniqueUserReviews.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    const bookings = await Booking.find({ status: "paid" }).populate("selectedCars.car");
    const carFrequency = {};
    let totalPrice = 0;
    let carCount = 0;

    for (const booking of bookings) {
      for (const carObj of booking.selectedCars) {
        const carId = carObj.car._id.toString();
        carFrequency[carId] = (carFrequency[carId] || 0) + 1;
        totalPrice += carObj.dailyRate;
        carCount++;
      }
    }

    let mostPopularCarDoc = null;
    if (Object.keys(carFrequency).length > 0) {
      const mostPopularCarId = Object.entries(carFrequency).sort((a, b) => b[1] - a[1])[0][0];
      mostPopularCarDoc = await Car.findById(mostPopularCarId);
    }

    const averageRental = carCount ? (totalPrice / carCount).toFixed(2) : "0.00";

    res.render("home", {
      user, // full user object from DB with points
      cars: randomCars,
      homepageReviews: selectedReviews,
      mostPopularCarDoc,
      averageRental
    });

  } catch (error) {
    console.error("Error fetching home data:", error);
    res.status(500).send("Error fetching home data.");
  }
});





// Cars
router.get("/car/:id", async (req, res) => {
    const carId = req.params.id;
    try {
        const car = await Car.findById(carId);
        if (!car) return res.status(404).send("Car not found");
        res.json(car);
    } catch (error) {
        console.error("Error fetching car:", error);
        res.status(500).send("Error fetching car data");
    }
});

router.get("/allcars", async (req, res) => {
    try {
        const cars = await Car.find();
        res.render("allcars", { cars });
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).send("Error fetching car data");
    }
});


// Chat
router.get("/chat", (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");
    res.render("chat", { user });
});

router.get("/admin-chat", (req, res) => {
    const user = req.cookies.user;
    if (!user || !user.isAdmin) return res.redirect("/login");
    res.render("admin-chat", { user });
});


// Login / SignUp
router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/logout", (req, res) => {
    res.clearCookie("user");
    res.redirect("/login");
});


// Other Pages
router.get("/profile", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");
  
    const currentUser = await collection.findById(user.id);
    const savedBooking = await Booking.findOne({ user: user.id, status: "saved" });
  
    res.render("profile", {
      user: currentUser,
      message: null,
      userSavedBooking: !!savedBooking
    });
  });
  

router.get("/reviews", async (req, res) => {
    try {
        const reviews = await Review.find().sort({ time: -1 }).populate("userId", "displayName profilePicture");
        res.render("reviews", { reviews });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).send("Error fetching reviews.");
    }
});

router.get("/about", (req, res) => {
    res.render("about");
});

router.get("/contact", (req, res) => {
    res.render("contact", { message: null });
});

router.get("/addcar", (req, res) => {
    res.render("addcar");
});


// Booking Proccess
router.get("/reservation", async (req, res) => {
  const cookieUser = req.cookies.user;
  if (!cookieUser) return res.redirect("/login");

  try {
      // Re-fetch full updated user info from DB
      const user = await collection.findById(cookieUser.id);
      const reservationCookie = req.cookies.reservationData;
      const reservation = reservationCookie ? JSON.parse(reservationCookie) : null;

      res.render("reservation", { user, reservation });
  } catch (err) {
      console.error("Error loading reservation:", err);
      res.status(500).send("Failed to load reservation page.");
  }
});


router.get("/choose-car", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");

    try {
        const cars = await Car.find({ available: true });

        // Get reservation data from cookie
        const reservationData = JSON.parse(req.cookies.reservationData || "{}");

        res.render("choose-car", {
            cars,
            reservation: reservationData // ✅ Now it can be used in EJS
        });
    } catch (error) {
        console.error("Error loading choose-car page:", error);
        res.status(500).send("Error loading choose car page");
    }
});


router.get("/extra", (req, res) => {
    const selectedExtras = JSON.parse(req.cookies.selectedExtras || "{}");
    const reservationData = JSON.parse(req.cookies.reservationData || "{}");
    res.render("extra", { selectedExtras, reservation: reservationData });
});

router.get("/booking-checkout", (req, res) => {
    const reservationData = JSON.parse(req.cookies.reservationData || "{}");
    const selectedCars = JSON.parse(req.cookies.selectedCars || "[]");
    const selectedExtras = JSON.parse(req.cookies.selectedExtras || "{}");

    if (!reservationData.pickupLocation) return res.redirect("/reservation");

    res.render("booking-checkout", {
        reservation: reservationData,
        selectedCars,
        selectedExtras
    });
});
router.get("/booking/resume", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");
  
    const booking = await Booking.findOne({ user: user.id, status: "saved" })
      .populate("selectedCars.car");
  
    if (!booking) return res.send("No saved booking to resume.");
  
    res.render("booking-checkout", {
      reservation: booking.reservation,
      selectedCars: booking.selectedCars.map(c => c.car),
      selectedExtras: booking.extras
    });
  });
  // routes/get.js

  router.get("/checkout", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");

    try {
        const reservation = JSON.parse(req.cookies.reservationData || "{}");
        const selectedCars = JSON.parse(req.cookies.selectedCars || "[]");
        const extras = JSON.parse(req.cookies.selectedExtras || "{}");

        const pickup = new Date(reservation.pickupDateTime);
        const dropoff = new Date(reservation.dropoffDateTime);

        const totalPrice = calculateTotal(selectedCars, extras, pickup, dropoff);

        res.render("checkout", {
            reservation,
            selectedCars,
            extras,
            totalPrice,
            user
        });
    } catch (err) {
        console.error("Error loading checkout:", err);
        res.status(500).send("Error loading checkout page.");
    }
});

const path = require("path");

router.get("/download-invoice/:bookingId", async (req, res) => {

    const user = req.cookies.user;
    if (!user) return res.redirect("/login");
  
    try {
      const booking = await Booking.findOne({ _id: req.params.bookingId, user: user.id })
        .populate("selectedCars.car");
  
      const fullUser = await collection.findById(user.id);
      if (!booking) return res.status(404).send("Booking not found");
  
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=invoice-${booking._id}.pdf`);
      doc.pipe(res);
  
      // Branding
      doc
        .fillColor("#007bff")
        .fontSize(26)
        .text("Turbo Motors Invoice", { align: "center" })
        .moveDown();
  
      // Customer Info
      doc
        .fillColor("black")
        .fontSize(12)
        .text(`Booking ID: ${booking._id}`)
        .text(`Customer: ${fullUser.name} (${fullUser.displayName || "No display name"})`)
        .moveDown();
  
      // Dates and Locations
      doc
        .fontSize(13)
        .fillColor("#333")
        .text(`Pickup: ${booking.reservation.pickupLocation} - ${new Date(booking.reservation.pickupDateTime).toLocaleString()}`)
        .text(`Drop-off: ${booking.reservation.dropoffLocation} - ${new Date(booking.reservation.dropoffDateTime).toLocaleString()}`)
        .moveDown();
  
      // Cars (inline)
      const carDescriptions = booking.selectedCars.map(c => `${c.car.brand} ${c.car.model} ($${c.dailyRate}/day)`);
      doc.fillColor("#007bff").fontSize(15).text("Cars:", { underline: true });
      doc.fillColor("black").fontSize(12).text(carDescriptions.join(", ")).moveDown();
  
      // Extras with Prices
      const prices = {
        chauffeur: 50,
        babySeat: 20,
        navigator: 15,
        gps: 10,
        insurance: {
          full: 30,
          tires: 20,
          additionalDriver: 25
        },
        fuel: {
          prepaid: 60,
          payOnReturn: 70
        }
      };
  
      const extras = booking.extras || {};
      const extraList = [];
  
      for (const [key, value] of Object.entries(extras)) {
        if (!value) continue;
  
        if (["insurance", "fuel"].includes(key)) {
          const label = value.charAt(0).toUpperCase() + value.slice(1);
          const price = prices[key]?.[value] ?? 0;
          extraList.push(`${key} (${label}) - $${price}`);
        } else {
          const price = prices[key] ?? 0;
          extraList.push(`${key} - $${price}`);
        }
      }
  
      doc.fillColor("#007bff").fontSize(15).text("Services:", { underline: true });
      if (extraList.length === 0) {
        doc.fillColor("black").fontSize(12).text("No extras selected").moveDown();
      } else {
        doc.fillColor("black").fontSize(12).text(extraList.join(", ")).moveDown();
      }
  
      // Total
      doc
        .fontSize(14)
        .fillColor("green")
        .text(`Total Paid: $${booking.totalPrice.toFixed(2)}`, { align: "right" });
  
      doc.end();
    } catch (err) {
      console.error("❌ Error generating invoice:", err);
      res.status(500).send("Failed to generate invoice.");
    }
  });
  
  

module.exports = router;

