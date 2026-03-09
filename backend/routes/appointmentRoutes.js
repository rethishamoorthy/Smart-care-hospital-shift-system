const express = require('express');
const router = express.Router();
const AppointmentDoctor = require('../models/AppointmentDoctor');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// GET /api/appointments/doctors - Get all doctors for booking
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await AppointmentDoctor.find({});
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
});

// GET /api/appointments/slots/:doctorId/:date - Get booked slots for a doctor on a specific date
router.get('/slots/:doctorId/:date', async (req, res) => {
    try {
        const { doctorId, date } = req.params;

        // Find all appointments for this doctor on this date
        // We only need the slotTime to mark them as booked in UI
        const appointments = await Appointment.find({ doctorId, date }, 'slotTime status');

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ message: 'Server error fetching slots' });
    }
});

// GET /api/appointments/patient/:patientId - Get all appointments for a patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const appointments = await Appointment.find({ patientId }).sort({ date: 1, slotTime: 1 });

        // Enrich with doctor details? Ideally yes, but for now we can fetch doctor details separately or store doctor name in appointment.
        // Given "Simple" requirement, let's fetch Doctor details here or just store doctorName in appointment model?
        // I didn't store doctorName in appointment model. I have doctorId.
        // I will let frontend fetch doctor details or just join here.
        // Mongoose populate is best if I used ObjectId ref, but I used String ID.
        // So I have to manual lookup.

        const AppointmentDoctor = require('../models/AppointmentDoctor');
        const doctors = await AppointmentDoctor.find({});
        const doctorMap = {};
        doctors.forEach(d => doctorMap[d.id] = d);

        const enriched = appointments.map(app => ({
            ...app.toObject(),
            doctor: doctorMap[app.doctorId] || { name: 'Unknown Doctor' }
        }));

        res.json(enriched);

    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        res.status(500).json({ message: 'Server error fetching patient appointments' });
    }
});

// POST /api/appointments/book - Book an appointment
router.post('/book', async (req, res) => {
    try {
        const { doctorId, patientId, date, slotTime, patientDetails } = req.body;

        // Validate inputs
        if (!doctorId || !patientId || !date || !slotTime || !patientDetails) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check for existing booking (Double booking prevention)
        // Although MongoDB unique index handles this, a manual check gives a better error message
        const existing = await Appointment.findOne({ doctorId, date, slotTime });
        if (existing) {
            return res.status(409).json({ message: 'Slot already booked' });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            doctorId,
            patientId,
            date,
            slotTime,
            patientDetails,
            status: 'booked'
        });

        await newAppointment.save();

        res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });

    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error from MongoDB index
            return res.status(409).json({ message: 'Slot already booked (concurrency)' });
        }
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Server error booking appointment' });
    }
});

// DELETE /api/appointments/cancel/:id - Cancel (delete) an appointment by Mongo _id or custom string id
router.delete('/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params;

        let deleted = null;

        // Try to delete by MongoDB ObjectId first (if valid)
        if (mongoose.Types.ObjectId.isValid(id)) {
            deleted = await Appointment.findByIdAndDelete(id);
        }

        // If not found by _id or id wasn't an ObjectId, try deleting by the appointment's custom `id` field
        if (!deleted) {
            deleted = await Appointment.findOneAndDelete({ id: id });
        }

        if (!deleted) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        return res.json({ message: 'Appointment cancelled', appointment: deleted });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Server error cancelling appointment' });
    }
});

module.exports = router;
