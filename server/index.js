const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://launch.startupleague.net",
  "https://startupleaguefinal-front.onrender.com",
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Booking Schema
const bookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Routes
app.get("/", (req, res) => {
  res.send("Razorpay backend is running.");
});

// Create Razorpay order
app.post("/order", async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    if (!amount || !currency || !receipt) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ success: false, error: "Failed to create Razorpay order" });
  }
});

// Validate payment
app.post("/validate", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment validation fields" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Error validating payment:", error.message);
    res.status(500).json({ success: false, message: "Payment validation failed" });
  }
});

// Save booking data
app.post("/save-booking", async (req, res) => {
  try {
    const { firstName, secondName, phoneNumber, email, paymentId, orderId } = req.body;

    if (!firstName || !secondName || !phoneNumber || !email || !paymentId || !orderId) {
      return res.status(400).json({ success: false, message: "Missing required booking fields" });
    }

    const qrCode = await QRCode.toDataURL(
      JSON.stringify({ firstName, secondName, phoneNumber, email, paymentId, orderId })
    );

    const booking = new Booking({
      firstName,
      secondName,
      phoneNumber,
      email,
      paymentId,
      orderId,
      status: "confirmed",
    });

    await booking.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmation",
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${firstName} ${secondName},</p>
        <p>Your booking has been confirmed.</p>
        <p>Booking Details:</p>
        <ul>
          <li>Order ID: ${orderId}</li>
          <li>Payment ID: ${paymentId}</li>
        </ul>
        <img src="${qrCode}" alt="QR Code" />
      `,
    });

    res.status(201).json({ success: true, message: "Booking saved successfully" });
  } catch (error) {
    console.error("Error saving booking:", error.message);
    res.status(500).json({ success: false, message: "Error saving booking" });
  }
});

// Webhook route
app.post("/webhook", express.json(), async (req, res) => {
  try {
    const webhookBody = JSON.stringify(req.body);
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const webhookSecret = "indian@2025";

    const generated_signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookBody)
      .digest("hex");

    if (generated_signature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
      console.log("Payment Captured:", payment);

      // Update database with captured payment status
      await Booking.updateOne({ orderId: payment.order_id }, { status: "captured" });
    } else if (event === "payment.failed") {
      const payment = req.body.payload.payment.entity;
      console.log("Payment Failed:", payment);

      // Update database with failed payment status
      await Booking.updateOne({ orderId: payment.order_id }, { status: "failed" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});
