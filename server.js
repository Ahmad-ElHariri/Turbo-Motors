// Load environment variables
require("dotenv").config();
const PORT = process.env.PORT || 5000;


const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require('bcrypt');
const collection = require("./config");

const app = express();
const server = http.createServer(app);


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Set view engine for contact form
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Routes
// Redirect root to /home
app.get("/", (req, res) => {
  res.redirect("/home");
});

// Render EJS views from /views folder
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
  res.render("reservation");
});

app.get("/reviews", (req, res) => {
  res.render("reviews");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// Add route for contact.ejs
app.get("/contact", (req, res) => {
  res.render("contact");
});



// Register User
app.post("/signup", async (req, res) => {
  const data = {
      name: req.body.username,
      password: req.body.password
  };

  const existingUser = await collection.findOne({ name: data.name });

  if (existingUser) {
      res.send('User already exists. Please choose a different username.');
  } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      data.password = hashedPassword;

      const userdata = await collection.insertMany(data);
      console.log(userdata);

      // ✅ Send response to browser
      res.send("Signup successful!");
      // Or: res.redirect("/");
  }
});


// Login user 
app.post("/login", async (req, res) => {
  try {
      const check = await collection.findOne({ name: req.body.username });
      if (!check) {
          res.send("User name cannot found")
      }
      // Compare the hashed password from the database with the plaintext password
      const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
      if (!isPasswordMatch) {
          res.send("wrong Password");
      }
      else {
          res.render("home");
      }
  }
  catch {
      res.send("wrong Details");
  }
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
