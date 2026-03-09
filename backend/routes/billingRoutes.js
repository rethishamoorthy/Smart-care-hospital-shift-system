const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Get bills for a patient by email
router.get('/patient/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const bills = await Bill.find({ email }).sort({ createdAt: -1 });
        res.json({ success: true, bills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Pay a bill
router.post('/pay/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bill = await Bill.findById(id);

        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }

        bill.status = 'paid';
        await bill.save();

        res.json({ success: true, message: 'Bill paid successfully', bill });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
