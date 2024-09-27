const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Event } = require('./models/models');

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb+srv://pratej2490:prasanna24@prasanna.kj0uhxh.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB database'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Create event route
app.post('/events', async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;
    console.log('Received event data:', req.body); // Debugging line
    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      capacity,
      ticketsSold: 0
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
    console.log('Received register data:', req.body); // Debugging line

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
