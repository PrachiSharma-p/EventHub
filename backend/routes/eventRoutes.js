// routes/eventRoutes.js — Browse, create, update, delete events
const express = require('express');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/events — public: browse/search all events
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const events = await Event.find(filter).sort({ date: 1 });
  res.json(events);
});

// GET /api/events/:id — public: single event details
router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

// POST /api/events — authenticated users can create events
router.post('/', protect, async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user.id });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/events/:id — organizer only: update own event
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your event' });
    }

    const editableFields = [
      'title', 'description', 'category', 'venue', 'date',
      'price', 'ticketType', 'totalSeats', 'imageUrl',
    ];
    editableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) event[field] = req.body[field];
    });
    if (event.totalSeats < event.seatsBooked) {
      return res.status(400).json({ message: 'Total seats cannot be less than seats already booked' });
    }

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/events/:id — organizer only: delete own event
router.delete('/:id', protect, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (event.organizer.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not your event' });
  }
  await event.deleteOne();
  res.json({ message: 'Event deleted' });
});

// GET /api/events/mine/list — events created by the logged-in user
router.get('/mine/list', protect, async (req, res) => {
  const events = await Event.find({ organizer: req.user.id });
  res.json(events);
});

module.exports = router;
