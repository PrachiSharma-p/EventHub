// routes/bookingRoutes.js — Book tickets and view digital booking confirmations
const express = require('express');
const crypto = require('crypto');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate a short, unique, human-readable booking code e.g. EVT-8F3K2A
const generateBookingCode = () =>
  'EVT-' + crypto.randomBytes(3).toString('hex').toUpperCase();

// POST /api/bookings — attendee: book seats for an event
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, seats } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const seatsAvailable = event.totalSeats - event.seatsBooked;
    if (seats > seatsAvailable) {
      return res.status(400).json({ message: `Only ${seatsAvailable} seats left` });
    }

    const booking = await Booking.create({
      event: event._id,
      user: req.user.id,
      seats,
      totalAmount: seats * event.price,
      bookingCode: generateBookingCode(),
    });

    event.seatsBooked += seats;
    await event.save();

    // populate for the digital confirmation response
    await booking.populate('event', 'title date venue price');
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/mine — attendee: my bookings / digital confirmations
router.get('/mine', protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate('event', 'title date venue price imageUrl')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// GET /api/bookings/:id — single booking confirmation (for QR / printable ticket view)
router.get('/:id', protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
});

// PUT /api/bookings/:id/cancel — attendee: cancel a booking
router.put('/:id/cancel', protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not your booking' });
  }
  booking.status = 'cancelled';
  await booking.save();

  const event = await Event.findById(booking.event);
  event.seatsBooked -= booking.seats;
  await event.save();

  res.json({ message: 'Booking cancelled' });
});

module.exports = router;
