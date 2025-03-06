// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { ServerApiVersion } = require('mongodb');  // 引入 ServerApiVersion

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 连接 MongoDB（使用 MongoDB 建议的连接选项）1
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
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// 2. 引入模型（确保在根目录有 models.js 文件）
const { Event, User } = require('./models');

// 3. 中间件解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. 设置静态文件夹
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// ========== 新增：让根路径 / 跳转到 /login.html ==========
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// (A) GET /login => 返回 login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// (B) 登录处理 (POST /login)
app.post('/login', (req, res) => {
  const { email } = req.body;

  // 只允许 @udtrucks.com 邮箱登录
  if (!email.endsWith('@udtrucks.com')) {
    return res.status(400).send('Invalid email!');
  }

  // 判断是否为管理员
  if (email === 'xinyue.zhao@udtrucks.com') {
    // 管理员跳转到 admin.html
    return res.redirect('/admin.html');
  } else {
    // 普通用户跳转到 user.html
    return res.redirect('/user.html');
  }
});

// (C) 管理员上传活动 (POST /api/admin/event)
app.post('/api/admin/event', async (req, res) => {
  try {
    const { title, date, time, location, description } = req.body;
    const dateTime = new Date(`${date}T${time}`);
    const newEvent = new Event({ title, date: dateTime, location, description });
    await newEvent.save();
    res.status(200).send('Save successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to save!');
  }
});

// (D) 获取所有活动 (GET /api/events)
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to obtain event information!');
  }
});

// (E) 用户提交个人信息 (POST /api/user/submit)
app.post('/api/user/submit', async (req, res) => {
  try {
    const { email, name, isVegetarian, hasDinner, allergies } = req.body;
    const newUserInfo = new User({ email, name, isVegetarian, hasDinner, allergies });
    await newUserInfo.save();
    res.status(200).send('User information has been submitted!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to submit!');
  }
});

// (F) 管理员查看用户信息 (GET /api/admin/users)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to obtain user information!');
  }
});

// 5. 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
