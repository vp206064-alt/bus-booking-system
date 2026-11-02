import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://localhost:7196/api';

export default function SeatSelection({ bus, onClose, onProceedToPayment }) {
    const [step, setStep] = useState(1); // Step 1: Seats & Decks, Step 2: Passenger, Boarding/Dropping & Payment
    const [activeDeck, setActiveDeck] = useState('lower');
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Passenger & Journey Details
    const [passengerName, setPassengerName] = useState('');
    const [passengerGender, setPassengerGender] = useState('male');
    const [selectedBoarding, setSelectedBoarding] = useState('');
    const [selectedDropping, setSelectedDropping] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('GPay');

    const [loading, setLoading] = useState(true);

    // Fetch existing booked seats for this bus
    useEffect(() => {
        if (bus) {
            axios.get(`${API_BASE}/bookings/bus/${bus.id}`)
                .then(res => {
                    setBookedSeats(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    setBookedSeats([]);
                    setLoading(false);
                });
        }
    }, [bus]);

    // Filter Admin-configured stops by type
    const boardingStops = bus?.stops?.filter(
        (stop) => stop.type === 'Boarding' || stop.Type === 'Boarding'
    ) || [];

    const droppingStops = bus?.stops?.filter(
        (stop) => stop.type === 'Dropping' || stop.Type === 'Dropping'
    ) || [];

    // Lower Deck (1-12) & Upper Deck (13-24) layout with gender restrictions & multipliers
    const getDeckSeats = (deck) => {
        if (deck === 'lower') {
            return [
                { id: 1, type: 'single', priceMultiplier: 1.0, genderRestriction: 'any' },
                { id: 2, type: 'double', priceMultiplier: 1.2, genderRestriction: 'female' },
                { id: 3, type: 'double', priceMultiplier: 1.2, genderRestriction: 'female' },
                { id: 4, type: 'single', priceMultiplier: 1.0, genderRestriction: 'any' },
                { id: 5, type: 'double', priceMultiplier: 1.2, genderRestriction: 'any' },
                { id: 6, type: 'double', priceMultiplier: 1.2, genderRestriction: 'any' },
                { id: 7, type: 'single', priceMultiplier: 1.0, genderRestriction: 'male' },
                { id: 8, type: 'double', priceMultiplier: 1.2, genderRestriction: 'any' },
                { id: 9, type: 'double', priceMultiplier: 1.2, genderRestriction: 'any' },
                { id: 10, type: 'single', priceMultiplier: 1.0, genderRestriction: 'any' },
                { id: 11, type: 'double', priceMultiplier: 1.2, genderRestriction: 'female' },
                { id: 12, type: 'double', priceMultiplier: 1.2, genderRestriction: 'female' },
            ];
        } else {
            return [
                { id: 13, type: 'single', priceMultiplier: 1.1, genderRestriction: 'any' },
                { id: 14, type: 'double', priceMultiplier: 1.3, genderRestriction: 'male' },
                { id: 15, type: 'double', priceMultiplier: 1.3, genderRestriction: 'male' },
                { id: 16, type: 'single', priceMultiplier: 1.1, genderRestriction: 'any' },
                { id: 17, type: 'double', priceMultiplier: 1.3, genderRestriction: 'any' },
                { id: 18, type: 'double', priceMultiplier: 1.3, genderRestriction: 'any' },
                { id: 19, type: 'single', priceMultiplier: 1.1, genderRestriction: 'female' },
                { id: 20, type: 'double', priceMultiplier: 1.3, genderRestriction: 'any' },
                { id: 21, type: 'double', priceMultiplier: 1.3, genderRestriction: 'any' },
                { id: 22, type: 'single', priceMultiplier: 1.1, genderRestriction: 'any' },
                { id: 23, type: 'double', priceMultiplier: 1.3, genderRestriction: 'female' },
                { id: 24, type: 'double', priceMultiplier: 1.3, genderRestriction: 'female' },
            ];
        }
    };

    const toggleSeat = (seat) => {
        // Enforce Gender Restrictions
        if (seat.genderRestriction === 'female' && passengerGender !== 'female') {
            alert("This double sleeper berth is exclusively reserved for female passengers.");
            return;
        }
        if (seat.genderRestriction === 'male' && passengerGender !== 'male') {
            alert("This berth is reserved for male passengers.");
            return;
        }

        if (selectedSeats.includes(seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat.id]);
        }
    };

    const handleProceedToDetails = () => {
        if (!passengerName.trim()) {
            alert("Please enter passenger name before proceeding.");
            return;
        }
        if (selectedSeats.length === 0) {
            alert("Please select at least one berth before proceeding!");
            return;
        }
        setStep(2); // Move to Boarding, Dropping & Payment step
    };

    const handleFinalSubmit = () => {
        if (!selectedBoarding || !selectedDropping) {
            alert("Please select both Boarding and Dropping points!");
            return;
        }

        const totalFare = selectedSeats.reduce((acc, sId) => {
            return acc + Math.round(bus.fare * (sId > 12 ? 1.3 : 1.2));
        }, 0);

        if (typeof onProceedToPayment === 'function') {
            onProceedToPayment({
                bus: bus,
                passengerName: `${passengerName} (${passengerGender.toUpperCase()})`,
                gender: passengerGender,
                boardingPoint: selectedBoarding,
                droppingPoint: selectedDropping,
                selectedSeats: selectedSeats,
                totalFare: totalFare,
                paymentMethod: paymentMethod
            });
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '10px', width: '550px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#333' }}>
                            {step === 1 ? `${bus.busName} - Sleeper Layout` : `Boarding & Dropping - ${bus.busName}`}
                        </h3>
                        <span style={{ fontSize: '12px', color: '#666' }}>{bus.source} ➔ {bus.destination}</span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>

                {/* STEP 1: DECK, GENDER & SEAT SELECTION */}
                {step === 1 && (
                    <div>
                        {/* Passenger Information */}
                        <div style={{ display: 'flex', gap: '15px', marginTop: '15px', background: '#fdf2f2', padding: '12px', borderRadius: '6px', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', color: '#444' }}>Passenger Name:</label>
                                <input type="text" placeholder="Enter full name" value={passengerName} onChange={e => setPassengerName(e.target.value)} style={{ width: '100%', padding: '6px', marginTop: '3px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', color: '#444' }}>Gender:</label>
                                <select value={passengerGender} onChange={e => setPassengerGender(e.target.value)} style={{ padding: '7px', marginTop: '3px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold' }}>
                                    <option value="male">Male 🚹</option>
                                    <option value="female">Female 🚺</option>
                                </select>
                            </div>
                        </div>

                        {/* Deck Switcher */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 0' }}>
                            <button onClick={() => setActiveDeck('lower')} style={{ flex: 1, padding: '8px', background: activeDeck === 'lower' ? '#d84f57' : '#e0e0e0', color: activeDeck === 'lower' ? 'white' : '#333', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Lower Deck
                            </button>
                            <button onClick={() => setActiveDeck('upper')} style={{ flex: 1, padding: '8px', background: activeDeck === 'upper' ? '#d84f57' : '#e0e0e0', color: activeDeck === 'upper' ? 'white' : '#333', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Upper Deck
                            </button>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '11px', color: '#555', marginBottom: '15px', background: '#f8f9fa', padding: '8px', borderRadius: '4px' }}>
                            <span>🟢 Available</span>
                            <span style={{ color: '#d84f57', fontWeight: 'bold' }}>🌸 Female Only</span>
                            <span style={{ color: '#007bff', fontWeight: 'bold' }}>🔵 Male Only</span>
                            <span>⚪ Booked</span>
                        </div>

                        {/* Sleeper Layout Grid */}
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '20px' }}>Loading seat layout...</p>
                        ) : (
                            <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fafafa', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {getDeckSeats(activeDeck).map(seat => {
                                    const isBooked = bookedSeats.includes(seat.id.toString()) || bookedSeats.includes(seat.id);
                                    const isSelected = selectedSeats.includes(seat.id);

                                    let bgCol = '#2ecc71';
                                    let borderCol = '#27ae60';

                                    if (isBooked) {
                                        bgCol = '#e0e0e0';
                                        borderCol = '#ccc';
                                    } else if (isSelected) {
                                        bgCol = '#2c3e50';
                                        borderCol = '#1a252f';
                                    } else if (seat.genderRestriction === 'female') {
                                        bgCol = '#ffe6e6';
                                        borderCol = '#ffb3b3';
                                    } else if (seat.genderRestriction === 'male') {
                                        bgCol = '#e6f0ff';
                                        borderCol = '#b3d1ff';
                                    }

                                    const berthPrice = Math.round(bus.fare * seat.priceMultiplier);

                                    return (
                                        <button
                                            key={seat.id}
                                            disabled={isBooked}
                                            onClick={() => toggleSeat(seat)}
                                            style={{
                                                height: '75px',
                                                backgroundColor: bgCol,
                                                color: isBooked ? '#888' : isSelected ? 'white' : '#333',
                                                border: `2px solid ${borderCol}`,
                                                borderRadius: '6px',
                                                fontWeight: 'bold',
                                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                padding: '8px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <span>#{seat.id}</span>
                                                {seat.genderRestriction === 'female' && <span style={{ color: '#d84f57' }}>🚺</span>}
                                                {seat.genderRestriction === 'male' && <span style={{ color: '#007bff' }}>🚹</span>}
                                            </div>
                                            <div style={{ textAlign: 'center', fontSize: '11px', opacity: 0.8 }}>
                                                {isBooked ? 'Sold' : `₹${berthPrice}`}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Selection Summary */}
                        <div style={{ background: '#f1f2f6', padding: '12px', borderRadius: '6px', margin: '20px 0 15px 0', fontSize: '13px' }}>
                            <p style={{ margin: '0 0 5px 0' }}><strong>Selected Berths:</strong> {selectedSeats.join(', ') || 'None'}</p>
                            <p style={{ margin: 0 }}><strong>Total Fare:</strong> <span style={{ color: '#d84f57', fontWeight: 'bold', fontSize: '15px' }}>₹{selectedSeats.reduce((acc, sId) => acc + Math.round(bus.fare * (sId > 12 ? 1.3 : 1.2)), 0)}</span></p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={onClose} style={{ flex: 1, background: '#95a5a6', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                            <button onClick={handleProceedToDetails} disabled={selectedSeats.length === 0} style={{ flex: 1, background: selectedSeats.length === 0 ? '#ccc' : '#d84f57', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Continue to Boarding &rarr;</button>
                        </div>
                    </div>
                )}

                {/* STEP 2: BOARDING, DROPPING & PAYMENT METHOD */}
                {step === 2 && (
                    <div style={{ marginTop: '1rem' }}>
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

                        {/* Payment Method Selection */}
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

                        {/* Summary Box */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '1rem', background: '#f8f9fa', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
                            <span>Passenger: <strong>{passengerName} ({passengerGender.toUpperCase()})</strong></span>
                            <span>Selected Berths: <strong>{selectedSeats.join(', ')}</strong></span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#d84e55', marginTop: '5px' }}>
                                Total Amount: ₹{selectedSeats.reduce((acc, sId) => acc + Math.round(bus.fare * (sId > 12 ? 1.3 : 1.2)), 0)}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setStep(1)}
                                style={{ flex: 1, background: '#95a5a6', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                &larr; Back
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={!selectedBoarding || !selectedDropping}
                                style={{
                                    flex: 2, padding: '12px',
                                    background: (!selectedBoarding || !selectedDropping) ? '#ccc' : '#d84f57',
                                    color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px',
                                    cursor: (!selectedBoarding || !selectedDropping) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                PROCEED TO PAY &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}