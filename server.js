// Import External Modules
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { Server } = require("socket.io");
const express = require("express");
const bcrypt = require('bcrypt');
const helmet = require("helmet");
const http = require("http");
const path = require("path");



// Import Internal Modules
const collection = require("./models/users.js");
const Car = require("./models/car");
require("dotenv").config();



// Local Variables
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server);
const app = express();



// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.locals.user = req.cookies.user || null;
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(helmet());



// Set view engine for contact form
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



// Routes
app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/admin-chat", (req, res) => {
  res.render("admin-chat");
});

app.get("/allcars", (req, res) => {
  res.render("allcars");
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

app.get("/reviews", (req, res) => {
  res.render("reviews");
});

app.get("/signup", (req, res) => {
  res.render("signup");
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

    // // ✅ Send response to browser
    // res.send("Signup successful!");
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
    // Compare the hashed password from the database with the plaintext password
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if (!isPasswordMatch) {
      return res.render("login", { message: "Incorrect password." });
    }
    else {
      res.cookie("user", {
        id: check._id,
        name: check.name,
        isAdmin: check.isAdmin
      }, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
      });
      // ✅ Login successful
      // login process successful, here we should add something so that we use the user info for reservations and things
      // also here we can check if this user is an admin and then change the isAdmin in database to true, based
      // on this lot of things will happen like rendering admin.ejs instead of home.ejs 
      res.render("home");
    }
  }
  catch {
    res.render("login", { message: "Something went wrong. Please try again." });
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



// Socket.IO Chat Logic


/*
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

      Object.keys(chatHistory).forEach((room) => {
        if (chatHistory[room]) {
          socket.emit("previousMessages", chatHistory[room]);
        }
      });

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
        socket.emit("previousMessages", chatHistory[room]);
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
    if (socket.role !== "Admin") {
      io.to("adminRoom").emit("message", `[${sender}]: ${msg}`);
    }
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
*/


// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});