const mongoose = require('mongoose');
const AppointmentDoctor = require('./models/AppointmentDoctor');

mongoose.connect('mongodb://localhost:27017/hospital-shift-system')
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Update all doctors to work from 08:00 to 23:00
            const result = await AppointmentDoctor.updateMany({}, {
                $set: {
                    "workingHours.start": "08:00",
                    "workingHours.end": "23:00"
                }
            });

            console.log(`Updated ${result.modifiedCount} doctors to On Duty (08:00 - 23:00)`);
        } catch (err) {
            console.error('Error updating doctors:', err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => console.error('Connection error:', err));
