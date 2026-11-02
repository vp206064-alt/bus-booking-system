import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import SeatSelection from './components/SeatSelection';
import axios from 'axios';

const API_BASE = 'https://localhost:7196/api';

export default function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('redbus_user')) || null);

    // Global booking & payment flow states
    const [selectedBusForSeats, setSelectedBusForSeats] = useState(null);
    const [pendingBookingData, setPendingBookingData] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('gpay');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('redbus_user');
    };

    const isAdminUser = user?.role?.toLowerCase() === 'admin';

    // Triggered when user finishes selecting seats and clicks "Proceed to Pay" in SeatSelection.jsx
    const handleProceedToPayment = (bookingDetails) => {
        setPendingBookingData(bookingDetails);
        setSelectedBusForSeats(null); // Close seat modal
        setShowPaymentModal(true);    // Open payment modal
    };

    // Confirm Payment & Submit to Backend API
    const handleCompletePayment = async () => {
        if (!pendingBookingData) return;
        setIsProcessing(true);
        try {
            setTimeout(async () => {
                await axios.post(`${API_BASE}/bookings`, {
                    busRouteId: pendingBookingData.bus.id,
                    passengerName: pendingBookingData.passengerName,
                    totalFare: pendingBookingData.totalFare,
                    seatNumbers: pendingBookingData.selectedSeats
                });
                setIsProcessing(false);
                setShowPaymentModal(false);
                setPendingBookingData(null);
                alert("Payment Successful via " + paymentMethod.toUpperCase() + "! Sleeper booking confirmed.");
            }, 1200);
        } catch (err) {
            setIsProcessing(false);
            alert("Payment failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
            <Navbar user={user} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home onSelectBus={setSelectedBusForSeats} />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register setUser={setUser} />} />
                <Route
                    path="/admin"
                    element={isAdminUser ? <AdminDashboard /> : <Navigate to="/login" />}
                />
            </Routes>

            {/* Modular Seat Selection Modal */}
            {selectedBusForSeats && (
                <SeatSelection
                    bus={selectedBusForSeats}
                    onClose={() => setSelectedBusForSeats(null)}
                    onProceedToPayment={handleProceedToPayment}
                />
            )}

            {/* Digital Payment Gateway Modal */}
            {showPaymentModal && pendingBookingData && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '10px', width: '380px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ color: '#333', marginBottom: '5px' }}>Select Payment Method</h3>
                        <p style={{ color: '#666', fontSize: '13px', marginBottom: '5px' }}>Passenger: <strong>{pendingBookingData.passengerName}</strong></p>
                        <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Total Amount: <strong style={{ color: '#d84f57' }}>₹{pendingBookingData.totalFare}</strong></p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px', textAlign: 'left' }}>
                            <label style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'gpay' ? '#fff5f5' : 'white', borderColor: paymentMethod === 'gpay' ? '#d84f57' : '#ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="radio" name="payment" value="gpay" checked={paymentMethod === 'gpay'} onChange={() => setPaymentMethod('gpay')} />
                                <span><strong>Google Pay (GPay) / UPI</strong></span>
                            </label>
                            <label style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'phonepe' ? '#fff5f5' : 'white', borderColor: paymentMethod === 'phonepe' ? '#d84f57' : '#ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="radio" name="payment" value="phonepe" checked={paymentMethod === 'phonepe'} onChange={() => setPaymentMethod('phonepe')} />
                                <span><strong>PhonePe / Paytm UPI</strong></span>
                            </label>
                            <label style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'card' ? '#fff5f5' : 'white', borderColor: paymentMethod === 'card' ? '#d84f57' : '#ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                <span><strong>Credit / Debit Card</strong></span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => { setShowPaymentModal(false); setSelectedBusForSeats(pendingBookingData.bus); }} disabled={isProcessing} style={{ flex: 1, background: '#95a5a6', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Back</button>
                            <button onClick={handleCompletePayment} disabled={isProcessing} style={{ flex: 1, background: '#d84f57', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {isProcessing ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}