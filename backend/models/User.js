// models/User.js
// Mongoose schema for the "users" collection

const mongoose = require('mongoose');

// Define the blueprint for User documents
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  // Automatically adds createdAt and updatedAt fields
  timestamps: true
});

// Create and export the User model (MongoDB will store this in "users" collection)
const User = mongoose.model('User', userSchema);

module.exports = User;
