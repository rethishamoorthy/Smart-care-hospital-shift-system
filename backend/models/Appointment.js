const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    id: {
        type: String, // String ID for booking reference if needed, or just rely on MongoDB _id but use strings for queries
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString() // Auto-generate string ID if not provided
    },
    doctorId: {
        type: String,
        required: true
    },
    patientId: {
        type: String, // Could be auth user ID or just generated for guest
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    slotTime: {
        type: String, // HH:mm
        required: true
    },
    patientDetails: {
        name: String,
        age: Number,
        gender: String,
        phone: String,
        reason: String
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled', 'completed'],
        default: 'booked'
    }
}, { timestamps: true });

// Prevent double booking: Unique compound index on doctorId + date + slotTime
appointmentSchema.index({ doctorId: 1, date: 1, slotTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
