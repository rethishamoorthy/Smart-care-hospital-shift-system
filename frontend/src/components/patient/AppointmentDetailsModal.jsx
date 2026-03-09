import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AppointmentDetailsModal.css';

const AppointmentDetailsModal = ({ appointment, onClose, onCancelSuccess }) => {
    // `onCancelSuccess` is a callback parent can provide to refresh lists after cancel
    const { user } = useAuth();
    const [cancelling, setCancelling] = useState(false);

    if (!appointment) return null;

    const { doctor, patientDetails, date, slotTime, status } = appointment;

    // Cancel appointment by calling backend. Accepts Mongo _id or custom id server-side.
    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        setCancelling(true);
        try {
            const idToDelete = appointment._id || appointment.id;
            const res = await fetch(`http://localhost:5001/api/appointments/cancel/${idToDelete}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Cancel failed');
            }
            // Let parent refresh its data and close modal
            if (onCancelSuccess) onCancelSuccess();
            onClose();
        } catch (err) {
            alert('Failed to cancel appointment: ' + err.message);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="appointment-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Appointment Details</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="detail-section">
                        <h3>🩺 Doctor Information</h3>
                        <div className="detail-row">
                            <span className="label">Doctor Name:</span>
                            <span className="value">{doctor?.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Specialization:</span>
                            <span className="value">{doctor?.specialization}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Department:</span>
                            <span className="value">{doctor?.department}</span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>📅 Schedule</h3>
                        <div className="detail-row">
                            <span className="label">Date:</span>
                            <span className="value">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Time Slot:</span>
                            <span className="value">{slotTime}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Status:</span>
                            <span className={`status-badge ${status}`}>{status}</span>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>👤 Patient Details</h3>
                        <div className="detail-row">
                            <span className="label">Name:</span>
                            <span className="value">{patientDetails?.name}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Age/Gender:</span>
                            <span className="value">{patientDetails?.age} / {patientDetails?.gender}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Phone:</span>
                            <span className="value">{patientDetails?.phone}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Reason:</span>
                            <span className="value">{patientDetails?.reason}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="close-action-btn" onClick={onClose}>Close</button>
                    {/* Show Cancel only to patients for booked appointments */}
                    {user?.role === 'patient' && status === 'booked' && (
                        <button className="cancel-action-btn" onClick={handleCancel} disabled={cancelling}>
                            {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailsModal;
