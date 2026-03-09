const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String, required: true },
    email: { type: String, required: true },
    medicines: [
        {
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
