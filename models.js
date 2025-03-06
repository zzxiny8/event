// models.js
const mongoose = require('mongoose');

// 活动信息的 Schema
const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  location: String,
  description: String,
});

// 用户提交信息的 Schema
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  isVegetarian: Boolean,
  hasDinner: Boolean,
  allergies: String,
});

// 创建模型
const Event = mongoose.model('Event', eventSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Event, User };
