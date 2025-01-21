const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  paymentId: { type: String, required: true }, // Razorpay payment ID
  orderId: { type: String, required: true },  // Razorpay order ID
  qrCode: { type: String }, // QR Code as base64 string
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);