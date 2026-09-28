// models/Event.js — An event created by an organizer
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    price: { type: Number, required: true, default: 0 },
    ticketType: { type: String, enum: ['General', 'VIP', 'Premium'], default: 'General' },
    totalSeats: { type: Number, required: true },
    seatsBooked: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Virtual: seats remaining
eventSchema.virtual('seatsAvailable').get(function () {
  return this.totalSeats - this.seatsBooked;
});

module.exports = mongoose.model('Event', eventSchema);
