// models/Task.js
// Mongoose schema for the "tasks" collection

const mongoose = require('mongoose');

// Define the blueprint for Task documents
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Study'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  deadline: {
    type: String, // Accepts dates like '2026-10-15'
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'inprogress', 'inreview', 'done'],
    default: 'todo'
  },
  userId: {
    type: mongoose.Schema.Types.Mixed, // Can store MongoDB ObjectId or User ID
    ref: 'User',
    required: true
  }
}, {
  // Automatically records createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the Task model (MongoDB stores this in "tasks" collection)
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

