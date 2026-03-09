const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Simple password check (for MVP - in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user data (excluding password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      specialization: user.specialization,
      isAvailable: user.isAvailable,
      isEmergencyAvailable: user.isEmergencyAvailable,
      contactNumber: user.contactNumber
    };

    res.json({ user: userData, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register route (Patient, Doctor, and Nurse)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, department, specialization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Allow patient, doctor, and nurse registration
    // In production, you might want to restrict doctor/nurse registration to admins only
    const validRoles = ['patient', 'doctor', 'nurse'];
    const assignedRole = validRoles.includes(role) ? role : 'patient';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password, // In prod use hashing
      role: assignedRole,
      department: department || (assignedRole === 'patient' ? 'Patient' : ''),
      specialization: specialization || '',
      contactNumber: phone || '',
      isAvailable: assignedRole === 'patient' ? true : true,
      isEmergencyAvailable: assignedRole === 'patient' ? false : true
    });

    await newUser.save();

    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      specialization: newUser.specialization,
      contactNumber: newUser.contactNumber,
      isAvailable: newUser.isAvailable,
      isEmergencyAvailable: newUser.isEmergencyAvailable
    };

    res.status(201).json({ user: userData, message: 'Registration successful' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

module.exports = router;
