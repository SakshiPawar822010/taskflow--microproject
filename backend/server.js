// server.js - TaskFlow Express & MongoDB Backend
// Beginner-friendly, clean and modular REST API for Web Technology Microproject

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Mongoose Models
const User = require('./models/User');
const Task = require('./models/Task');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';

// ==========================================
// Middlewares
// ==========================================
// 1. Enable CORS so the HTML/JS frontend can communicate with this backend
app.use(cors());

// 2. Parse incoming JSON request bodies
app.use(express.json());

// ==========================================
// Database Connection
// ==========================================
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB database: taskflow');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// ==========================================
// Test / Health Route
// ==========================================
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TaskFlow Backend API! Server is running smoothly.',
    endpoints: [
      'POST /api/register',
      'POST /api/login',
      'POST /api/tasks',
      'GET /api/tasks (filter by ?userId=...)',
      'PUT /api/tasks/:id (edit task or update status)',
      'DELETE /api/tasks/:id'
    ]
  });
});

// ==========================================
// 1. USER REGISTRATION API
// Method: POST | Endpoint: /api/register
// ==========================================
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation: check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with the same email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists. Please log in.'
      });
    }

    // Create and save new user in MongoDB
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password // Plain password kept simple for project/viva demonstration
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message
    });
  }
});

// ==========================================
// 2. USER LOGIN API
// Method: POST | Endpoint: /api/login
// ==========================================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: check if email & password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email in MongoDB
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    // Compare passwords
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again.'
      });
    }

    // Successful login response
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message
    });
  }
});

// ==========================================
// 3. ADD TASK API
// Method: POST | Endpoint: /api/tasks
// ==========================================
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, category, priority, deadline, dueDate, status, userId } = req.body;

    const taskDeadline = deadline || dueDate;

    // Validation: Title, deadline and userId are required
    if (!title || !taskDeadline || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, deadline, and userId.'
      });
    }

    // Create and save new task in MongoDB
    const newTask = new Task({
      title,
      description: description || '',
      category: category || 'Study',
      priority: priority || 'medium',
      deadline: taskDeadline,
      status: status || 'todo',
      userId
    });

    const savedTask = await newTask.save();

    res.status(201).json({
      success: true,
      message: 'Task added successfully!',
      task: savedTask
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding task.',
      error: error.message
    });
  }
});

// ==========================================
// 4. GET TASKS API (Fetch user's tasks)
// Method: GET | Endpoint: /api/tasks?userId=...
// ==========================================
app.get('/api/tasks', async (req, res) => {
  try {
    const { userId } = req.query;

    // Filter by userId if supplied, so each user only sees their own tasks
    const query = userId ? { userId } : {};
    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks.',
      error: error.message
    });
  }
});

// Fetch tasks by specific route param: /api/tasks/user/:userId
app.get('/api/tasks/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user tasks.',
      error: error.message
    });
  }
});

// ==========================================
// 5. UPDATE / EDIT TASK API (Edit task or Mark complete)
// Method: PUT | Endpoint: /api/tasks/:id
// ==========================================
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Support both deadline and dueDate naming
    if (updateData.dueDate && !updateData.deadline) {
      updateData.deadline = updateData.dueDate;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or already deleted.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully!',
      task: updatedTask
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating task.',
      error: error.message
    });
  }
});

// ==========================================
// 6. DELETE TASK API
// Method: DELETE | Endpoint: /api/tasks/:id
// ==========================================
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the task by MongoDB _id
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or already deleted.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully!',
      deletedTask
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task.',
      error: error.message
    });
  }
});

// ==========================================
// Start Server
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 TaskFlow Backend Server running on: http://localhost:${PORT}`);
});

