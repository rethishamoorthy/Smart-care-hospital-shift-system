import React, { useState, useEffect } from 'react';
import DoctorCard from './DoctorCard';
import { usePatientLanguage } from './PatientLanguageContext';
import './DoctorListing.css';

const DoctorListing = () => {
    const { t } = usePatientLanguage();
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            // Using correct port if running locally, assumes proxy isn't set up for backend port 5000 yet
            // If proxy is set in vite.config, we can use /api
            // For safety, full URL or relative if proxy works. Assuming relative /api based on previous code usage (axios usually used but here I use fetch)
            // Wait, existing code uses axios usually but I didn't see axios instance config. 
            // I'll try /api/appointments/doctors. If it fails, I might need localhost:5000

            const response = await fetch('http://localhost:5001/api/appointments/doctors');
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            const data = await response.json();

            // Ensure we show at least 4 doctor cards in the UI (fallback/mock data)
            let fetched = Array.isArray(data) ? data : [];
            const MIN_CARDS = 4;
            if (fetched.length < MIN_CARDS) {
                const extras = [];
                for (let i = fetched.length + 1; i <= MIN_CARDS; i++) {
                    // Provide specific mock doctors for slots 3 and 4 per request
                    let extra;
                    if (i === 3) {
                        extra = {
                            id: `mock-doc-${i}`,
                            name: 'Dr. Hari',
                            specialization: 'Neurologist',
                            department: 'Neurology',
                            workingHours: { start: '00:00', end: '23:59' },
                            lunchBreak: { start: '00:00', end: '00:00' },
                            visitingHours: { start: '00:00', end: '23:59' }
                        };
                    } else if (i === 4) {
                        extra = {
                            id: `mock-doc-${i}`,
                            name: 'Dr. Prabhu',
                            specialization: 'Cardiologist',
                            department: 'Cardiology',
                            workingHours: { start: '00:00', end: '23:59' },
                            lunchBreak: { start: '00:00', end: '00:00' },
                            visitingHours: { start: '00:00', end: '23:59' }
                        };
                    } else {
                        extra = {
                            id: `mock-doc-${i}`,
                            name: `Dr. Kumar ${i}`,
                            specialization: 'General Medicine',
                            department: 'General',
                            workingHours: { start: '00:00', end: '23:59' },
                            lunchBreak: { start: '00:00', end: '00:00' },
                            visitingHours: { start: '00:00', end: '23:59' }
                        };
                    }
                    extras.push(extra);
                }
                fetched = [...fetched, ...extras];
            }

            // For this page, display all doctors as "on duty" (Available Now)
            fetched = fetched.map(d => ({ ...d, forceAvailable: true }));

            setDoctors(fetched);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Could not load doctors. Please try again later.');
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const searchLower = searchTerm.toLowerCase();
        return (
            doc.name.toLowerCase().includes(searchLower) ||
            doc.specialization.toLowerCase().includes(searchLower) ||
            doc.department.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="doctor-listing-page">
            <div className="search-section">
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="listing-content">
                <h2 className="page-title">{t('findDoctor')}</h2>

                {loading ? (
                    <div className="listing-loading">{t('loading')}</div>
                ) : error ? (
                    <div className="listing-error">{error}</div>
                ) : (
                    <>
                        <div className="doctors-grid">
                            {filteredDoctors.map(doctor => (
                                <DoctorCard key={doctor.id} doctor={doctor} />
                            ))}
                        </div>
                        {filteredDoctors.length === 0 && (
                            <div className="no-results">
                                {t('noDoctorsFound')} "{searchTerm}"
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DoctorListing;
