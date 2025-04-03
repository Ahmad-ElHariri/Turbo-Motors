
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
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
