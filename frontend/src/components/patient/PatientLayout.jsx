import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePatientLanguage } from './PatientLanguageContext';
import './PatientLayout.css';


const PatientLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const { t, toggleLanguage, language } = usePatientLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [pendingBillsCount, setPendingBillsCount] = useState(0);

    useEffect(() => {
        if (user?.email) {
            fetchPendingBills();
            // Poll for new bills
            const interval = setInterval(fetchPendingBills, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchPendingBills = async () => {
        try {
            const res = await fetch(`http://localhost:5001/api/billing/patient/${user.email}`);
            const data = await res.json();
            if (data.success) {
                const pending = data.bills.filter(b => b.status === 'pending').length;
                setPendingBillsCount(pending);
            }
        } catch (err) {
            console.error("Error fetching bill notifications", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/patient/doctors', label: t('findDoctor'), icon: '' },
        { path: '/patient/appointments', label: t('myAppointments'), icon: '' },
        {
            path: '/patient/billing',
            label: t('billing'),
            icon: '',
            badge: pendingBillsCount > 0 ? pendingBillsCount : null
        }
    ];

    return (
        <div className="patient-layout">
            <div className={`patient-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-area">
                        <span className="logo-icon"></span>
                        {!isCollapsed && <span className="logo-text">Medi<span className="logo-highlight">Care</span></span>}
                    </div>
                    <button
                        className="collapse-btn"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        ☰
                    </button>
                </div>

                <div className="user-info-section">
                    <div className="user-avatar"></div>
                    {!isCollapsed && (
                        <div className="user-details">
                            <div className="user-name">{user?.name || 'Patient'}</div>
                            <div className="user-role">Patient Portal</div>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <div
                            key={item.path}
                            className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!isCollapsed && (
                                <div className="nav-label-container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <span>{item.label}</span>
                                    {item.badge && <span className="nav-badge" style={{ backgroundColor: '#e63946', color: 'white', fontSize: '0.7em', padding: '2px 6px', borderRadius: '10px', marginLeft: '5px' }}>{item.badge}</span>}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="nav-item logout" onClick={handleLogout}>
                        <span className="nav-icon"></span>
                        {!isCollapsed && <span className="nav-label">{t('logout')}</span>}
                    </div>
                </div>
                <div className="sidebar-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <button
                        onClick={toggleLanguage}
                        className="patient-lang-toggle"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'transparent',
                            border: '1px solid #eee',
                            color: 'white',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            marginTop: '10px'
                        }}
                    >
                        {language === 'en' ? 'தமிழ்' : 'English'}
                    </button>
                </div>
            </div>

            <div className="patient-content">
                <Outlet />
            </div>
        </div>
    );
};

export default PatientLayout;
