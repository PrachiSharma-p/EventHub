// models/Booking.js — A ticket booking made by an attendee for an event
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seats: { type: Number, required: true, default: 1 },
    totalAmount: { type: Number, required: true },
    bookingCode: { type: String, required: true, unique: true }, // digital confirmation code
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
