import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SeatSelection({ bus, onClose, onProceedToPayment, onBookingSuccess }) {
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [passengerName, setPassengerName] = useState('');
    const [gender, setGender] = useState('Male');

    // States for Boarding, Dropping, and Payment
    const [selectedBoarding, setSelectedBoarding] = useState('');
    const [selectedDropping, setSelectedDropping] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('GPay');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const totalSeatsCount = bus.totalSeats || 30;

    useEffect(() => {
        // Fetch already booked seats for this specific bus using port 7196
        axios.get(`https://localhost:7196/api/bookings/bus/${bus.id}`)
            .then(res => {
                setBookedSeats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching seat layout:", err);
                setLoading(false);
            });
    }, [bus.id]);

    // Filter Admin-configured stops by type
    const boardingStops = bus?.stops?.filter(
        (stop) => stop.type === 'Boarding' || stop.Type === 'Boarding'
    ) || [];

    const droppingStops = bus?.stops?.filter(
        (stop) => stop.type === 'Dropping' || stop.Type === 'Dropping'
    ) || [];

    const toggleSeat = (seatNum) => {
        if (bookedSeats.includes(seatNum)) return; // Can't select already booked seats

        if (selectedSeats.includes(seatNum)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
        } else {
            setSelectedSeats([...selectedSeats, seatNum]);
        }
    };

    const handleBooking = () => {
        if (selectedSeats.length === 0) {
            alert("Please select at least one seat!");
            return;
        }
        if (!passengerName.trim()) {
            alert("Please enter passenger name!");
            return;
        }
        if (!selectedBoarding || !selectedDropping) {
            alert("Please select both Boarding and Dropping points!");
            return;
        }

        const totalFare = selectedSeats.length * bus.fare;

        // Pass structured details to Home.jsx to trigger the payment modal workflow
        if (typeof onProceedToPayment === 'function') {
            onProceedToPayment({
                bus: bus,
                passengerName: passengerName,
                gender: gender,
                boardingPoint: selectedBoarding,
                droppingPoint: selectedDropping,
                selectedSeats: selectedSeats,
                totalFare: totalFare,
                paymentMethod: paymentMethod
            });
        } else {
            // Fallback direct submission if payment modal is bypassed
            setSubmitting(true);
            const bookingPayload = {
                busRouteId: bus.id,
                passengerName: passengerName,
                gender: gender,
                seatNumbers: selectedSeats,
                boardingPoint: selectedBoarding,
                droppingPoint: selectedDropping,
                totalFare: totalFare,
                paymentMethod: paymentMethod
            };

            axios.post('https://localhost:7196/api/bookings', bookingPayload)
                .then(res => {
                    alert(`🎉 Booking Confirmed! Ticket ID: #${res.data.bookingId || 'Success'}`);
                    setSubmitting(false);
                    if (onBookingSuccess) onBookingSuccess();
                })
                .catch(err => {
                    const errorMsg = err.response?.data?.message || "Booking failed! Please try again.";
                    alert(`❌ ${errorMsg}`);
                    setSubmitting(false);
                });
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '550px', width: '90%',
                maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Select Seats & Points - {bus.busName}</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>

                <p style={{ fontSize: '14px', color: '#666' }}>Route: {bus.source} &rarr; {bus.destination}</p>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '15px', margin: '1rem 0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '16px', height: '16px', border: '1px solid #ccc', background: '#fff' }}></div> Available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '16px', height: '16px', background: '#28a745' }}></div> Selected
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '16px', height: '16px', background: '#dc3545' }}></div> Booked
                    </div>
                </div>

                {/* Bus Deck Layout */}
                {loading ? (
                    <p>Loading seat layout...</p>
                ) : (
                    <div style={{
                        border: '2px dashed #bbb', padding: '1rem', borderRadius: '8px', background: '#f8f9fa',
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center'
                    }}>
                        {Array.from({ length: totalSeatsCount }, (_, i) => i + 1).map(seatNum => {
                            const isBooked = bookedSeats.includes(seatNum);
                            const isSelected = selectedSeats.includes(seatNum);

                            let bgColor = '#fff';
                            let color = '#333';
                            let border = '1px solid #ccc';

                            if (isBooked) {
                                bgColor = '#dc3545';
                                color = '#fff';
                                border = 'none';
                            } else if (isSelected) {
                                bgColor = '#28a745';
                                color = '#fff';
                                border = 'none';
                            }

                            return (
                                <button
                                    key={seatNum}
                                    disabled={isBooked}
                                    onClick={() => toggleSeat(seatNum)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '4px',
                                        background: bgColor,
                                        color: color,
                                        border: border,
                                        fontWeight: 'bold',
                                        cursor: isBooked ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {seatNum}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Passenger & Journey Inputs */}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>

                    {/* Passenger Name */}
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Passenger Name:</label>
                    <input
                        type="text"
                        placeholder="Enter passenger name"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' }}
                    />

                    {/* Gender Selection */}
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Gender:</label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' }}
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>

                    {/* Boarding Point Dropdown */}
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Boarding Point (Pickup):</label>
                    <select
                        value={selectedBoarding}
                        onChange={(e) => setSelectedBoarding(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' }}
                    >
                        <option value="">-- Choose Boarding Location --</option>
                        {boardingStops.map((stop, idx) => (
                            <option key={idx} value={stop.stopName || stop.StopName}>
                                {stop.stopName || stop.StopName} ({stop.stopTime || stop.StopTime})
                            </option>
                        ))}
                    </select>

                    {/* Dropping Point Dropdown */}
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Dropping Point (Destination):</label>
                    <select
                        value={selectedDropping}
                        onChange={(e) => setSelectedDropping(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' }}
                    >
                        <option value="">-- Choose Dropping Location --</option>
                        {droppingStops.map((stop, idx) => (
                            <option key={idx} value={stop.stopName || stop.StopName}>
                                {stop.stopName || stop.StopName} ({stop.stopTime || stop.StopTime})
                            </option>
                        ))}
                    </select>

                    {/* Payment Gateway Option */}
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Payment Method:</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem', boxSizing: 'border-box' }}
                    >
                        <option value="GPay">Google Pay (GPay)</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Card">Credit / Debit Card</option>
                    </select>

                    {/* Fare Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span>Selected Seats: <strong>{selectedSeats.join(', ') || 'None'}</strong></span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#d84e55' }}>
                            Total: ₹{selectedSeats.length * bus.fare}
                        </span>
                    </div>

                    {/* Confirm & Pay Button */}
                    <button
                        onClick={handleBooking}
                        disabled={submitting || selectedSeats.length === 0 || !selectedBoarding || !selectedDropping}
                        style={{
                            width: '100%', padding: '12px',
                            background: (submitting || selectedSeats.length === 0 || !selectedBoarding || !selectedDropping) ? '#ccc' : '#d84e55',
                            color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px',
                            cursor: (submitting || selectedSeats.length === 0 || !selectedBoarding || !selectedDropping) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? 'Processing Payment...' : `PAY ₹${selectedSeats.length * bus.fare} & CONFIRM`}
                    </button>
                </div>
            </div>
        </div>
    );
}