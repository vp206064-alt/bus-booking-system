import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://localhost:7196/api';

export default function AdminDashboard() {
    const todayStr = new Date().toISOString().split('T')[0];
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 7);
    const maxDateStr = maxDateObj.toISOString().split('T')[0];

    const [allBookings, setAllBookings] = useState([]);
    const [newRoute, setNewRoute] = useState({
        busName: '',
        source: '',
        destination: '',
        departureDate: todayStr,
        departureTime: '20:00',
        fare: 450,
        totalSeats: 20,
        boardingPoints: [{ name: '', time: '' }],
        droppingPoints: [{ name: '', time: '' }]
    });

    const loadAdminBookings = () => {
        axios.get(`${API_BASE}/admin/all-bookings`)
            .then(res => setAllBookings(res.data))
            .catch(() => console.error("Error fetching admin bookings"));
    };

    useEffect(() => {
        loadAdminBookings();
    }, []);

    // Boarding Point Handlers
    const handleAddBoardingPoint = () => {
        setNewRoute({
            ...newRoute,
            boardingPoints: [...newRoute.boardingPoints, { name: '', time: '' }]
        });
    };

    const handleBoardingChange = (index, field, value) => {
        const updated = [...newRoute.boardingPoints];
        updated[index][field] = value;
        setNewRoute({ ...newRoute, boardingPoints: updated });
    };

    const handleRemoveBoardingPoint = (index) => {
        const updated = newRoute.boardingPoints.filter((_, i) => i !== index);
        setNewRoute({ ...newRoute, boardingPoints: updated });
    };

    // Dropping Point Handlers
    const handleAddDroppingPoint = () => {
        setNewRoute({
            ...newRoute,
            droppingPoints: [...newRoute.droppingPoints, { name: '', time: '' }]
        });
    };

    const handleDroppingChange = (index, field, value) => {
        const updated = [...newRoute.droppingPoints];
        updated[index][field] = value;
        setNewRoute({ ...newRoute, droppingPoints: updated });
    };

    const handleRemoveDroppingPoint = (index) => {
        const updated = newRoute.droppingPoints.filter((_, i) => i !== index);
        setNewRoute({ ...newRoute, droppingPoints: updated });
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE}/admin/add-route`, newRoute);
            alert(res.data.message || "Bus route added successfully!");
            setNewRoute({
                busName: '',
                source: '',
                destination: '',
                departureDate: todayStr,
                departureTime: '20:00',
                fare: 450,
                totalSeats: 20,
                boardingPoints: [{ name: '', time: '' }],
                droppingPoints: [{ name: '', time: '' }]
            });
        } catch (err) {
            alert("Failed to add route: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this ticket and release seats from backend?")) return;
        try {
            const res = await axios.delete(`${API_BASE}/admin/delete-booking/${bookingId}`);
            alert(res.data.message);
            loadAdminBookings();
        } catch {
            alert("Failed to cancel ticket from backend.");
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto' }}>
            <h2>Admin Control Panel</h2>

            {/* Add New Bus Route & Custom Stops Form */}
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3>Add New Bus Route with Custom Stops</h3>
                <form onSubmit={handleAddRoute} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                    <input type="text" placeholder="Bus Name (e.g. Sangitam Travels)" value={newRoute.busName} onChange={e => setNewRoute({ ...newRoute, busName: e.target.value })} required style={{ padding: '10px' }} />
                    <input type="text" placeholder="Source (e.g. Mumbai)" value={newRoute.source} onChange={e => setNewRoute({ ...newRoute, source: e.target.value })} required style={{ padding: '10px' }} />
                    <input type="text" placeholder="Destination (e.g. Jalgaon)" value={newRoute.destination} onChange={e => setNewRoute({ ...newRoute, destination: e.target.value })} required style={{ padding: '10px' }} />
                    <input type="date" min={todayStr} max={maxDateStr} value={newRoute.departureDate} onChange={e => setNewRoute({ ...newRoute, departureDate: e.target.value })} required style={{ padding: '10px' }} />
                    <input type="text" placeholder="Departure Time (e.g., 20:00)" value={newRoute.departureTime} onChange={e => setNewRoute({ ...newRoute, departureTime: e.target.value })} required style={{ padding: '10px' }} />
                    <input type="number" placeholder="Base Fare (₹)" value={newRoute.fare} onChange={e => setNewRoute({ ...newRoute, fare: parseFloat(e.target.value) })} required style={{ padding: '10px' }} />

                    {/* Boarding Points Section */}
                    <div style={{ gridColumn: 'span 2', background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Boarding Points</h4>
                        {newRoute.boardingPoints.map((bp, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input type="text" placeholder="Location Name (e.g. Borivali)" value={bp.name} onChange={e => handleBoardingChange(index, 'name', e.target.value)} style={{ padding: '8px', flex: 2 }} required />
                                <input type="text" placeholder="Time (e.g. 21:15)" value={bp.time} onChange={e => handleBoardingChange(index, 'time', e.target.value)} style={{ padding: '8px', flex: 1 }} required />
                                {newRoute.boardingPoints.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveBoardingPoint(index)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddBoardingPoint} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>+ Add Boarding Point</button>
                    </div>

                    {/* Dropping Points Section */}
                    <div style={{ gridColumn: 'span 2', background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Dropping Points</h4>
                        {newRoute.droppingPoints.map((dp, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input type="text" placeholder="Location Name (e.g. Bus Stand)" value={dp.name} onChange={e => handleDroppingChange(index, 'name', e.target.value)} style={{ padding: '8px', flex: 2 }} required />
                                <input type="text" placeholder="Time (e.g. 05:30)" value={dp.time} onChange={e => handleDroppingChange(index, 'time', e.target.value)} style={{ padding: '8px', flex: 1 }} required />
                                {newRoute.droppingPoints.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveDroppingPoint(index)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddDroppingPoint} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>+ Add Dropping Point</button>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                        <button type="submit" style={{ width: '100%', background: '#d84f57', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Publish Route & Custom Stops</button>
                    </div>
                </form>
            </div>

            {/* All Customer Bookings Table */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3>All Customer Bookings & Seat Details</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f1f1', textAlign: 'left' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Booking ID</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Passenger</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Bus</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Booked Seat(s)</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Fare Paid</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allBookings.map(b => (
                            <tr key={b.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>#{b.id}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{b.passengerName}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{b.busName} ({b.source} ➔ {b.destination})</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: '#d84f57' }}>
                                    {b.seatNumbers && b.seatNumbers.length > 0 ? b.seatNumbers.join(', ') : 'N/A'}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>₹{b.totalFare}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(b.bookingDate).toLocaleString()}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <button onClick={() => handleDeleteBooking(b.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Cancel Ticket & Free Seats
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}