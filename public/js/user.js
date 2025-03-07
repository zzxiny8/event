const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ServerApiVersion } = require('mongodb');
const { User, Event } = require('./models');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = 'xinyue.zhao@udtrucks.com';

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for frontend access
app.use(express.static('public'));
app.use('/views', express.static(path.join(__dirname, 'public/views')));

// Serve login page at root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/login.html'));
});

// User login API
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!email.endsWith('@udtrucks.com')) {
    return res.status(401).json({ error: 'Unauthorized: Email must be from udtrucks.com domain' });
  }
  let role = 'user';
  if (email.toLowerCase() === ADMIN_EMAIL) {
    role = 'admin';
  }
  return res.json({ message: 'Login successful', email: email, role: role });
});

// Get all events (basic info only)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({}, 'title date createdAt'); // Only return necessary fields
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal error fetching events' });
  }
});

// Get a single event's details
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin creates an event
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, adminEmail } = req.body;
    if (!adminEmail || adminEmail.toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const event = new Event({
      title: title,
      description: description,
      date: date ? new Date(date) : undefined
    });
    await event.save();
    return res.status(201).json({ message: 'Event created successfully', event: event });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User submits event registration
app.post('/api/submit', async (req, res) => {
  try {
    const { name, email, phone, eventId } = req.body;
    if (!name || !email || !eventId) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }
    if (!email.endsWith('@udtrucks.com')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(400).json({ error: 'Event does not exist' });
    }
    const newUser = new User({ name, email, phone, event: event._id });
    await newUser.save();
    return res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error submitting user info:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all user submissions (admin only)
app.get('/api/submissions', async (req, res) => {
  try {
    const adminEmail = req.query.adminEmail;
    if (!adminEmail || adminEmail.toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const submissions = await User.find().populate('event');
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an event (admin only)
app.delete('/api/events/:id', async (req, res) => {
  try {
    const adminEmail = req.query.adminEmail;
    if (!adminEmail || adminEmail.toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const eventId = req.params.id;
    await Event.findByIdAndDelete(eventId);
    await User.deleteMany({ event: eventId });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connect to MongoDB and start the server
mongoose.connect(
  'mongodb+srv://zhaoxinyue:1062899138Zxy%40@cluster0.0ri2z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }
)
  .then(() => {
    console.log('MongoDB connected successfully!');
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
