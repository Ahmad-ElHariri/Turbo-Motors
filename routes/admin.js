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

const PDFDocument = require("pdfkit");

// Generate invoice as PDF
router.get("/bookings/invoice/:id", isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate("selectedCars.car");

    if (!booking) return res.status(404).send("Booking not found");

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${booking._id}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text("Turbo Motors - Rental Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice ID: ${booking._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Customer: ${booking.user.name} (${booking.user.email || "N/A"})`);
    doc.moveDown();

    doc.text(`Pickup: ${booking.reservation.pickupLocation} @ ${new Date(booking.reservation.pickupDateTime).toLocaleString()}`);
    doc.text(`Dropoff: ${booking.reservation.dropoffLocation} @ ${new Date(booking.reservation.dropoffDateTime).toLocaleString()}`);
    doc.text(`Driver Age: ${booking.reservation.driverAge}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown();

    doc.fontSize(14).text("Cars Rented:");
    booking.selectedCars.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.car.brand} ${item.car.model} — $${item.dailyRate}/day`);
    });
    doc.moveDown();

    doc.fontSize(14).text("Extras:");
    const { chauffeur, babySeat, navigator, gps, insurance, fuel } = booking.extras;
    if (chauffeur) doc.text("- Chauffeur");
    if (babySeat) doc.text("- Baby Seat");
    if (navigator) doc.text("- Satellite Navigator");
    if (gps) doc.text("- GPS");
    if (insurance !== "none") doc.text(`- Insurance: ${insurance}`);
    if (fuel !== "none") doc.text(`- Fuel Option: ${fuel}`);
    doc.moveDown();

    doc.fontSize(14).text(`Total Price: $${booking.totalPrice.toFixed(2)}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating invoice");
  }
});

router.get("/", isAdmin, (req, res) => {
    res.render("admin/admin-dashboard");
  });
  


module.exports = router;