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
const postRoutes = require("./routes/post.js");
const getRoutes = require("./routes/get.js");
const collection = require("./models/users.js");
const Car = require("./models/car"); 
const Review = require("./models/review");
const Reservation = require("./models/reservations");



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



// Get Functions 
app.use("/", getRoutes);



// Post Functions
app.use("/", postRoutes);



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