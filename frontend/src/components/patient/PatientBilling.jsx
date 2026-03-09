import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PatientBilling.css';

const PatientBilling = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.email) {
            fetchBills();
        }
    }, [user]);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5001/api/billing/patient/${user.email}`);
            const data = await res.json();
            if (data.success) {
                setBills(data.bills);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayBill = async (billId) => {
        try {
            const res = await fetch(`http://localhost:5001/api/billing/pay/${billId}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                alert('Payment Successful!');
                fetchBills();
            } else {
                alert('Payment Failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!user || !user.email) {
        return <div className="billing-container"><h2>Please log in to view bills.</h2></div>;
    }

    return (
        <div className="billing-container">
            <h2>My Medical Bills</h2>
            {loading ? <div className="loading">Loading bills...</div> : (
                <div className="bills-grid">
                    {bills.length === 0 ? <p>No bills found.</p> : bills.map(bill => (
                        <div key={bill._id} className={`bill-card ${bill.status}`}>
                            <div className="bill-header">
                                <h3>Invoice #{bill._id.slice(-6).toUpperCase()}</h3>
                                <span className={`status-badge ${bill.status}`}>
                                    {bill.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="bill-date">{new Date(bill.createdAt).toLocaleDateString()}</div>

                            <div className="bill-items">
                                {bill.medicines.map((item, idx) => (
                                    <div key={idx} className="bill-item">
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>${item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bill-total">
                                <span>Total Amount</span>
                                <span>${bill.totalAmount.toFixed(2)}</span>
                            </div>

                            {bill.status === 'pending' && (
                                <button className="pay-btn" onClick={() => handlePayBill(bill._id)}>
                                    Pay Now
                                </button>
                            )}
                            {bill.status === 'paid' && (
                                <div className="paid-stamp">PAID</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientBilling;
