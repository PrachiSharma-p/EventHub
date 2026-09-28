// server.js — Entry point for the Event Management & Ticket Booking API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Connect to MongoDB (Atlas or local) ----
connectDB();

// ---- Routes ----
app.use('/api/auth', authRoutes);       // register / login
app.use('/api/events', eventRoutes);    // create / list / update / delete events
app.use('/api/bookings', bookingRoutes);// book tickets / view bookings

app.get('/', (req, res) => {
  res.send('Event Management & Ticket Booking API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
