import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatientLanguage } from './PatientLanguageContext';
import './BookAppointment.css';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const { t } = usePatientLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [doctor, setDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        reason: ''
    });

    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');

    useEffect(() => {
        // Fetch doctor details (In real app, might separate this or pass via router state)
        // For now, fetching all and finding one, or better verify backend has getDoctorById
        // I created getAllDoctors, but not getDoctorById in backend routes explicitly?
        // Wait, I only created GET /doctors. I should probably iterate or fetch all and find. 
        // Optimization: Fetch all is fine for small dataset.
        const fetchDoctor = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/appointments/doctors');
                const data = await response.json();
                const doc = data.find(d => d.id === doctorId);
                if (doc) {
                    setDoctor(doc);
                } else {
                    // Handle not found
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    useEffect(() => {
        if (doctor) {
            fetchBookedSlots();

            // Polling for real-time updates (every 5 seconds)
            const intervalId = setInterval(fetchBookedSlots, 5001);

            return () => clearInterval(intervalId);
        }
    }, [doctor, selectedDate]);

    const fetchBookedSlots = async () => {
        try {
            const dateStr = formatDate(selectedDate);
            const response = await fetch(`http://localhost:5001/api/appointments/slots/${doctorId}/${dateStr}?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                setBookedSlots(data.map(item => item.slotTime));
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // Generate Date Options (Next 10 days)
    const generateDates = () => {
        const dates = [];
        for (let i = 0; i < 10; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (date) => {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    };

    // Slot Generation Logic
    useEffect(() => {
        if (!doctor) return;

        const generateSlots = () => {
            const allSlots = [];
            const [startHour, startMin] = doctor.workingHours.start.split(':').map(Number);
            const [endHour, endMin] = doctor.workingHours.end.split(':').map(Number);
            const [lunchStartH, lunchStartM] = doctor.lunchBreak.start.split(':').map(Number);
            const [lunchEndH, lunchEndM] = doctor.lunchBreak.end.split(':').map(Number);

            const [visitingStartH, visitingStartM] = doctor.visitingHours ? doctor.visitingHours.start.split(':').map(Number) : [0, 0];
            const [visitingEndH, visitingEndM] = doctor.visitingHours ? doctor.visitingHours.end.split(':').map(Number) : [0, 0];

            let current = new Date();
            current.setHours(startHour, startMin, 0, 0);

            const end = new Date();
            end.setHours(endHour, endMin, 0, 0);

            while (current < end) {
                const timeStr = current.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

                const currentH = current.getHours();
                const currentM = current.getMinutes();
                const currentMinutes = currentH * 60 + currentM;

                // Lunch Logic
                const lunchStartMinutes = lunchStartH * 60 + lunchStartM;
                const lunchEndMinutes = lunchEndH * 60 + lunchEndM;
                let isLunch = (currentMinutes >= lunchStartMinutes && currentMinutes < lunchEndMinutes);

                // Visiting Hours Logic
                let isVisiting = false;
                if (doctor.visitingHours) {
                    const visitingStartMinutes = visitingStartH * 60 + visitingStartM;
                    const visitingEndMinutes = visitingEndH * 60 + visitingEndM;
                    if (currentMinutes >= visitingStartMinutes && currentMinutes < visitingEndMinutes) {
                        isVisiting = true;
                    }
                }

                let status = 'available';
                if (isLunch) status = 'break';
                else if (isVisiting) status = 'visiting';
                else if (bookedSlots.includes(timeStr)) status = 'booked';

                allSlots.push({ time: timeStr, status });

                // Add 15 mins
                current.setMinutes(current.getMinutes() + 15);
            }
            setSlots(allSlots);
        };

        generateSlots();
    }, [doctor, bookedSlots]);


    const handleSlotClick = (slot) => {
        if (slot.status === 'available') {
            setSelectedSlot(slot.time);
            setShowForm(true);
            setBookingError('');
            // Pre-fill user data if available
            if (user && user.role === 'patient') {
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    // You might want to store more info in user object to pre-fill
                }));
            }
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        setBookingError('');

        try {
            const bookingData = {
                doctorId,
                patientId: user?.email || 'guest', // Using email as ID for demo since auth mock uses emails
                date: formatDate(selectedDate),
                slotTime: selectedSlot,
                patientDetails: formData
            };

            const response = await fetch('http://localhost:5001/api/appointments/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const err = await response.json();

                // Handle concurrency issue (Slot already booked)
                if (response.status === 400 || response.status === 409 || err.message.toLowerCase().includes('already booked')) {
                    alert('This slot was just booked by someone else. Refreshing schedule...');
                    setShowForm(false);
                    setSelectedSlot(null);
                    fetchBookedSlots(); // Refresh slots immediately
                }

                throw new Error(err.message || 'Booking failed');
            }

            // Success
            alert('Appointment Booked Successfully!');
            navigate('/patient/appointments');

        } catch (err) {
            setBookingError(err.message);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading || !doctor) return <div className="loading-screen">Loading schedule...</div>;

    return (
        <div className="booking-page">
            <div className="booking-header">
                <h2>{t('bookAppointment')}</h2>
                <div className="doctor-sub-info">{doctor.name} | {doctor.specialization} | {doctor.department}</div>
            </div>

            <div className="booking-container">
                {/* Left Side: Schedule */}
                <div className={`schedule-section ${showForm ? 'hidden-mobile' : ''}`}>
                    <h3>{t('selectTimeSlot')}</h3>

                    <div className="date-picker-scroller">
                        {generateDates().map(date => (
                            <div
                                key={date.toISOString()}
                                className={`date-card ${formatDate(date) === formatDate(selectedDate) ? 'selected' : ''}`}
                                onClick={() => { setSelectedDate(date); setShowForm(false); setSelectedSlot(null); }}
                            >
                                <div className="date-day">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div className="date-num">{date.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    <div className="slots-legend">
                        <div className="legend-item"><span className="dot available"></span> {t('available')}</div>
                        <div className="legend-item"><span className="dot booked"></span> Booked</div>
                        <div className="legend-item"><span className="dot visiting"></span> Visiting Hours</div>
                        <div className="legend-item"><span className="dot break"></span> Break</div>
                    </div>

                    <div className="slots-grid">
                        {slots.map((slot, index) => (
                            <button
                                key={index}
                                className={`time-slot ${slot.status} ${selectedSlot === slot.time ? 'selected' : ''}`}
                                disabled={slot.status !== 'available'}
                                onClick={() => handleSlotClick(slot)}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Form (appears when slot selected) */}
                {showForm && (
                    <div className="booking-form-section">
                        <h3>{t('patientDetails')}</h3>
                        <div className="selected-slot-info">
                            {formatDisplayDate(selectedDate)} at {selectedSlot}
                        </div>

                        {bookingError && <div className="error-message">{bookingError}</div>}

                        <form onSubmit={handleFormSubmit}>
                            <div className="form-group">
                                <label>{t('fullName')}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('age')}</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('gender')}</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>{t('phone')}</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('reason')}</label>
                                <textarea
                                    required
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>{t('cancel')}</button>
                                <button type="submit" className="confirm-btn" disabled={bookingLoading}>
                                    {bookingLoading ? t('loading') : t('confirmBooking')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookAppointment;
