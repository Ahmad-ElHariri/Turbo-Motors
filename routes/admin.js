const express = require("express");
const router = express.Router();
const Car = require("../models/car");
const User = require("../models/users");
const Booking = require("../models/booking");
const path = require("path");
const multer = require("multer");

// Multer config for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/images"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// Middleware to protect admin routes
function isAdmin(req, res, next) {
    if (req.cookies?.user?.isAdmin) return next();
    return res.status(403).send("Admins only");
}

// ===== CAR MANAGEMENT ===== //

router.get("/cars", isAdmin, async (req, res) => {
    const cars = await Car.find();
    res.render("admin/admin-cars", { cars });
});

router.get("/cars/new", isAdmin, (req, res) => {
    res.render("admin/new-car");
});

router.post("/cars", isAdmin, upload.single("image"), async (req, res) => {
    try {
        const { brand, model, year, group, engineSize, doors, passengers, fuelType, gearbox, hasAC, electricWindows, pricePerDay } = req.body;
        const newCar = new Car({
            brand,
            model,
            year,
            group,
            specs: {
                engineSize,
                doors,
                passengers,
                fuelType,
                gearbox,
                hasAC: hasAC === "on",
                electricWindows: electricWindows === "on"
            },
            pricePerDay,
            image: "/images/" + req.file.filename
        });
        await newCar.save();
        res.redirect("/admin/cars");
    } catch (err) {
        res.status(500).send("Error creating car");
    }
});

router.get("/cars/edit/:id", isAdmin, async (req, res) => {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send("Car not found");
    res.render("admin/edit-car", { car });
});

router.post("/cars/update/:id", isAdmin, async (req, res) => {
    const { brand, model, year, group, engineSize, doors, passengers, fuelType, gearbox, hasAC, electricWindows, pricePerDay } = req.body;
    await Car.findByIdAndUpdate(req.params.id, {
        brand,
        model,
        year,
        group,
        specs: {
            engineSize,
            doors,
            passengers,
            fuelType,
            gearbox,
            hasAC: hasAC === "on",
            electricWindows: electricWindows === "on"
        },
        pricePerDay
    });
    res.redirect("/admin/cars");
});

router.post("/cars/delete/:id", isAdmin, async (req, res) => {
    await Car.findByIdAndDelete(req.params.id);
    res.redirect("/admin/cars");
});

// ===== USER MANAGEMENT ===== //

router.get("/users", isAdmin, async (req, res) => {
    const users = await User.find();
    res.render("admin/admin-users", { users });
});

router.get("/users/edit/:id", isAdmin, async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.render("admin/edit-user", { user });
});

router.post("/users/update/:id", isAdmin, async (req, res) => {
    const { name, age, isAdmin, points, displayName } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
        name,
        age,
        isAdmin: isAdmin === "on",
        points,
        displayName
    });
    res.redirect("/admin/users");
});

router.post("/users/delete/:id", isAdmin, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin/users");
});

// ===== BOOKING MANAGEMENT ===== //

router.get("/bookings", isAdmin, async (req, res) => {
    const bookings = await Booking.find().populate("user").sort({ createdAt: -1 });
    res.render("admin/admin-bookings", { bookings });
});

router.get("/bookings/:id", isAdmin, async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate("user").populate("selectedCars.car");
    if (!booking) return res.status(404).send("Booking not found");
    res.render("admin/view-booking", { booking });
});

router.post("/bookings/mark-paid/:id", isAdmin, async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, { status: "paid" });
    res.redirect("/admin/bookings");
});

router.post("/bookings/cancel/:id", isAdmin, async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, { status: "cancelled" });
    res.redirect("/admin/bookings");
});

module.exports = router;