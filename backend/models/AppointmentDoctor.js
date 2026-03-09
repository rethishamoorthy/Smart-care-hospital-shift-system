const mongoose = require('mongoose');

const appointmentDoctorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  workingHours: {
    start: { type: String, required: true }, // e.g., "09:00"
    end: { type: String, required: true }   // e.g., "17:00"
  },
  lunchBreak: {
    start: { type: String, required: true }, // e.g., "13:00"
    end: { type: String, required: true }   // e.g., "14:00"
  },
  visitingHours: {
    start: { type: String, default: "16:00" },
    end: { type: String, default: "20:00" }
  }
}, { timestamps: true });

module.exports = mongoose.model('AppointmentDoctor', appointmentDoctorSchema);
