const mongoose = require('mongoose');

// Define the schema for user submissions
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  createdAt: { type: Date, default: Date.now },
  vegetarian: { type: Boolean, default: false },
  dinner: { type: Boolean, default: false },
  allergies: { type: String, default: "" },
  avoidMeat: { type: String, default: "" }
});

// Define the schema for events
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  datetime: { type: Date, required: true },  // 用单个字段存储日期时间
  createdAt: { type: Date, default: Date.now }
  
}, { timestamps: true });

// Create Mongoose models
const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

module.exports = { User, Event };
