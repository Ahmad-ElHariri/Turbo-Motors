const http=require("http");
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();


const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/contact", (req, res) => {
    res.render("contact", { message: null });
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

app.post("/send-message", async (req, res) => {
    const { name, email, message } = req.body;

    try {
        await sendEmail(name, email, message);
        res.render("contact", { message: "Message sent successfully!" });
    } catch (error) {
        res.render("contact", { message: "Failed to send message. Please try again." });
    }
});
app.get("/", (req, res) => {
    res.send("Welcome to Turbo Motors!");
});

app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "chat.html"));
});

app.get("/admin-chat", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "admin-chat.html"));
});

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
            console.log(`Admin ${username} connected`);
            socket.emit("message", `Admin ${username} connected`);

            io.to("adminRoom").emit("userList", Object.values(users).map(user => user.username));

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

            console.log(`${username} joined room: ${socket.room}`);
            socket.emit("message", `Welcome, ${username}!`);
            io.to("adminRoom").emit("message", `${username} joined the chat`);

            if (!chatHistory[socket.room]) chatHistory[socket.room] = [];
            chatHistory[socket.room].push(`Welcome, ${username}!`);

            if (chatHistory[socket.room]) {
                socket.emit("previousMessages", chatHistory[socket.room]);
            }

            io.to("adminRoom").emit("userList", Object.values(users).map(user => user.username));
        }
    });

    socket.on("switchRoom", (room) => {
        if (socket.role === "Admin") {
            socket.leave(socket.room);
            socket.room = room;
            socket.join(socket.room);
            console.log(`Admin switched to room: ${room}`);
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
    const messageText = data.text || "No message content";
    const formattedMessage = `${sender}: ${messageText}`;

    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(formattedMessage);

    if (chatHistory[room].length > 50) {
        chatHistory[room].shift();
    }


    io.to(room).emit("message", formattedMessage);


    if (socket.role !== "Admin") {
        io.to("adminRoom").emit("message", `[${sender}]: ${messageText}`);
    }
});

    socket.on("requestHistory", (room) => {
        if (chatHistory[room]) {
            socket.emit("previousMessages", chatHistory[room]);
        }
    });

    socket.on("disconnect", () => {
        if (users[socket.id]) {
            const disconnectedUser = users[socket.id].username;
            delete users[socket.id];
            io.to("adminRoom").emit("userList", Object.values(users).map(user => user.username));
            console.log(`${disconnectedUser} disconnected`);
            io.emit("message", `${disconnectedUser} disconnected`);
        }

        if (admins[socket.id]) {
            const disconnectedAdmin = admins[socket.id];
            delete admins[socket.id];
            console.log(`Admin ${disconnectedAdmin} disconnected`);
        }
    });
});



server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
