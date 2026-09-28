// routes/authRoutes.js — Register & login for organizers and attendees
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userData = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  profilePicture: user.profilePicture || '',
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, profilePicture } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name: name.trim(), email: normalizedEmail, password, role,
      phone: phone?.trim() || '', profilePicture: profilePicture?.trim() || '',
    });
    res.status(201).json({ ...userData(user), token: generateToken(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()
      || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user || user.name.trim().toLowerCase() !== name.trim().toLowerCase()
      || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid name, email, or password' });
    }
    res.json({ ...userData(user), token: generateToken(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(userData(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/me
router.put('/me', protect, async (req, res) => {
  try {
    const { name, email, phone, profilePicture } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.phone = phone?.trim() || '';
    user.profilePicture = profilePicture?.trim() || '';
    await user.save();
    res.json(userData(user));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already registered' });
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  if (!emailConfigured && process.env.NODE_ENV === 'production') {
    return res.status(503).json({ message: 'Password reset email is not configured' });
  }

  try {
    const email = req.body.email?.trim().toLowerCase();
    const user = email ? await User.findOne({ email }) : null;
    let resetUrl;

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
      await user.save();
      resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

      if (emailConfigured) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM,
              to: [user.email],
              subject: 'Reset your EventHub password',
              text: `Use this link within one hour to reset your password: ${resetUrl}`,
            }),
          });
          if (!response.ok) console.error(`Password reset email failed: HTTP ${response.status}`);
        } catch (mailError) {
          console.error(`Password reset email failed: ${mailError.message}`);
        }
      }
    }

    const result = { message: 'If an account exists for that email, password reset instructions are ready.' };
    if (!emailConfigured && process.env.NODE_ENV !== 'production' && resetUrl) {
      result.resetUrl = resetUrl;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Unable to process password reset request' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or expired' });

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Unable to reset password' });
  }
});

module.exports = router;
