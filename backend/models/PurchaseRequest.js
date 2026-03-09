const mongoose = require('mongoose');

const purchaseRequestSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    ward: { type: String, required: true },
    bedNumber: { type: String, required: true },
    phone: { type: String, required: true },
    patientEmail: { type: String, required: true }, // New field
    medicines: [{
        medicineId: { type: String, required: true }, // Re-added
        medicineName: { type: String, required: true },
        dosage: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Requested', 'Ready', 'Collected'], default: 'Requested' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);
