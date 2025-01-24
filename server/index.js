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
const { console } = require("inspector");

const app = express();
const port = process.env.PORT || 5000;

// Ensure critical environment variables are set
const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];
REQUIRED_ENV_VARS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Error: Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["https://launch.startupleague.net"], // Update with your frontend URL
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/assets", express.static("assets"));

// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
  });
}

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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
  createdAt: { type: Date, default: Date.now },
});
const Booking = mongoose.model("Booking", bookingSchema);

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
    console.error("Order Creation Error:", error.message);
    res.status(500).json({ error: "Failed to create Razorpay order", details: error.message });
  }
});

// Validate payment
app.post("/validate", (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  console.log(req.body);

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
    console.error("Validation Error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Save booking data and send email
app.post("/save-booking", async (req, res) => {
  
    console.log('Save Booking Request Body:', JSON.stringify(req.body, null, 2));
  
    const { 
      firstName, 
      secondName, 
      phoneNumber, 
      email, 
      paymentId, 
      orderId, 
      tickets, 
      totalAmount 
    } = req.body;
  
    if (!firstName || !secondName || !phoneNumber || !email || !paymentId || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields",
        receivedData: req.body 
      });
    }
  
    try {
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
  
      res.status(201).json({ 
        success: true, 
        message: "Booking saved successfully" 
      });
    } catch (error) {
      console.error("Error saving booking:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to save booking data",
        error: error.message 
      });
    }
  
});

// Razorpay Webhook (Optional but Recommended)
app.post("/webhook", express.json(), (req, res) => {
  const razorpaySignature = req.headers["x-razorpay-signature"];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  try {
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (generatedSignature === razorpaySignature) {
      console.log("Webhook Event Received:", req.body.event);
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to process webhook" });
  }
});

app.post("/webhook", express.json(), (req, res) => {
  console.log("Webhook event received:", req.body);

  const razorpaySignature = req.headers["x-razorpay-signature"];
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (generated_signature === razorpaySignature) {
    if (req.body.event === "payment.captured") {
      console.log("Payment captured for:", req.body.payload.payment.entity.id);
    }
    res.status(200).send("OK");
  } else {
    console.error("Invalid webhook signature.");
    res.status(400).send("Invalid signature.");
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
