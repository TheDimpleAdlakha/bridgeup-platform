const express = require('express');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message) return res.status(400).json({ msg: 'Missing fields' });

    const newMsg = new Message({
      senderId: req.user.id,
      senderName: req.user.name,
      receiverId,
      message
    });
    const savedMsg = await newMsg.save();
    res.json(savedMsg);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get all messages for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
