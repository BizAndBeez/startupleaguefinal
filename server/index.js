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
const allowedOrigins = ['http://localhost:5173', 'https://launch.startupleague.net'];

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Additional headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

const Booking = mongoose.model("Booking", bookingSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
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
        details: "amount, currency, and receipt are required" 
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
    res.status(500).json({ 
      success: false,
      error: "Failed to create Razorpay order",
      details: error.message 
    });
  }
});

// Validate payment
app.post("/validate", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing payment validation fields" 
      });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error validating payment",
      details: error.message 
    });
  }
});

// Save booking data
app.post("/save-booking", async (req, res) => {
  try {
    const { firstName, secondName, phoneNumber, email, paymentId, orderId } = req.body;

    if (!firstName || !secondName || !phoneNumber || !email || !paymentId || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required booking fields" 
      });
    }

    const qrCode = await QRCode.toDataURL(
      JSON.stringify({
        firstName,
        secondName,
        phoneNumber,
        email,
        paymentId,
        orderId,
        timestamp: new Date().toISOString()
      })
    );

    const booking = new Booking({
      firstName,
      secondName,
      phoneNumber,
      email,
      paymentId,
      orderId,
      status: 'confirmed'
    });

    await booking.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${firstName} ${secondName},</p>
        <p>Your booking has been confirmed.</p>
        <p>Booking Details:</p>
        <ul>
          <li>Order ID: ${orderId}</li>
          <li>Payment ID: ${paymentId}</li>
        </ul>
        <img src="${qrCode}" alt="QR Code"/>
      `
    });

    res.status(201).json({ 
      success: true, 
      message: "Booking saved successfully",
      qrCode,
      bookingId: booking._id
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error saving booking",
      details: error.message 
    });
  }
});

// Webhook route
app.post("/webhook", (req, res) => {
  try {
    const webhookBody = JSON.stringify(req.body);
    const razorpaySignature = req.headers["x-razorpay-signature"];

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const generated_signature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookBody)
      .digest("hex");

    if (generated_signature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body.event;

    switch (event) {
      case "payment.captured":
        console.log("Payment Captured:", req.body.payload.payment.entity);
        break;
      case "payment.failed":
        console.log("Payment Failed:", req.body.payload.payment.entity);
        break;
      default:
        console.log("Unhandled event:", event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Webhook processing failed", 
      details: error.message 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});
