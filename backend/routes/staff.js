const express = require('express');
const router = express.Router();
const User = require('../models/User');
// models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['Nurse', 'Doctor'], required: true }
});

module.exports = mongoose.model('Staff', staffSchema);

// Get all available doctors and nurses
router.get('/available', async (req, res) => {
  try {
    const availableStaff = await User.find({ 
      isAvailable: true,
      role: { $in: ['doctor', 'nurse'] }
    }).select('name role department specialization isAvailable isEmergencyAvailable contactNumber');
    
    // Separate doctors and nurses
    const doctors = availableStaff.filter(staff => staff.role === 'doctor');
    const nurses = availableStaff.filter(staff => staff.role === 'nurse');
    
    res.json({
      doctors,
      nurses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all staff (optional - for future use)
router.get('/', async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['doctor', 'nurse'] } });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


