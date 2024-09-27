require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { User, Event } = require('../models/models'); // Adjust path if needed

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public directory

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongoURI); // Log the URI

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Bearer scheme
  if (!token) return res.status(403).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// Logging middleware for incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for '${req.url}'`);
  next();
});

// Create event route
app.post('/events', verifyToken, async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;
    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      capacity,
      ticketsSold: 0,
      createdBy: req.userId,
    });
    await event.save();
    res.status(201).json({ message: 'Event created successfully!' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error });
  }
});

// Register route
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check for required fields
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('Received email:', email);
    console.log('Received password:', password);
    console.log('Received name:', name);

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Get events route
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Root endpoint (optional)
app.get('/', (req, res) => {
  res.send('Welcome to the Event Management API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
