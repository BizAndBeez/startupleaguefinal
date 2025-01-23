const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://startupleaguefinal-front.onrender.com",
  "https://launch.startupleague.net",
];

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err.message));

// Define Booking Schema and Model
const bookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  tickets: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Order Creation Route
app.post("/order", async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    if (!amount || !currency || !receipt) {
      return res.status(400).json({ success: false, error: "Missing parameters" });
    }

    const options = { amount: amount * 100, currency, receipt };
    const order = await razorpay.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Order Creation Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

// Payment Validation Route
app.post("/validate", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Validation Error:", error.message);
    res.status(500).json({ success: false, error: "Validation failed" });
  }
});

// Save Booking Route
app.post("/save-booking", async (req, res) => {
  try {
    const { firstName, secondName, email, phoneNumber, tickets, totalAmount, paymentId, orderId } = req.body;

    if (!firstName || !secondName || !email || !phoneNumber || !tickets || !totalAmount || !paymentId || !orderId) {
      return res.status(400).json({ success: false, error: "Missing booking details" });
    }

    const booking = new Booking({
      firstName,
      secondName,
      email,
      phoneNumber,
      tickets,
      totalAmount,
      paymentId,
      orderId,
    });

    await booking.save();

    res.status(200).json({ success: true, message: "Booking saved successfully" });
  } catch (error) {
    console.error("Save Booking Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to save booking" });
  }
});

// Webhook Route
app.post("/webhook", express.json(), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpaySignature = req.headers["x-razorpay-signature"];
    const generated_signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (generated_signature !== razorpaySignature) {
      return res.status(400).json({ success: false, error: "Invalid webhook signature" });
    }

    if (req.body.event === "payment.captured") {
      console.log("Payment Captured:", req.body.payload.payment.entity);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(500).json({ success: false, error: "Webhook failed" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
