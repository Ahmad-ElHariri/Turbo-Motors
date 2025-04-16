// routes/get.js
const express = require("express");
const router = express.Router();
const collection = require("../models/users");
const Car = require("../models/car");
const Review = require("../models/review");
const Reservation = require("../models/reservations");



// Home
router.get("/", (req, res) => {
    res.redirect("/home");
});

router.get("/home", async (req, res) => {
    const user = req.cookies.user;
    const groups = ['Electric', 'Luxury', 'SUV', 'Convertible'];
    const selectedGroups = groups.sort(() => 0.5 - Math.random()).slice(0, 3);

    try {
        // Random cars logic (unchanged)
        const randomCars = [];
        for (let group of selectedGroups) {
            const car = await Car.aggregate([
                { $match: { group: group } },
                { $sample: { size: 1 } }
            ]);
            if (car.length > 0) randomCars.push(car[0]);
        }

        // Get all reviews with user info populated
        const allReviews = await Review.find()
            .sort({ time: -1 }) // latest first
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
            // Randomly pick 3 reviews from different users
            selectedReviews = uniqueUserReviews
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
        }

        res.render("home", {
            user,
            cars: randomCars,
            homepageReviews: selectedReviews,
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
    res.render("profile", { user: currentUser, message: null });
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
router.get("/reservation", (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");
    res.render("reservation", { user });
});

router.get("/choose-car", async (req, res) => {
    try {
        const cars = await Car.find({ available: true });
        res.render("choose-car", { cars });
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(500).send("Error fetching car data");
    }
});

router.get("/extra", (req, res) => {
    res.render("extra");
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
    console.log("Selected Cars:", req.cookies.selectedCars);
});

module.exports = router;