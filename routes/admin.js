const express = require("express");
const router = express.Router();
const Car = require("../models/car");
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

// View all cars
router.get("/cars", isAdmin, async (req, res) => {
    const cars = await Car.find();
    res.render("admin/admin-cars", { cars });
});

// Show form to add a new car
router.get("/cars/new", isAdmin, (req, res) => {
    res.render("admin/new-car");
});

// Handle new car creation
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

// Show edit form
router.get("/cars/edit/:id", isAdmin, async (req, res) => {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send("Car not found");
    res.render("admin/edit-car", { car });
});

// Handle car update
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

// Delete car
router.post("/cars/delete/:id", isAdmin, async (req, res) => {
    await Car.findByIdAndDelete(req.params.id);
    res.redirect("/admin/cars");
});

module.exports = router;