import React, { useState, useEffect } from 'react';
import './MedicalTeam.css';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5001/api/medical-team';

const MedicalTeamModule = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // { teamId: ... }
    const [authMode, setAuthMode] = useState('Login'); // Login or Signup
    const [view, setView] = useState('Dashboard'); // Dashboard, Detail
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(false);

    // Forms
    const [authForm, setAuthForm] = useState({ name: '', teamId: '', email: '', password: '' });

    useEffect(() => {
        let interval;
        if (user && view === 'Dashboard') {
            fetchRequests();
            // Poll every 5 seconds for new requests
            interval = setInterval(fetchRequests, 5001);
        }
        return () => clearInterval(interval);
    }, [user, view]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/requests`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async () => {
        const endpoint = authMode === 'Login' ? 'login' : 'signup';
        try {
            const res = await fetch(`${API}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authForm)
            });
            const data = await res.json();
            if (data.success) {
                if (authMode === 'Signup') {
                    alert('Signup Successful! Please Login.');
                    setAuthMode('Login');
                } else {
                    setUser({ teamId: data.teamId });
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        setUser(null);
        navigate('/');
    };

    const handleCollect = async () => {
        if (!selectedRequest) return;
        if (!window.confirm("Confirm collection and notify patient?")) return;

        try {
            const res = await fetch(`${API}/collect/${selectedRequest._id}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                alert('Medicine Collected & Email Sent!');
                setView('Dashboard');
                fetchRequests();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // --- RENDERERS ---

    if (!user) {
        return (
            <div className="mt-auth-container">
                <div className="mt-auth-box">
                    <div className="auth-tabs">
                        <div className={`auth-tab ${authMode === 'Login' ? 'active' : ''}`} onClick={() => setAuthMode('Login')}>Login</div>
                        <div className={`auth-tab ${authMode === 'Signup' ? 'active' : ''}`} onClick={() => setAuthMode('Signup')}>Signup</div>
                    </div>
                    {authMode === 'Signup' && (
                        <>
                            <div className="mt-input-group"><label>Name</label><input onChange={e => setAuthForm({ ...authForm, name: e.target.value })} /></div>
                            <div className="mt-input-group"><label>Email</label><input onChange={e => setAuthForm({ ...authForm, email: e.target.value })} /></div>
                        </>
                    )}
                    <div className="mt-input-group"><label>Team ID</label><input onChange={e => setAuthForm({ ...authForm, teamId: e.target.value })} /></div>
                    <div className="mt-input-group"><label>Team ID</label><input onChange={e => setAuthForm({ ...authForm, teamId: e.target.value })} /></div>
                    <div className="mt-input-group"><label>Password</label><input type="password" onChange={e => setAuthForm({ ...authForm, password: e.target.value })} /></div>
                    <button className="mt-submit-btn" onClick={handleAuth}>{authMode}</button>
                </div>
            </div>
        );
    }

    if (view === 'Dashboard') {
        return (
            <div className="medical-team-container">
                <div className="mt-header">
                    <div className="mt-title"><h2>Medical Team Dashboard</h2></div>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>

                {loading ? <p>Loading requests...</p> : requests.length === 0 ? <p>No pending requests.</p> : (
                    <div className="request-grid">
                        {requests.map(req => (
                            <div key={req._id} className="request-card" onClick={() => { setSelectedRequest(req); setView('Detail'); }}>
                                <div className="card-header">
                                    <div className="card-patient-name">{req.patientName}</div>
                                    <div className="card-time">{new Date(req.createdAt).toLocaleTimeString()}</div>
                                </div>
                                <div className="card-info">{req.ward}</div>
                                <div className="card-info">Bed: {req.bedNumber}</div>
                                <div className="card-info">Ph: {req.phone}</div>
                                <div className="card-total">Total: ${req.totalAmount}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (view === 'Detail' && selectedRequest) {
        return (
            <div className="medical-team-container">
                <div className="back-link" onClick={() => setView('Dashboard')}>← Back to Dashboard</div>

                <div className="mt-detail-view">
                    <div className="detail-header-info">
                        <div className="info-block"><label>Patient Name</label><span>{selectedRequest.patientName}</span></div>
                        <div className="info-block"><label>Ward</label><span>{selectedRequest.ward}</span></div>
                        <div className="info-block"><label>Bed Number</label><span>{selectedRequest.bedNumber}</span></div>
                        <div className="info-block"><label>Phone</label><span>{selectedRequest.phone}</span></div>
                    </div>

                    <table className="medicine-table">
                        <thead>
                            <tr>
                                <th>Medicine Name</th>
                                <th>Dosage</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedRequest.medicines.map((m, idx) => (
                                <tr key={idx}>
                                    <td>{m.medicineName}</td>
                                    <td>{m.dosage}</td>
                                    <td>{m.quantity}</td>
                                    <td>${m.price}</td>
                                    <td>${m.total}</td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td colspan="4" style={{ textAlign: 'right' }}>Grand Total:</td>
                                <td>${selectedRequest.totalAmount}</td>
                            </tr>
                        </tbody>
                    </table>

                    <button className="collect-btn" onClick={handleCollect}>
                        Collect Your Medicine
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default MedicalTeamModule;
