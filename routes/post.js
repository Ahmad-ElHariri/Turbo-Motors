// routes/post.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const collection = require("../models/users");
const Reservation = require("../models/reservations");
const Review = require("../models/review");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const Booking = require("../models/booking");
const calculateTotal = require("../utils/price");



// Set up Multer again here if needed
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/images"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });


// Email sender function
async function sendEmail(name, email, message) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: "elhariri.ahmad06@gmail.com",
            subject: `Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        };
        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", result);
        return result;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
}


// Contact Us
router.post("/send-message", async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await sendEmail(name, email, message);
        res.render("contact", { message: "Message sent successfully!" });
    } catch (error) {
        res.render("contact", { message: "Failed to send message." });
    }
});


// Profile image
router.post("/profile", upload.single("profileImage"), async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");

    const updateData = {
        displayName: req.body.displayName,
        age: req.body.age
    };

    if (req.file) {
        updateData.profilePicture = `/images/${req.file.filename}`;
    }

    await collection.findByIdAndUpdate(user.id, updateData);
    const updatedUser = await collection.findById(user.id);
    res.render("profile", { user: updatedUser, message: "Profile updated successfully!" });
});



// Reviews Page
router.post("/reviews", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");

    try {
        const newReview = new Review({
            userId: user.id,
            title: req.body.title,
            body: req.body.body,
            rating: parseInt(req.body.rating),
        });
        await newReview.save();
        res.redirect("/reviews");
    } catch (error) {
        console.error("Error posting review:", error);
        res.status(500).send("Error posting review.");
    }
});



// Reviews Delete
router.post("/reviews/:id/delete", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");

    try {
        const review = await Review.findById(req.params.id);
        if (review.userId.toString() === user.id) {
            await Review.findByIdAndDelete(req.params.id);
            res.redirect("/reviews");
        } else {
            res.status(403).send("You cannot delete someone else's review.");
        }
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).send("Error deleting review.");
    }
});



// Signup
router.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };
    const existingUser = await collection.findOne({ name: data.name });
    if (req.body.password !== req.body.confirmPassword) {
        return res.render("signup", { message: "Passwords do not match." });
    }
    if (existingUser) {
        return res.render("signup", { message: "Username already exists." });
    } else {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
        await collection.insertMany(data);
        res.redirect("/login");
    }
});



// Login
router.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) return res.render("login", { message: "Username not found." });

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) return res.render("login", { message: "Incorrect password." });

        res.cookie("user", {
            id: check._id,
            name: check.name,
            isAdmin: check.isAdmin
        }, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24
        });

        const needsProfileUpdate = !check.profilePicture || !check.age || !check.displayName;
        if (needsProfileUpdate) {
            return res.redirect("/profile");
        } else {
            return res.redirect("/home");
        }

    } catch (err) {
        console.error(err);
        return res.render("login", { message: "Something went wrong." });
    }
});



// Reservation Functions

// Reservation (Date & Location)
router.post("/reservation", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");

    try {
        const {
            pickupLocation,
            dropoffLocation,
            pickupDate,
            pickupTime,
            dropoffDate,
            dropoffTime
        } = req.body;

        const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
        const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}`);

        const reservationData = new Reservation({
            user: user.id,
            pickupLocation,
            dropoffLocation,
            pickupDateTime,
            dropoffDateTime,
        });
        // Save reservation ID to cookie so you can retrieve it later
        res.cookie("reservationData", JSON.stringify(reservationData), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 2
        });

        res.redirect("/choose-car");
    } catch (err) {
        console.error("❌ Error creating reservation:", err);
        res.status(500).send("Something went wrong while creating the reservation.");
    }
});



// Choosing cars
const Car = require("../models/car"); // make sure Car model is imported

router.post("/choose-car", async (req, res) => {
    try {
        const selectedCarIds = JSON.parse(req.body.selectedCars || "[]");

        if (!Array.isArray(selectedCarIds) || selectedCarIds.length === 0) {
            return res.status(400).send("No cars selected.");
        }

        // Fetch full car documents from DB
        const selectedCars = await Car.find({ _id: { $in: selectedCarIds } });

        // Save full car objects to cookie
        res.cookie("selectedCars", JSON.stringify(selectedCars), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60
        });

        res.redirect("/extra");
    } catch (error) {
        console.error("Error handling car selection:", error);
        res.status(500).send("Failed to process selected cars.");
    }
});




// extras 
router.post("/extras", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");

    try {
        const selectedExtras = JSON.parse(req.body.selectedExtras || '{}');

        res.cookie("selectedExtras", JSON.stringify(selectedExtras), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60
        });

        res.redirect("/booking-checkout");

    } catch (error) {
        console.error("❌ Error processing extras:", error);
        res.status(500).send("Something went wrong while processing extras.");
    }
});

router.post("/proceed", async (req,res) => {
    res.redirect("/checkout");
});

router.post("/booking/save", async (req, res) => {
    const user = req.cookies.user;
    if (!user) return res.redirect("/login");
  
    const reservationData = JSON.parse(req.cookies.reservationData || "{}");
    const selectedCars = JSON.parse(req.cookies.selectedCars || "[]");
    const selectedExtras = JSON.parse(req.cookies.selectedExtras || "{}");
  
    try {
      // Remove previous saved booking (if any)
      await Booking.deleteOne({ user: user.id, status: "saved" });
  
      const booking = new Booking({
        user: user.id,
        reservation: reservationData,
        selectedCars: selectedCars.map(car => ({
          car: car._id,
          dailyRate: car.pricePerDay
        })),
        extras: selectedExtras,
        totalPrice:calculateTotal(cars, extras, pickupDateTime, dropoffDateTime),
        status: "saved"
      });
  
      await booking.save();
  
      // Clear cookies for a clean state
      res.clearCookie("reservationData");
      res.clearCookie("selectedCars");
      res.clearCookie("selectedExtras");
  
      res.redirect("/home");
    } catch (err) {
      console.error("Error saving booking:", err);
      res.status(500).send("Could not save booking.");
    }
  });
  

  router.post("/booking/confirm", async (req, res) => {
    const userCookie = req.cookies.user;
    if (!userCookie) return res.redirect("/login");

    const reservationData = JSON.parse(req.cookies.reservationData || "{}");
    const selectedCars = JSON.parse(req.cookies.selectedCars || "[]");
    const selectedExtras = JSON.parse(req.cookies.selectedExtras || "{}");

    const pickup = new Date(reservationData.pickupDateTime);
    const dropoff = new Date(reservationData.dropoffDateTime);

    if (selectedExtras.insurance === "") delete selectedExtras.insurance;
    if (selectedExtras.fuel === "") delete selectedExtras.fuel;

    let totalPrice = calculateTotal(selectedCars, selectedExtras, pickup, dropoff);

    const coupon = req.body.coupon?.trim();
    const usePoints = req.body.usePointsUsed === "true";
    let discountMessage = "";

    if (coupon === "DISCOUNT10") {
        totalPrice *= 0.9;
        discountMessage += "Coupon applied. ";
    }

    const user = await collection.findById(userCookie.id);
    if (usePoints) {
        if (user.points < 10) {
            return res.status(400).send("You need at least 10 points to use them.");
        }
        totalPrice *= 0.9;
        user.points -= 10;
        discountMessage += "10 points used. ";
    }

    const booking = new Booking({
        user: user._id,
        reservation: reservationData,
        selectedCars: selectedCars.map(car => ({
            car: car._id,
            dailyRate: car.pricePerDay
        })),
        extras: selectedExtras,
        couponCode: coupon || null,
        totalPrice,
        status: req.body.paymentMethod === "online" ? "paid" : "saved"
    });

    await booking.save();
    await Car.updateMany(
        { _id: { $in: selectedCars.map(car => car._id) } },
        { available: false }
    );

    // ✅ Add points: 1 point per $100
    const earnedPoints = Math.floor(totalPrice / 100);
    user.points += earnedPoints;

    await user.save();

    res.clearCookie("reservationData");
    res.clearCookie("selectedCars");
    res.clearCookie("selectedExtras");

    res.render("confirmation", {
        user,
        booking,
        message: `Booking confirmed successfully! ${discountMessage}You earned ${earnedPoints} point(s).`
    });
});

router.get("/my-bookings", async (req, res) => {
    const userCookie = req.cookies.user;
    if (!userCookie) return res.redirect("/login");
  
    try {
      const bookings = await Booking.find({ user: userCookie.id })
        .populate("selectedCars.car")
        .sort({ createdAt: -1 });
  
      const user = await collection.findById(userCookie.id); // ✅ fetch full user with points
  
      res.render("my-bookings", { user, bookings }); // ✅ pass user with points
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).send("Failed to load your bookings.");
    }
  });
  router.post("/my-bookings/:id/delete", async (req, res) => {
    const userCookie = req.cookies.user;
    if (!userCookie) return res.redirect("/login");
  
    try {
      const booking = await Booking.findOne({ _id: req.params.id, user: userCookie.id });
      if (!booking) return res.status(404).send("Booking not found.");
  
      // ✅ Mark cars available
      const carIds = booking.selectedCars.map(c => c.car);
      await Car.updateMany({ _id: { $in: carIds } }, { available: true });
  
      // ✅ Remove loyalty points earned
      const earnedPoints = Math.floor(booking.totalPrice / 100);
      await collection.findByIdAndUpdate(userCookie.id, { $inc: { points: -earnedPoints } });
  
      // ✅ Delete booking
      await Booking.deleteOne({ _id: booking._id });
  
      res.redirect("/my-bookings");
    } catch (err) {
      console.error("❌ Error cancelling booking:", err);
      res.status(500).send("Failed to cancel booking.");
    }
  });
  
  
module.exports = router;