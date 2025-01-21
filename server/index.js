require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://launch.startupleague.net", // Allowed origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, etc.)
    exposedHeaders: ["x-rtb-fingerprint-id"], // Expose custom headers
  })
);

// Add middleware to explicitly expose the headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://launch.startupleague.net");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Expose-Headers", "x-rtb-fingerprint-id"); // Expose the custom header
  next();
});

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Venue details
const VENUE_DETAILS = {
  name: "Startup League Conference Hall",
  address: "",
  date: "Feb 23rd, 2025",
  time: "08:30 AM to 06:30 PM",
};

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Booking Schema
const bookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Booking = mongoose.model("Booking", bookingSchema);

// Generate Ticket Email Template
const generateTicketHTML = (ticketDetails, qrCode) => {
  const {
    firstName,
    secondName,
    email,
    phoneNumber,
    paymentId,
    orderId,
    tickets = [],
    venueDetails,
  } = ticketDetails;

  const totalTickets = tickets.length > 0 ? tickets.reduce((sum, ticket) => sum + ticket.quantity, 0) : 0;

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h1 style="text-align: center;">Startup League Event 2025</h1>
      <img src="cid:ticketImage" alt="Ticket" style="width: 100%; max-width: 600px; display: block; margin: 0 auto;" />

      <h2>Ticket Details</h2>
      <p><strong>Name:</strong> ${firstName} ${secondName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phoneNumber}</p>
      <p><strong>Payment ID:</strong> ${paymentId}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>

      <h2>Venue Details</h2>
      <p><strong>Venue:</strong> HITEX Exhibition Center, Hyderabad, Telangana 500084</p>
      <p><strong>Date:</strong> Feb 23rd, 2025</p>
      <p><strong>Time:</strong> 08:30 AM to 06:30 PM</p>

      <h2>Order Summary</h2>
      ${tickets.length > 0
        ? tickets.map((ticket) => `<p><strong>${ticket.type}:</strong> ${ticket.quantity} ticket(s)</p>`).join("")
        : "<p>No tickets available</p>"}
      <p><strong>Total Tickets:</strong> ${totalTickets}</p>

      <h2>Scan for Details</h2>
      <img src="${qrCode}" alt="QR Code" style="display: block; margin: 0 auto;" />
    </div>
  `;
};

// Routes
app.get("/", (req, res) => {
  res.send("Razorpay backend is running.");
});

// Create Razorpay order
app.post("/order", async (req, res) => {
  const { amount, currency, receipt } = req.body;

  if (!amount || !currency || !receipt) {
    return res.status(400).json({ error: "Missing required fields: amount, currency, receipt" });
  }

  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: "Failed to create Razorpay order", details: error.message });
  }
});

// Validate payment
app.post("/validate", (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Save booking data and send email
app.post("/save-booking", async (req, res) => {
  const { firstName, secondName, phoneNumber, email, paymentId, orderId, tickets, venueDetails } = req.body;

  if (!firstName || !secondName || !phoneNumber || !email || !paymentId || !orderId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Generate QR Code
    const qrData = JSON.stringify({
      name: `${firstName} ${secondName}`,
      email,
      phoneNumber,
      paymentId,
      orderId,
      tickets,
      venueDetails,
    });
    const qrCode = await QRCode.toDataURL(qrData);

    // Save booking data
    const newBooking = new Booking({
      firstName,
      secondName,
      phoneNumber,
      email,
      paymentId,
      orderId,
    });
    await newBooking.save();

    // Generate email content
    const emailContent = generateTicketHTML(
      {
        firstName,
        secondName,
        email,
        phoneNumber,
        paymentId,
        orderId,
        tickets,
        venueDetails,
      },
      "cid:qrCodeImage"
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "developer@bizandbeez.com",
        pass: "lqfzkxurejqzdnpq",
      },
    });

    const mailOptions = {
      from: '"Startup League" <developer@bizandbeez.com>',
      to: email,
      subject: "Booking Confirmation - Startup League",
      html: emailContent,
      attachments: [
        {
          filename: "TicketImg.jpg",
          path: path.join(__dirname, "./assets/TicketImg.jpg"),
          cid: "ticketImage",
        },
        {
          filename: "QrCode.png",
          content: Buffer.from(qrCode.split(",")[1], "base64"),
          cid: "qrCodeImage",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ success: true, message: "Booking saved and email sent." });
  } catch (error) {
    console.error("Error saving booking data or sending email:", error);
    res.status(500).json({ success: false, message: "Failed to save booking data or send email." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
