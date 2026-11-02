import React, { useState } from 'react';
import axios from 'axios';
import SeatSelection from '../components/SeatSelection';

const API_BASE = 'https://localhost:7196/api';

export default function Home() {
    const todayStr = new Date().toISOString().split('T')[0];
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 7);
    const maxDateStr = maxDateObj.toISOString().split('T')[0];

    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [outboundDate, setOutboundDate] = useState(todayStr);
    const [returnDate, setReturnDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().split('T')[0];
    });
    const [buses, setBuses] = useState([]);

    // Modular Modal States
    const [selectedBusForSeats, setSelectedBusForSeats] = useState(null);
    const [pendingBookingData, setPendingBookingData] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('GPay');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleOutboundDateChange = (e) => {
        const selectedDate = e.target.value;
        setOutboundDate(selectedDate);
        if (selectedDate) {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 2);
            setReturnDate(d.toISOString().split('T')[0]);
        }
    };

    const searchBuses = async () => {
        try {
            const res = await axios.get(`${API_BASE}/busroutes/search`, {
                params: { source, destination, date: outboundDate }
            });
            setBuses(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Error searching buses");
        }
    };

    // Triggered when user clicks "View Berths" on a bus
    const openSeatSelection = (bus) => {
        setSelectedBusForSeats(bus);
    };

    // Triggered when user finishes selecting seats inside SeatSelection.jsx and clicks "Proceed to Pay"
    const handleProceedToPayment = (bookingDetails) => {
        setPendingBookingData(bookingDetails);
        setPaymentMethod(bookingDetails.paymentMethod || 'GPay'); // Sync selected payment method
        setSelectedBusForSeats(null); // Close seat selection modal
        setShowPaymentModal(true);    // Open payment modal
    };

    // Confirm Payment & Submit Booking to Backend with complete extended fields
    const handleCompletePayment = async () => {
        if (!pendingBookingData) return;
        setIsProcessing(true);

        const busRouteId = Number(pendingBookingData.bus?.id);
        const seatNumbers = (pendingBookingData.selectedSeats || [])
            .map(Number)
            .filter(Number.isInteger);

        if (!busRouteId || seatNumbers.length === 0) {
            setIsProcessing(false);
            alert("Payment failed: select a valid bus and at least one seat.");
            return;
        }

        try {
            // Keep the simulated payment delay inside the awaited try/catch so
            // Axios errors are handled by this function instead of escaping as
            // unhandled promise rejections.
            await new Promise(resolve => setTimeout(resolve, 1200));

            await axios.post(`${API_BASE}/bookings`, {
                busRouteId,
                passengerName: pendingBookingData.passengerName,
                gender: pendingBookingData.passengerGender || 'male',
                boardingPoint: pendingBookingData.boardingPoint || '',
                droppingPoint: pendingBookingData.droppingPoint || '',
                paymentMethod,
                totalFare: Number(pendingBookingData.totalFare) || 0,
                seatNumbers
            });

            setIsProcessing(false);
            setShowPaymentModal(false);
            setPendingBookingData(null);
            alert("Payment Successful via " + paymentMethod.toUpperCase() + "! Sleeper booking confirmed.");
            await searchBuses();
        } catch (err) {
            setIsProcessing(false);
            const serverMessage = err.response?.data?.message
                || err.response?.data?.title
                || err.message;
            alert("Payment failed: " + serverMessage);
        }
    };

    return (
        <div>
            {/* Hero Banner Section */}
            <div style={{ background: 'linear-gradient(135deg, #d84f57 0%, #b33940 100%)', padding: '50px 20px 80px 20px', textAlign: 'center', color: 'white' }}>
                <h1 style={{ fontSize: '36px', marginBottom: '30px', fontWeight: '700' }}>Book your journey now with the world's largest bus platform</h1>

                {/* Search Widget Card */}
                <div style={{ background: 'white', padding: '15px', borderRadius: '8px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', color: '#333' }}>
                    <div style={{ flex: 1, textAlign: 'left', padding: '0 10px', borderRight: '1px solid #ddd' }}>
                        <label style={{ fontSize: '11px', color: '#777', fontWeight: 'bold', display: 'block' }}>FROM</label>
                        <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="Enter Source (e.g. Mumbai)" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', fontWeight: 'bold', padding: '5px 0' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', padding: '0 10px', borderRight: '1px solid #ddd' }}>
                        <label style={{ fontSize: '11px', color: '#777', fontWeight: 'bold', display: 'block' }}>TO</label>
                        <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Enter Destination (e.g. Jalgaon)" style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', fontWeight: 'bold', padding: '5px 0' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', padding: '0 10px', borderRight: '1px solid #ddd' }}>
                        <label style={{ fontSize: '11px', color: '#777', fontWeight: 'bold', display: 'block' }}>DATE</label>
                        <input type="date" value={outboundDate} min={todayStr} max={maxDateStr} onChange={handleOutboundDateChange} style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', fontWeight: 'bold', padding: '5px 0', background: 'transparent' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left', padding: '0 10px' }}>
                        <label style={{ fontSize: '11px', color: '#777', fontWeight: 'bold', display: 'block' }}>RETURN DATE (+2 DAYS)</label>
                        <input type="date" value={returnDate} disabled style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', fontWeight: 'bold', padding: '5px 0', background: 'transparent', color: '#888' }} />
                    </div>
                    <button onClick={searchBuses} style={{ background: '#d84f57', color: 'white', border: 'none', padding: '16px 35px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                        SEARCH BUSES
                    </button>
                </div>
            </div>

            {/* Bus Results List */}
            <div style={{ maxWidth: '1000px', margin: '-30px auto 40px auto', padding: '0 20px' }}>
                {buses.length > 0 && <h3 style={{ marginBottom: '15px', color: '#444' }}>Available Buses ({buses.length})</h3>}
                {buses.map(bus => (
                    <div key={bus.id} style={{ background: 'white', padding: '20px 25px', marginBottom: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '5px solid #d84f57' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#222' }}>{bus.busName}</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}><strong>{bus.source}</strong> ➔ <strong>{bus.destination}</strong> | A/C Sleeper (2+1) | Departure: <strong>{bus.departureTime}</strong></p>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '25px' }}>
                            <div>
                                <span style={{ fontSize: '12px', color: '#777', display: 'block' }}>Starts from</span>
                                <h2 style={{ margin: 0, color: '#d84f57' }}>₹{bus.fare}</h2>
                            </div>
                            <button onClick={() => openSeatSelection(bus)} style={{ background: '#d84f57', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                                VIEW BERTHS
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modular Seat Selection Modal Component */}
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
                        <p style={{ color: '#666', fontSize: '13px', marginBottom: '5px' }}>Boarding: <strong>{pendingBookingData.boardingPoint}</strong></p>
                        <p style={{ color: '#666', fontSize: '13px', marginBottom: '5px' }}>Dropping: <strong>{pendingBookingData.droppingPoint}</strong></p>
                        <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Total Amount: <strong style={{ color: '#d84f57' }}>₹{pendingBookingData.totalFare}</strong></p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px', textAlign: 'left' }}>
                            <label style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'GPay' ? '#fff5f5' : 'white', borderColor: paymentMethod === 'GPay' ? '#d84f57' : '#ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="radio" name="payment" value="GPay" checked={paymentMethod === 'GPay'} onChange={() => setPaymentMethod('GPay')} />
                                <span><strong>Google Pay (GPay) / UPI</strong></span>
                            </label>
                            <label style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'PhonePe' ? '#fff5f5' : 'white', borderColor: paymentMethod === 'PhonePe' ? '#d84f57' : '#ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="radio" name="payment" value="PhonePe" checked={paymentMethod === 'PhonePe'} onChange={() => setPaymentMethod('PhonePe')} />
                                <span><strong>PhonePe / Paytm UPI</strong></span>
                            </label>
                            <label style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'Card' ? '#fff5f5' : 'white', borderColor: paymentMethod === 'Card' ? '#d84f57' : '#ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} />
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