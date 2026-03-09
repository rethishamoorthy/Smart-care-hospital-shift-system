const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients who need constant care
router.get('/constant-care', async (req, res) => {
  try {
    const patients = await Patient.find({ needsConstantCare: true })
      .populate('assignedStaff', 'name role department contactNumber');

    res.json(patients);
  } catch (error) {
    console.error('Error fetching constant care patients:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all patients (optional - for future use)
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('assignedStaff', 'name role department contactNumber');

    res.json(patients);
  } catch (error) {
    console.error('Error fetching all patients:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


