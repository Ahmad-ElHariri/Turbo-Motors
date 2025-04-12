// Load environment variables
require("dotenv").config();

const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const helmet = require("helmet");
app.use(helmet());

const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Set view engine for contact form
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Turbo Motors!");
});

app.get("/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "home.html"));
});

app.get("/about.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "about.html"));
});

app.get("/contact", (req, res) => {
  res.render("contact", { message: null });
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "chat.html"));
});

app.get("/admin-chat", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-chat.html"));
});

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
      to: "mohammadserhanpro@gmail.com",
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

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
