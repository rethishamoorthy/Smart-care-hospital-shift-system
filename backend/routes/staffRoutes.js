const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const MedicineRecord = require('../models/MedicineRecord');

// --- LOGIN & AUTH (Simple Role & Floor Auth) ---

router.post('/login', (req, res) => {
    const { role, id, password } = req.body;
    // Simple verification as per "No JWT complexity" rule
    if (role === 'Nurse' || role === 'Doctor') {
        // In a real app we'd check DB. keeping it simple.
        res.json({ success: true, role, id });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

router.post('/verify-ward-password', (req, res) => {
    const { ward, password } = req.body;
    // Hardcoded for demo explicitly
    const wardPasswords = {
        "1st Floor - Emergency": "pass1",
        "1st Floor - Reception": "pass1",
        "1st Floor - Rooms": "pass1",
        "2nd Floor - General Ward": "pass2",
        "2nd Floor - ICU": "pass2",
        "3rd Floor - Surgery": "pass3",
        "4th Floor - Rooms": "pass4",
        "5th Floor - Rooms": "pass5"
    };

    if (wardPasswords[ward] === password) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Password' });
    }
});

// --- PATIENT MANAGEMENT ---

router.post('/patient', async (req, res) => {
    try {
        const { name, age, gender, phone, email, guardianName, guardianPhone, bloodGroup, address, ward, bedNumber, admissionDate } = req.body;

        // Check if email already exists
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return res.status(400).json({ success: false, message: 'Email already exists for another patient.' });
        }

        const newPatient = new Patient({
            name,
            patientId: `P-${Date.now()}`,
            department: ward,
            ward,
            age,
            gender,
            phoneNumber: phone,
            contactNumber: phone,
            phone,
            email, // New email field
            guardianName,
            parentName: guardianName,
            guardianPhone,
            guardianPhoneNumber: guardianPhone,
            bloodGroup,
            address,
            bedNumber,
            admissionDate: admissionDate || Date.now()
        });

        await newPatient.save();
        res.status(201).json({ success: true, patient: newPatient });
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/patients/:ward', async (req, res) => {
    try {
        const { ward } = req.params;
        const decodedWard = decodeURIComponent(ward);
        const patients = await Patient.find({ ward: decodedWard });
        res.json({ success: true, patients });
    } catch (error) {
        console.error('Error fetching ward patients:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/patient/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
        res.json({ success: true, patient });
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- MEDICINE RECORDS ---

router.post('/medicine', async (req, res) => {
    try {
        const { patientId, medicineName, dosage, type, time, foodCondition, price, nurseId } = req.body;

        const newMedicine = new MedicineRecord({
            patientId,
            medicineName,
            dosage,
            type,
            time,
            foodCondition,
            price,
            nurseId,
            status: 'Pending',
            purchaseStatus: 'None'
        });

        await newMedicine.save();
        res.status(201).json({ success: true, medicine: newMedicine });
    } catch (error) {
        console.error('Error adding medicine:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/medicine/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const medicines = await MedicineRecord.find({ patientId }).sort({ timestamp: -1 });
        res.json({ success: true, medicines });
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/medicine/:id', async (req, res) => {
    try {
        const { status, purchaseStatus, nurseId } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (purchaseStatus) updateData.purchaseStatus = purchaseStatus;
        if (nurseId) updateData.nurseId = nurseId;

        // If status becomes given, we might wanna set a timestamp if not already set? 
        // Schema default timestamp is creation time. 
        // We'll trust the frontend for now or just update the fields.

        const updatedMedicine = await MedicineRecord.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json({ success: true, medicine: updatedMedicine });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/medicine/:id', async (req, res) => {
    try {
        const medicine = await MedicineRecord.findById(req.params.id);
        if (medicine && medicine.status === 'Given') {
            return res.status(400).json({ success: false, message: 'Cannot delete given medicine' });
        }
        await MedicineRecord.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Medicine deleted' });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
