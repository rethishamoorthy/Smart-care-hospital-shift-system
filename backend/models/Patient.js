const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  patientId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  needsConstantCare: {
    type: Boolean,
    default: false
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Staff Module Fields
  age: { type: Number },
  gender: { type: String },
  phoneNumber: { type: String },
  parentName: { type: String },
  guardianPhoneNumber: { type: String },
  bloodGroup: { type: String },
  address: { type: String },
  ward: { type: String }, // e.g., "1st Floor - Emergency"
  bedNumber: { type: String },
  guardianName: { type: String },
  guardianPhone: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);


