const mongoose = require('mongoose');

const medicineRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  power: { type: String }, // e.g., 500mg
  type: { type: String }, // Tablet, Injection, etc.
  time: { type: String, required: true }, // Morning, Afternoon, Evening, Night
  foodCondition: { type: String, required: true }, // Before Food, After Food
  exactTime: { type: String }, // e.g., 08:30 AM
  status: { type: String, enum: ['Pending', 'Given'], default: 'Pending' },
  givenBy: { type: String }, // Staff ID who gave it
  timestamp: { type: Date, default: Date.now }, // When it was created
  price: { type: Number },
  purchaseStatus: { type: String, enum: ['None', 'Requested'], default: 'None' },
  nurseId: { type: String }
});

module.exports = mongoose.model('MedicineRecord', medicineRecordSchema);
