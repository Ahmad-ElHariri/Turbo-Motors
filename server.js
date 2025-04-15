// Import External Modules
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { Server } = require("socket.io");
const express = require("express");
const bcrypt = require('bcrypt');
const http = require("http");
const path = require("path");
const multer = require('multer');
require("dotenv").config();



// Import Internal Modules
const collection = require("./models/users.js");
const Car = require("./models/car"); 
const Review = require("./models/review");

// Local Variables
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app); // Initialize server with app
const io = new Server(server);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.user = req.cookies.user || null;
  next();
});
app.use(express.json());

// Set view engine for EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });
// Routes
app.get("/", (req, res) => {
  res.redirect("/home");
});


app.get("/profile", async (req, res) => {
  const user = req.cookies.user;
  if (!user) return res.redirect("/login");

  const currentUser = await collection.findById(user.id);
  res.render("profile", { user: currentUser, message: null });
});


/// Route to fetch 3 random cars from distinct groups
app.get("/home", async (req, res) => {
  const user = req.cookies.user;

  try {
    // Define the distinct groups you want to fetch from (4 groups)
    const groups = ['Electric', 'Luxury', 'SUV', 'Convertible'];

    // Randomly select 3 groups from the 4 available groups
    const selectedGroups = groups.sort(() => 0.5 - Math.random()).slice(0, 3); 

    // Fetch 1 random car from each selected group
    const randomCars = [];
    for (let group of selectedGroups) {
      const car = await Car.aggregate([
        { $match: { group: group } }, // Match the group
        { $sample: { size: 1 } } // Randomly sample 1 car from this group
      ]);

      // Only push valid cars to randomCars
      if (car.length > 0) {
        randomCars.push(car[0]);
      }
    }

    // Log the cars to verify the structure
    console.log(randomCars); // Log to ensure each car has an _id field

    res.render("home", { user, cars: randomCars });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).send("Error fetching car data.");
  }
});



// Fetch car details by ID
// Route to fetch car details by ID
app.get("/car/:id", async (req, res) => {
  const carId = req.params.id;
  try {
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).send("Car not found");
    }
    res.json(car); // Send car data as JSON
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).send("Error fetching car data");
  }
});


// Fetch all cars for allcars route
app.get("/allcars", async (req, res) => {
  try {
    const cars = await Car.find(); // Fetch all cars from the database
    res.render("allcars", { cars }); // Pass the 'cars' array to the EJS view
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).send("Error fetching car data");
  }
});

app.get("/chat", (req, res) => {
  res.render("chat");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/reservation", (req, res) => {
  const user = req.cookies.user;
  if (!user) return res.redirect("/login");
  
  res.render("reservation", { user }); // optional: send user info to EJS
});

app.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ time: -1 }).populate("userId", "displayName profilePicture");
    res.render("reviews", { reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Error fetching reviews.");
  }
});


app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/contact", (req, res) => {
  res.render("contact", { message: null });
});

app.get("/logout", (req, res) => {
  res.clearCookie("user"); // This deletes the cookie
  res.redirect("/login");  // Send the user back to login page
});

// Register User
app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.username,
    password: req.body.password
  };
  const existingUser = await collection.findOne({ name: data.name });
  if (req.body.password !== req.body.confirmPassword) {
    return res.render("signup", { message: "Passwords do not match." });
  }
  if (existingUser) {
    return res.render("signup", { message: "Username already exists. Please choose another one." });
  } else {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    const userdata = await collection.insertMany(data);
    console.log(userdata);

    res.redirect("/login");
  }
});

// Login user 
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ name: req.body.username });
    if (!check) {
      return res.render("login", { message: "Username not found." });
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if (!isPasswordMatch) {
      return res.render("login", { message: "Incorrect password." });
    }

    // Set cookie
    res.cookie("user", {
      id: check._id,
      name: check.name,
      isAdmin: check.isAdmin
    }, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    });

    // Check for missing profile data
    const needsProfileUpdate = !check.profilePicture || !check.age || !check.displayName;

    if (needsProfileUpdate) {
      return res.redirect("/profile");
    } else {
      return res.redirect("/home");
    }

  } catch (err) {
    console.error(err);
    return res.render("login", { message: "Something went wrong. Please try again." });
  }
});


// Contact us functions
app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await sendEmail(name, email, message);
    res.render("contact", { message: "Message sent successfully!" });
  } catch (error) {
    res.render("contact", { message: "Failed to send message. Please try again." });
  }
});
app.post("/profile", upload.single("profileImage"), async (req, res) => {
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
      to: "elhariri2023@gmail.com",
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
// Route to post a new review
app.post("/reviews", async (req, res) => {
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
// Delete review route
app.post("/reviews/:id/delete", async (req, res) => {
  const user = req.cookies.user;
  if (!user) return res.redirect("/login");

  try {
    const review = await Review.findById(req.params.id);
    
    // Ensure that the logged-in user is the one who posted the review
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


//Chat mechanism 

const users = {};
const admins = {};
const chatHistory = {};

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("joinRoom", (username) => {
    const referer = socket.handshake.headers.referer;
    const role = referer.includes("/admin-chat") ? "Admin" : "User";

    if (role === "Admin") {
      socket.role = "Admin";
      socket.username = username;
      admins[socket.id] = username;
      socket.join("adminRoom");
      socket.emit("message", `Admin ${username} connected`);

      io.to("adminRoom").emit("userList", Object.values(users).map(u => u.username)); 

    } else {
      socket.role = "User";
      socket.username = username;
      socket.room = username;
      users[socket.id] = { username, room: username };
      socket.join(socket.room);

      socket.emit("message", `Welcome, ${username}!`);

      io.to("adminRoom").emit("message", `${username} joined the chat`);

      if (!chatHistory[socket.room]) chatHistory[socket.room] = [];
      chatHistory[socket.room].push(`Welcome, ${username}!`);

      socket.emit("previousMessages", chatHistory[socket.room]);
      io.to("adminRoom").emit("userList", Object.values(users).map(u => u.username));
    }
  });

  socket.on("switchRoom", (room) => {
    if (socket.role === "Admin") {
      socket.leave(socket.room);
      socket.room = room;
      socket.join(room);
      socket.emit("message", `Switched to chat with ${room}`);
  
      if (chatHistory[room]) {
        socket.emit("previousMessages", { room, messages: chatHistory[room] }); // FIXED
      } else {
        socket.emit("message", `No previous messages with ${room}`);
      }
    }
  });
  

  socket.on("chatMessage", (data) => {
    const room = socket.room || data.roomId;
    const sender = socket.username || "Admin";
    const msg = data.text || "No message";
    const formatted = `${sender}: ${msg}`;

    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(formatted);
    if (chatHistory[room].length > 50) chatHistory[room].shift();

    io.to(room).emit("message", formatted);
  });

  socket.on("requestHistory", (room) => {
    if (chatHistory[room]) {
      socket.emit("previousMessages", chatHistory[room]);
    }
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      const name = users[socket.id].username;
      delete users[socket.id];
      io.to("adminRoom").emit("userList", Object.values(users).map(u => u.username));
      io.emit("message", `${name} disconnected`);
    }
    if (admins[socket.id]) {
      const name = admins[socket.id];
      delete admins[socket.id];
      console.log(`Admin ${name} disconnected`);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
