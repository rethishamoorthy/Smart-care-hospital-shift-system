const mongoose = require('mongoose');
const AppointmentDoctor = require('./models/AppointmentDoctor');

mongoose.connect('mongodb://localhost:27017/hospital-shift-system')
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Update all doctors to have visiting hours from 16:00 to 20:00
            // This overlaps with working hours (08:00 - 23:00) which is correct, 
            // as visiting hours are a subset of the day where they might be busy with rounds.
            const result = await AppointmentDoctor.updateMany({}, {
                $set: {
                    "visitingHours.start": "16:00",
                    "visitingHours.end": "20:00"
                }
            });

            console.log(`Updated ${result.modifiedCount} doctors with Visiting Hours (16:00 - 20:00)`);
        } catch (err) {
            console.error('Error updating doctors:', err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => console.error('Connection error:', err));
