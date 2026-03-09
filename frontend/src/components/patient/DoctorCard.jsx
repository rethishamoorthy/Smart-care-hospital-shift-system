import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorCard.css';

const DoctorCard = ({ doctor }) => {
    const navigate = useNavigate();

    const handleBooking = () => {
        navigate(`/patient/book/${doctor.id}`);
    };

    // Determine availability status (mock logic: check if current time is within working hours)
    // If `forceAvailable` is set on the doctor object (used by DoctorListing), treat them as on-duty.
    const isAvailableNow = () => {
        if (doctor.forceAvailable) return true;
        const now = new Date();
        const hour = now.getHours();
        const start = parseInt(doctor.workingHours?.start?.split(':')[0] ?? '0');
        const end = parseInt(doctor.workingHours?.end?.split(':')[0] ?? '24');
        return hour >= start && hour < end;
    };

    const available = isAvailableNow();

    return (
        <div className="doctor-card" onClick={handleBooking}>
            <div className="doctor-avatar">
                {doctor.name.charAt(0)}
            </div>
            <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name}</h3>
                <div className="doctor-spec">{doctor.specialization}</div>
                <div className="doctor-dept">{doctor.department}</div>
                <div className={`doctor-status ${available ? 'available' : 'unavailable'}`}>
                    <span className="status-dot"></span>
                    {available ? 'Available Now' : 'Off Duty'}
                </div>
            </div>
            <div className="book-btn-area">
                <button className="book-btn">Book Appointment</button>
            </div>
        </div>
    );
};

export default DoctorCard;
