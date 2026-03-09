const mongoose = require('mongoose');

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
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'doctor', 'nurse', 'patient'],
    default: 'patient'
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    trim: true,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isEmergencyAvailable: {
    type: Boolean,
    default: false
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

