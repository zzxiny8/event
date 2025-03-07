const express = require('express');
const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
const { User, Event } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = 'xinyue.zhao@udtrucks.com';

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));  // Serve static files from the "public" directory

const path = require('path');
// Serve the login page at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/views/login.html'));
});

// User login API – checks email domain and assigns role
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!email.endsWith('@udtrucks.com')) {
    return res.status(401).json({ error: 'Unauthorized: Email must be a udtrucks.com address' });
  }
  let role = 'user';
  if (email.toLowerCase() === ADMIN_EMAIL) {
    role = 'admin';
  }
  return res.json({ message: 'Login successful', email: email, role: role });
});

// Get all events (available to any logged-in user or admin)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });  // latest created events first
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal error fetching events' });
  }
});

// Create a new event (admin only)
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
    return res.status(201).json({ message: 'Event created', event: event });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Internal error creating event' });
  }
});

// Submit user info for an event (user registration) [UPDATED]
app.post('/api/submit', async (req, res) => {
  try {
    const { name, email, phone, eventId } = req.body;

    console.log("Received submission:", req.body); // Log received data

    if (!name || !email || !eventId) {
      console.warn("Submission failed: Missing required fields.");
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!email.endsWith('@udtrucks.com')) {
      console.warn("Unauthorized email attempted submission:", email);
      return res.status(401).json({ error: 'Unauthorized email' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      console.warn("Invalid event ID provided:", eventId);
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const newUser = new User({
      name: name,
      email: email,
      phone: phone,
      event: event._id
    });

    await newUser.save();
    console.log("Submission saved successfully!");

    return res.status(201).json({ message: 'Submission successful' });
  } catch (err) {
    console.error('Error submitting user info:', err);
    res.status(500).json({ error: 'Internal error submitting info' });
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
    res.status(500).json({ error: 'Internal error fetching submissions' });
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
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Internal error deleting event' });
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
    console.log('MongoDB connected!');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
