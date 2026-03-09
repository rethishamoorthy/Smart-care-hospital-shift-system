const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function runTest() {
    try {
        console.log('--- STARTING VERIFICATION ---');

        // 1. Create Patient
        const patientEmail = `test${Date.now()}@example.com`;
        console.log(`\n1. Creating Patient with email: ${patientEmail}...`);
        const patientRes = await axios.post(`${BASE_URL}/staff-module/patient`, {
            name: 'Test Patient',
            age: 30,
            gender: 'Male',
            phone: '1234567890',
            email: patientEmail,
            ward: '1st Floor - Emergency',
            bedNumber: 'A1',
            guardianName: 'Guardian',
            guardianPhone: '0987654321'
        });

        if (!patientRes.data.success) throw new Error('Patient creation failed');
        const patientId = patientRes.data.patient._id; // Use _id from response
        const patientMongoId = patientRes.data.patient._id;
        console.log('✅ Patient Created:', patientId);

        // 2. Create Purchase Request
        console.log('\n2. Sending Purchase Request...');
        const requestRes = await axios.post(`${BASE_URL}/medical-team/request`, {
            patientId: patientMongoId,
            patientName: 'Test Patient',
            ward: '1st Floor - Emergency',
            bedNumber: 'A1',
            phone: '1234567890',
            patientEmail: patientEmail,
            medicines: [
                {
                    medicineId: "MED-001",
                    medicineName: "Paracetamol",
                    quantity: 2,
                    price: 5,
                    total: 10
                }
            ],
            totalAmount: 10
        });

        if (!requestRes.data.success) throw new Error('Purchase Request failed');
        const requestId = requestRes.data.request._id;
        console.log('✅ Purchase Request Sent:', requestId);

        // 3. Collect Request (Generate Bill)
        console.log('\n3. Collecting Medicines (Generating Bill)...');
        const collectRes = await axios.post(`${BASE_URL}/medical-team/collect/${requestId}`);
        if (!collectRes.data.success) throw new Error('Collection/Billing failed');
        console.log('✅ Medicines Collected & Bill Generated');

        // 4. Verify Bill Exists
        console.log('\n4. Fetching Bills for Patient...');
        const billsRes = await axios.get(`${BASE_URL}/billing/patient/${patientEmail}`);
        if (!billsRes.data.success || billsRes.data.bills.length === 0) throw new Error('Bills not found');
        const bill = billsRes.data.bills[0];
        console.log('✅ Bill Found:', bill._id, 'Status:', bill.status);

        // 5. Pay Bill
        console.log('\n5. Paying Bill...');
        const payRes = await axios.post(`${BASE_URL}/billing/pay/${bill._id}`);
        if (!payRes.data.success) throw new Error('Payment failed');
        console.log('✅ Payment Successful');

        // 6. Verify Bill Status Paid
        const verifyBillRes = await axios.get(`${BASE_URL}/billing/patient/${patientEmail}`);
        const updatedBill = verifyBillRes.data.bills[0];
        if (updatedBill.status !== 'paid') throw new Error('Bill status update failed');
        console.log('✅ Bill Status Verified: PAID');

        console.log('\n--- VERIFICATION COMPLETE: ALL CHECKS PASSED ---');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

runTest();
