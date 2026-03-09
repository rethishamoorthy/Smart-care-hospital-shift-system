const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-shift-system')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/shifts', require('./routes/shifts'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/staff-module', require('./routes/staffRoutes'));
app.use('/api/medical-team', require('./routes/medicalTeamRoutes'));
app.use('/api/billing', require('./routes/billingRoutes')); // New Billing Route

// Seed Appointment Doctors if empty
const AppointmentDoctor = require('./models/AppointmentDoctor');
const seedDoctors = async () => {
  try {
    const count = await AppointmentDoctor.countDocuments();
    if (count === 0) {
      console.log('Seeding Appointment Doctors...');
      const doctors = [
        {
          id: 'doc1',
          name: 'Dr. Arun',
          specialization: 'Cardiology',
          department: 'Cardiology', // Keeping for backward compat if needed
          workingHours: { start: '09:00', end: '17:00' },
          lunchBreak: { start: '13:00', end: '14:00' }
        },
        {
          id: 'doc2',
          name: 'Dr. Meera',
          specialization: 'Neurology',
          department: 'Neurology',
          workingHours: { start: '09:00', end: '17:00' },
          lunchBreak: { start: '13:00', end: '14:00' }
        },
        {
          id: 'doc3',
          name: 'Dr. Ravi',
          specialization: 'Orthopedics',
          department: 'Orthopedics',
          workingHours: { start: '09:00', end: '17:00' },
          lunchBreak: { start: '13:00', end: '14:00' }
        },
        {
          id: 'doc4',
          name: 'Dr. Priya',
          specialization: 'Dermatology',
          department: 'Dermatology',
          workingHours: { start: '09:00', end: '17:00' },
          lunchBreak: { start: '13:00', end: '14:00' }
        },
        {
          id: 'doc5',
          name: 'Dr. Karthik',
          specialization: 'Pediatrics',
          department: 'Pediatrics',
          workingHours: { start: '09:00', end: '17:00' },
          lunchBreak: { start: '13:00', end: '14:00' }
        },
        {
          id: 'doc6',
          name: 'Dr. Anjali',
          specialization: 'ENT',
          department: 'ENT',
          workingHours: { start: '09:00', end: '17:00' },
          lunchBreak: { start: '13:00', end: '14:00' }
        }
      ];
      await AppointmentDoctor.insertMany(doctors);
      console.log('Appointment Doctors seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding doctors:', err);
  }
};
seedDoctors();

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

