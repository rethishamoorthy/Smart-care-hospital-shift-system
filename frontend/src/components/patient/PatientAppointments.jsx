import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import { usePatientLanguage } from './PatientLanguageContext';
import './PatientAppointments.css';

const PatientAppointments = () => {
    const { user } = useAuth();
    const { t } = usePatientLanguage();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user]);

    const fetchAppointments = async () => {
        try {
            // Use user.email as ID for demo matching booking logic
            const patientId = user.email;
            const response = await fetch(`http://localhost:5001/api/appointments/patient/${patientId}`);
            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'booked': return 'status-booked';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    return (
        <div className="my-appointments-page">
            <h2 className="page-title">{t('myAppointments')}</h2>

            {loading ? (
                <div className="loading">{t('loading')}</div>
            ) : appointments.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>{t('noAppointments')}</h3>
                    <p>You haven't booked any appointments yet.</p>
                    <button className="browse-btn" onClick={() => navigate('/patient/doctors')}>
                        {t('findDoctor')}
                    </button>
                </div>
            ) : (
                <div className="appointments-list">
                    {appointments.map(app => (
                        <div key={app._id} className="appointment-card">
                            <div className="app-date-box">
                                <span className="app-day">{new Date(app.date).getDate()}</span>
                                <span className="app-month">{new Date(app.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            </div>

                            <div className="app-details">
                                <div className="app-doctor-name">{app.doctor?.name}</div>
                                <div className="app-speciality">{app.doctor?.specialization}</div>
                                <div className="app-time-row">
                                    <span className="app-time">🕒 {app.slotTime}</span>
                                    <span className={`app-status ${getStatusClass(app.status)}`}>
                                        {app.status}
                                    </span>
                                </div>
                            </div>

                            <div className="app-actions">
                                <button
                                    className="details-btn"
                                    onClick={() => setSelectedAppointment(app)}
                                >
                                    {t('viewDetails')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedAppointment && (
                <AppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    onCancelSuccess={() => { setSelectedAppointment(null); fetchAppointments(); }}
                />
            )}
        </div>
    );
};

export default PatientAppointments;
