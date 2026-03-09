
import React, { useState, useEffect } from 'react';
import './StaffModule.css';
import medicineData from './medicineData';
import { useNavigate } from 'react-router-dom';

const STAFF_API = 'http://localhost:5001/api/staff-module'; // Adjust port if needed

const StaffModule = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [user, setUser] = useState(null); // { role: 'Nurse'|'Doctor', id: '...' }
    const [activeFloor, setActiveFloor] = useState(null);
    const [isFloorLocked, setIsFloorLocked] = useState(true);
    const [view, setView] = useState('Dashboard'); // 'Dashboard', 'PatientDetail'
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientMedicines, setPatientMedicines] = useState([]);

    // UI State
    const [showAddPatientModal, setShowAddPatientModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [medicineSearch, setMedicineSearch] = useState('');
    const [medicineSuggestions, setMedicineSuggestions] = useState([]);

    // Forms
    const [authData, setAuthData] = useState({
        role: 'Nurse',   // 'Nurse' or 'Doctor'
        isLogin: true,
        id: '',
        password: '',
        name: '',
        phone: '',
        confirmPassword: ''
    });
    const [unlockPassword, setUnlockPassword] = useState('');
    const [newPatientForm, setNewPatientForm] = useState({
        name: '', age: '', gender: 'Male', phone: '', email: '', guardianName: '', guardianPhone: '', bloodGroup: '', address: '', bedNumber: ''
    });
    const [newMedicineForm, setNewMedicineForm] = useState({
        medicineName: '', dosage: '', type: '', price: 0, time: 'Morning', foodCondition: 'After Food', exactTime: ''
    });

    // --- FLOORS ---
    const floors = [
        "1st Floor - Emergency",
        "1st Floor - Reception",
        "1st Floor - Rooms",
        "2nd Floor - General Ward",
        "2nd Floor - ICU",
        "3rd Floor - Surgery",
        "4th Floor - Rooms",
        "5th Floor - Rooms"
    ];

    // --- EFFECTS ---

    // Fetch patients when floor changes and is unlocked
    useEffect(() => {
        if (activeFloor && !isFloorLocked) {
            fetchPatients();
        }
    }, [activeFloor, isFloorLocked]);

    // Fetch medicines when patient selected
    useEffect(() => {
        if (selectedPatient) {
            fetchMedicines();
        }
    }, [selectedPatient]);

    // --- API CALLS ---

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${STAFF_API}/patients/${encodeURIComponent(activeFloor)} `);
            const data = await res.json();
            if (data.success) setPatients(data.patients);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedicines = async () => {
        try {
            const res = await fetch(`${STAFF_API}/medicine/${selectedPatient._id} `);
            const data = await res.json();
            if (data.success) setPatientMedicines(data.medicines);
        } catch (err) {
            console.error(err);
        }
    };

    // --- HANDLERS ---

    const handleAuth = async () => {
        const { role, isLogin, id, password, name, phone, confirmPassword } = authData;
        if (isLogin) {
            if (!id || !password) {
                alert("Please enter ID and Password");
                return;
            }
            // mock login success
            setUser({ role, id, name: name || id });
        } else {
            // registration flow
            if (!id || !password || !name || !phone || !confirmPassword) {
                alert("Please fill in all fields");
                return;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }
            // mock registration success
            setUser({ role, id, name });
        }
    };



    // const handleLogin = async (role) => {
    //     if (!loginForm.id || !loginForm.password) {
    //         alert("Please enter ID and Password");
    //         return;
    //     }

    //     try {
    //         const res = await fetch('http://localhost:5001/api/staff-module/login', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ id: loginForm.id, password: loginForm.password, role })
    //         });

    //         const data = await res.json();

    //         if (data.success) {
    //             // Login successful, store user
    //             setUser(data.staffs); // { id, name, role }
    //         } else {
    //             alert(data.message || "Invalid credentials");
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         alert("Login failed, try again later");
    //     }
    // };



    const handleLogout = () => {
        setUser(null);
        setActiveFloor(null);
        setIsFloorLocked(true);
        navigate('/'); // Exit module
    };

    const handleFloorClick = (floor) => {
        if (activeFloor === floor && !isFloorLocked) return;
        setActiveFloor(floor);
        setIsFloorLocked(true); // Always lock on switch
        setView('Dashboard');
        setSelectedPatient(null);
    };

    const handleUnlock = async () => {
        try {
            const res = await fetch(`${STAFF_API}/verify-ward-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ward: activeFloor, password: unlockPassword })
            });
            const data = await res.json();
            if (data.success) {
                setIsFloorLocked(false);
                setUnlockPassword('');
            } else {
                alert('Incorrect Password');
            }
        } catch (err) {
            alert('Error unlocking ward');
        }
    };

    const handleAddPatient = async () => {
        try {
            const payload = { ...newPatientForm, ward: activeFloor };
            const res = await fetch(`${STAFF_API}/patient`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setShowAddPatientModal(false);
                fetchPatients();
                // Reset form
                setNewPatientForm({
                    name: '', age: '', gender: 'Male', phone: '', email: '', guardianName: '', guardianPhone: '', bloodGroup: '', address: '', bedNumber: ''
                });
            } else {
                alert('Error adding patient: ' + data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearchMedicine = (e) => {
        const val = e.target.value;
        setMedicineSearch(val);
        if (val.length > 1) {
            const filtered = medicineData.filter(m => m.name.toLowerCase().includes(val.toLowerCase()));
            setMedicineSuggestions(filtered);
        } else {
            setMedicineSuggestions([]);
        }
    };

    const selectMedicineSuggestion = (med) => {
        setNewMedicineForm({
            ...newMedicineForm,
            medicineName: med.name,
            dosage: med.dosage,
            type: med.type,
            price: med.price
        });
        setMedicineSearch(med.name);
        setMedicineSuggestions([]);
    };

    const handleAddMedicine = async () => {
        if (!newMedicineForm.medicineName) return alert("Select a medicine");

        try {
            const payload = {
                ...newMedicineForm,
                patientId: selectedPatient._id,
                nurseId: user.id
            };
            const res = await fetch(`${STAFF_API}/medicine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                fetchMedicines();
                setMedicineSearch('');
                setNewMedicineForm({ medicineName: '', dosage: '', type: '', price: 0, time: 'Morning', foodCondition: 'After Food', exactTime: '' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkGiven = async (medId, currentStatus) => {
        if (currentStatus === 'Given') return;
        try {
            const res = await fetch(`${STAFF_API}/medicine/${medId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Given', nurseId: user.id })
            });
            const data = await res.json();
            if (data.success) fetchMedicines();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteMedicine = async (medId) => {
        if (!window.confirm("Remove this medicine?")) return;
        try {
            const res = await fetch(`${STAFF_API}/medicine/${medId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchMedicines();
            else alert(data.message);
        } catch (err) {
            console.error(err);
        }
    };

    // handlePurchaseRequest replaced by handleAddToPurchase/handleSendPurchaseRequest


    const [purchaseList, setPurchaseList] = useState([]);

    // ... existing effects ...

    // --- PURCHASE HANDLERS ---

    const handleAddToPurchase = (med) => {
        // Check for duplicates
        if (purchaseList.find(item => item.medicineId === med._id)) {
            return alert("Medicine already in purchase list");
        }

        const newItem = {
            medicineId: med._id, // FIXED: Use _id from MongoDB
            medicineName: med.medicineName,
            dosage: med.dosage,
            quantity: 1,
            price: med.price,
            total: med.price
        };
        setPurchaseList([...purchaseList, newItem]);
    };

    const handleRemoveFromPurchase = (medicineId) => {
        setPurchaseList(purchaseList.filter(item => item.medicineId !== medicineId));
    };

    const handleUpdatePurchaseQuantity = (medicineId, qty) => {
        if (qty < 1) return;
        setPurchaseList(purchaseList.map(item => {
            if (item.medicineId === medicineId) {
                return { ...item, quantity: qty, total: item.price * qty };
            }
            return item;
        }));
    };

    const handleSendPurchaseRequest = async () => {
        if (purchaseList.length === 0) return;

        // FIXED: Validate patient email
        if (!selectedPatient.email) {
            return alert("This patient does not have an email address. Please update patient details first.");
        }

        const totalAmount = purchaseList.reduce((sum, item) => sum + item.total, 0);

        const payload = {
            patientId: selectedPatient._id,
            patientName: selectedPatient.name,
            ward: activeFloor,
            bedNumber: selectedPatient.bedNumber,
            phone: selectedPatient.phoneNumber,
            patientEmail: selectedPatient.email,
            medicines: purchaseList,
            totalAmount
        };

        try {
            const res = await fetch('http://localhost:5001/api/medical-team/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert("Purchase Request Sent to Medical Team");

                // Parallel update for all medicines in list
                await Promise.all(purchaseList.map(item =>
                    fetch(`${STAFF_API}/medicine/${item.medicineId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ purchaseStatus: 'Requested' })
                    })
                ));

                setPurchaseList([]);
                fetchMedicines();
            } else {
                alert("Request failed: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Network error sending request");
        }
    };

    // Notification Check
    const medicinesReady = patientMedicines.some(m => m.purchaseStatus === 'Collected' || m.status === 'Ready'); // 'Collected' is the term in prompt

    // --- RENDERERS ---

    if (!user) {
        const { role, isLogin, id, password, name, phone, confirmPassword } = authData;
        return (
            <div className="staff-login-container">
                <div className="login-box">
                    <div className="login-title">{role} {isLogin ? 'Login' : 'Sign Up'}</div>

                    {/* role selector buttons */}
                    <div className="role-selector">
                        <button
                            className={role === 'Nurse' ? 'active' : ''}
                            onClick={() => setAuthData({ ...authData, role: 'Nurse', id: '', password: '', name: '', phone: '', confirmPassword: '' })}
                        >
                            Nurse
                        </button>
                        <button
                            className={role === 'Doctor' ? 'active' : ''}
                            onClick={() => setAuthData({ ...authData, role: 'Doctor', id: '', password: '', name: '', phone: '', confirmPassword: '' })}
                        >
                            Doctor
                        </button>
                    </div>

                    <div className="login-form-container">
                        {!isLogin && (
                            <>
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setAuthData({ ...authData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setAuthData({ ...authData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label>{role} ID</label>
                            <input
                                type="text"
                                value={id}
                                onChange={e => setAuthData({ ...authData, id: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setAuthData({ ...authData, password: e.target.value })}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="input-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setAuthData({ ...authData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <button className="login-btn" onClick={handleAuth}>
                            {isLogin ? 'Login' : 'Create Account'}
                        </button>

                        <div className="toggle-auth-mode">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                className="text-link"
                                onClick={() => setAuthData({ ...authData, isLogin: !isLogin })}
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-module-container">
            {/* ... Sidebar ... */}
            <div className="sidebar">
                <div className="sidebar-header">
                    HOSPITAL STAFF
                </div>
                <div className="sidebar-menu">
                    {floors.map(floor => (
                        <div
                            key={floor}
                            className={`sidebar-item ${activeFloor === floor ? 'active' : ''}`}
                            onClick={() => handleFloorClick(floor)}
                        >
                            {floor}
                        </div>
                    ))}
                </div>
                <div className="logout-btn-container">
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">
                {!activeFloor ? (
                    <div className="locked-ward">
                        <h2>Select a Floor/Deparment from the sidebar</h2>
                    </div>
                ) : isFloorLocked ? (
                    <div className="locked-ward">
                        <div className="lock-icon"></div>
                        <h2>{activeFloor} is Locked</h2>
                        <div className="unlock-form">
                            <input
                                type="password"
                                placeholder="Enter Ward Password"
                                value={unlockPassword}
                                onChange={(e) => setUnlockPassword(e.target.value)}
                            />
                            <button className="unlock-btn" onClick={handleUnlock}>Unlock</button>
                        </div>
                    </div>
                ) : view === 'Dashboard' ? (
                    // ... (Keep existing Ward Dashboard) ...
                    <div>
                        <div className="ward-header">
                            <div className="ward-title">
                                <h2>{activeFloor} Dashboard</h2>
                            </div>
                            <button className="lock-ward-btn" onClick={() => setIsFloorLocked(true)}>
                                Lock Ward
                            </button>
                        </div>

                        <div className="patient-grid">
                            <button className="patient-card add-patient-card" onClick={() => setShowAddPatientModal(true)}>
                                <div className="add-plus">+</div>
                                <div>Add Patient</div>
                            </button>
                            {patients.map(p => (
                                <div key={p._id} className="patient-card" onClick={() => { setSelectedPatient(p); setView('PatientDetail'); }}>
                                    <div className="card-name">{p.name}</div>
                                    <div className="card-detail">Bed: {p.bedNumber}</div>
                                    <div className="card-detail">Ph: {p.phoneNumber}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // PATIENT DETAIL VIEW
                    <div className="patient-detail-view">
                        <div className="detail-header">
                            <div>
                                <button className="back-btn" onClick={() => setView('Dashboard')}>← Back to Ward</button>
                                <h2>{selectedPatient.name}</h2>
                                {medicinesReady && (
                                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span>Medicines Ready for Collection</span>
                                    </div>
                                )}
                            </div>
                            <div className="patient-info-grid">
                                <div className="info-item"><label>Age</label><span>{selectedPatient.age}</span></div>
                                <div className="info-item"><label>Blood</label><span>{selectedPatient.bloodGroup}</span></div>
                                <div className="info-item"><label>Bed</label><span>{selectedPatient.bedNumber}</span></div>
                                <div className="info-item"><label>Phone</label><span>{selectedPatient.phoneNumber}</span></div>
                            </div>
                        </div>

                        <div className="medicine-section">
                            <h3>Medicine Schedule</h3>

                            {/* ... (Keep Search Bar) ... */}
                            <div className="medicine-search-bar">
                                <div className="search-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Search Medicine..."
                                        value={medicineSearch}
                                        onChange={handleSearchMedicine}
                                    />
                                    {medicineSuggestions.length > 0 && (
                                        <div className="suggestions-dropdown">
                                            {medicineSuggestions.map((m, idx) => (
                                                <div key={idx} className="suggestion-item" onClick={() => selectMedicineSuggestion(m)}>
                                                    {m.name} - {m.dosage}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="medicine-form-inline">
                                    <select value={newMedicineForm.time} onChange={e => setNewMedicineForm({ ...newMedicineForm, time: e.target.value })}>
                                        <option>Morning</option>
                                        <option>Afternoon</option>
                                        <option>Evening</option>
                                        <option>Night</option>
                                    </select>
                                    <select value={newMedicineForm.foodCondition} onChange={e => setNewMedicineForm({ ...newMedicineForm, foodCondition: e.target.value })}>
                                        <option>Before Food</option>
                                        <option>After Food</option>
                                    </select>
                                    <input
                                        type="time"
                                        value={newMedicineForm.exactTime}
                                        onChange={e => setNewMedicineForm({ ...newMedicineForm, exactTime: e.target.value })}
                                    />
                                    <button className="add-med-btn" onClick={handleAddMedicine}>Add</button>
                                </div>
                            </div>

                            <div className="medicine-list">
                                {patientMedicines.map(med => (
                                    <div key={med._id} className={`medicine-card ${med.status === 'Given' ? 'given' : ''}`}>
                                        <div className="med-info">
                                            <h4>{med.medicineName} <span style={{ fontSize: '12px', color: '#777' }}>({med.dosage})</span></h4>
                                            <div className="med-details">
                                                {med.time} • {med.foodCondition} • {med.exactTime || '--:--'} • ${med.price}
                                            </div>
                                        </div>
                                        <div className="med-actions">
                                            <label className="give-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={med.status === 'Given'}
                                                    disabled={med.status === 'Given'}
                                                    onChange={() => handleMarkGiven(med._id, med.status)}
                                                />
                                                {med.status === 'Given' ? 'Given' : 'Give'}
                                            </label>

                                            {med.status !== 'Given' && (
                                                <button className="cancel-med-btn" onClick={() => handleDeleteMedicine(med._id)}>'Remove'</button>
                                            )}

                                            {med.purchaseStatus === 'Requested' ? (
                                                <span className="purchase-requested">Requested</span>
                                            ) : med.purchaseStatus === 'Collected' ? (
                                                <span className="purchase-requested" style={{ backgroundColor: '#d4edda', borderColor: '#c3e6cb', color: '#155724' }}>Ready</span>
                                            ) : (
                                                <button className="purchase-btn" onClick={() => handleAddToPurchase(med)}>'Add to Purchase'</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* PURCHASE LIST SECTION */}
                            {purchaseList.length > 0 && (
                                <div style={{ marginTop: '30px', borderTop: '2px dashed #ddd', paddingTop: '20px' }}>
                                    <h3 style={{ color: '#0f4c5c' }}>Purchase Medicines List</h3>
                                    <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#eee', textAlign: 'left' }}>
                                                <th style={{ padding: '10px' }}>Medicine</th>
                                                <th style={{ padding: '10px' }}>Qty</th>
                                                <th style={{ padding: '10px' }}>Price</th>
                                                <th style={{ padding: '10px' }}>Total</th>
                                                <th style={{ padding: '10px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchaseList.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px' }}>{item.medicineName}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleUpdatePurchaseQuantity(item.medicineId, parseInt(e.target.value))}
                                                            style={{ width: '50px', padding: '5px' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '10px' }}>${item.price}</td>
                                                    <td style={{ padding: '10px' }}>${item.total}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <button
                                                            onClick={() => handleRemoveFromPurchase(item.medicineId)}
                                                            style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={handleSendPurchaseRequest}
                                            style={{
                                                padding: '12px 25px',
                                                backgroundColor: '#0f4c5c',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                fontSize: '16px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Send to Medical Team
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            {/* KEEP ADD PATIENT MODAL */}
            {showAddPatientModal && (
                <div className="add-patient-modal">
                    <div className="form-box">
                        <h3>Add Patient to {activeFloor}</h3>
                        <div className="form-grid">
                            <div className="form-row"><label>Full Name</label><input value={newPatientForm.name} onChange={e => setNewPatientForm({ ...newPatientForm, name: e.target.value })} /></div>
                            <div className="form-row"><label>Age</label><input type="number" value={newPatientForm.age} onChange={e => setNewPatientForm({ ...newPatientForm, age: e.target.value })} /></div>
                            <div className="form-row"><label>Gender</label>
                                <select value={newPatientForm.gender} onChange={e => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}>
                                    <option>Male</option><option>Female</option><option>Other</option>
                                </select>
                            </div>
                            <div className="form-row"><label>Phone</label><input value={newPatientForm.phone} onChange={e => setNewPatientForm({ ...newPatientForm, phone: e.target.value })} /></div>
                            <div className="form-row"><label>Email</label><input type="email" value={newPatientForm.email} onChange={e => setNewPatientForm({ ...newPatientForm, email: e.target.value })} /></div>
                            <div className="form-row"><label>Guardian Name</label><input value={newPatientForm.guardianName} onChange={e => setNewPatientForm({ ...newPatientForm, guardianName: e.target.value })} /></div>
                            <div className="form-row"><label>Guardian Phone</label><input value={newPatientForm.guardianPhone} onChange={e => setNewPatientForm({ ...newPatientForm, guardianPhone: e.target.value })} /></div>
                            <div className="form-row"><label>Blood Group</label><input value={newPatientForm.bloodGroup} onChange={e => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })} /></div>
                            <div className="form-row"><label>Bed Number</label><input value={newPatientForm.bedNumber} onChange={e => setNewPatientForm({ ...newPatientForm, bedNumber: e.target.value })} /></div>
                            <div className="form-row full-width"><label>Address</label><input value={newPatientForm.address} onChange={e => setNewPatientForm({ ...newPatientForm, address: e.target.value })} /></div>
                        </div>
                        <div className="form-actions">
                            <button className="cancel-btn" onClick={() => setShowAddPatientModal(false)}>Cancel</button>
                            <button className="save-btn" onClick={handleAddPatient}>Save Patient</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default StaffModule;
