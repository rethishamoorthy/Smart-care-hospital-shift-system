const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Patient = require('../models/Patient');
const Shift = require('../models/Shift');
const ShiftRequest = require('../models/ShiftRequest');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-shift-system')
.then(() => console.log('MongoDB Connected for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Shift.deleteMany({});
    await ShiftRequest.deleteMany({});

    console.log('Cleared existing data');

    // Create Users (Doctors and Nurses)
    const users = await User.insertMany([
      // Admin
      {
        name: 'Admin Manager',
        email: 'admin@meditrack.com',
        password: 'admin123',
        role: 'admin',
        department: 'Administration',
        specialization: 'Hospital Management',
        isAvailable: true,
        isEmergencyAvailable: true,
        contactNumber: '555-0001'
      },
      // Doctors
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@meditrack.com',
        password: 'doctor123',
        role: 'doctor',
        department: 'Cardiology',
        specialization: 'Cardiac Surgery',
        isAvailable: true,
        isEmergencyAvailable: true,
        contactNumber: '555-0101'
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@meditrack.com',
        password: 'doctor123',
        role: 'doctor',
        department: 'Emergency',
        specialization: 'Emergency Medicine',
        isAvailable: true,
        isEmergencyAvailable: true,
        contactNumber: '555-0102'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@meditrack.com',
        password: 'doctor123',
        role: 'doctor',
        department: 'Pediatrics',
        specialization: 'Pediatric Care',
        isAvailable: false,
        isEmergencyAvailable: false,
        contactNumber: '555-0103'
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@meditrack.com',
        password: 'doctor123',
        role: 'doctor',
        department: 'ICU',
        specialization: 'Intensive Care',
        isAvailable: true,
        isEmergencyAvailable: false,
        contactNumber: '555-0104'
      },
      {
        name: 'Dr. Lisa Anderson',
        email: 'lisa.anderson@meditrack.com',
        password: 'doctor123',
        role: 'doctor',
        department: 'Cardiology',
        specialization: 'Cardiology',
        isAvailable: true,
        isEmergencyAvailable: true,
        contactNumber: '555-0105'
      },
      // Nurses
      {
        name: 'Nurse Patricia Brown',
        email: 'patricia.brown@meditrack.com',
        password: 'nurse123',
        role: 'nurse',
        department: 'ICU',
        specialization: '',
        isAvailable: true,
        isEmergencyAvailable: true,
        contactNumber: '555-0201'
      },
      {
        name: 'Nurse Robert Taylor',
        email: 'robert.taylor@meditrack.com',
        password: 'nurse123',
        role: 'nurse',
        department: 'Emergency',
        specialization: '',
        isAvailable: true,
        isEmergencyAvailable: true,
        contactNumber: '555-0202'
      },
      {
        name: 'Nurse Jennifer Martinez',
        email: 'jennifer.martinez@meditrack.com',
        password: 'nurse123',
        role: 'nurse',
        department: 'Cardiology',
        specialization: '',
        isAvailable: false,
        isEmergencyAvailable: false,
        contactNumber: '555-0203'
      },
      {
        name: 'Nurse David Lee',
        email: 'david.lee@meditrack.com',
        password: 'nurse123',
        role: 'nurse',
        department: 'ICU',
        specialization: '',
        isAvailable: true,
        isEmergencyAvailable: false,
        contactNumber: '555-0204'
      },
      {
        name: 'Nurse Maria Garcia',
        email: 'maria.garcia@meditrack.com',
        password: 'nurse123',
        role: 'nurse',
        department: 'Pediatrics',
        specialization: '',
        isAvailable: true,
        isEmergencyAvailable: true,
        contactNumber: '555-0205'
      },
      {
        name: 'Nurse Thomas White',
        email: 'thomas.white@meditrack.com',
        password: 'nurse123',
        role: 'nurse',
        department: 'Emergency',
        specialization: '',
        isAvailable: true,
        isEmergencyAvailable: true,
        contactNumber: '555-0206'
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create Patients
    const patients = await Patient.insertMany([
      {
        name: 'John Smith',
        patientId: 'P001',
        department: 'ICU',
        needsConstantCare: true,
        assignedStaff: [users[0]._id, users[5]._id] // Dr. Sarah Johnson, Nurse Patricia Brown
      },
      {
        name: 'Mary Johnson',
        patientId: 'P002',
        department: 'Cardiology',
        needsConstantCare: true,
        assignedStaff: [users[4]._id] // Dr. Lisa Anderson
      },
      {
        name: 'Robert Williams',
        patientId: 'P003',
        department: 'Emergency',
        needsConstantCare: false,
        assignedStaff: []
      },
      {
        name: 'Jennifer Davis',
        patientId: 'P004',
        department: 'ICU',
        needsConstantCare: true,
        assignedStaff: [users[3]._id, users[8]._id] // Dr. James Wilson, Nurse David Lee
      },
      {
        name: 'William Miller',
        patientId: 'P005',
        department: 'Pediatrics',
        needsConstantCare: false,
        assignedStaff: []
      },
      {
        name: 'Linda Wilson',
        patientId: 'P006',
        department: 'Emergency',
        needsConstantCare: true,
        assignedStaff: [users[1]._id, users[6]._id] // Dr. Michael Chen, Nurse Robert Taylor
      }
    ]);

    console.log(`Created ${patients.length} patients`);

    // Create Shifts
    const today = new Date();
    const shifts = await Shift.insertMany([
      {
        date: today,
        startTime: '08:00',
        endTime: '16:00',
        department: 'ICU',
        assignedUsers: [users[3]._id, users[5]._id, users[8]._id]
      },
      {
        date: today,
        startTime: '16:00',
        endTime: '00:00',
        department: 'Emergency',
        assignedUsers: [users[1]._id, users[6]._id, users[10]._id]
      },
      {
        date: today,
        startTime: '00:00',
        endTime: '08:00',
        department: 'Cardiology',
        assignedUsers: [users[0]._id, users[4]._id]
      }
    ]);

    console.log(`Created ${shifts.length} shifts`);

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

