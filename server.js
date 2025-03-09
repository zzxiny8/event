const express = require('express');
const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
const { User, Event } = require('./models');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_EMAIL = 'xinyue.zhao@udtrucks.com';

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));  // Serve static files from the "public" directory
app.use("/views", express.static(path.join(__dirname, "public/views"))); // 让 Express 提供 views 目录

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
  // In a real app, you'd handle password verification and sessions/JWT here.
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
    // Basic admin authentication check
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

// Submit user info for an event (user registration)
app.post('/api/submit', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      eventId,
      vegetarian,  // <-- 新增字段
      dinner,      // <-- 新增字段
      allergies,   // <-- 新增字段
      avoidMeat    // <-- 新增字段
    } = req.body;

    // 校验必填字段
    if (!name || !email || !eventId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!email.endsWith('@udtrucks.com')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 验证 eventId
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // 创建新User并保存
    const newUser = new User({
      name,
      email,
      phone,
      event: event._id,
      vegetarian: !!vegetarian, // 转成bool
      dinner: !!dinner,
      allergies: allergies || "",
      avoidMeat: avoidMeat || ""
    });

    await newUser.save();
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
    await User.deleteMany({ event: eventId });  // remove associated user submissions for this event
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
