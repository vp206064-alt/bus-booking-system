import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
    const navigate = useNavigate();

    return (
        <nav style={{ background: '#d84f57', color: 'white', padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ background: 'white', color: '#d84f57', padding: '2px 8px', borderRadius: '4px' }}>red</span>Bus
                </Link>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Bus Tickets</Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user ? (
                    <>
                        {user.role?.toLowerCase() === 'admin' && (
                            <Link to="/admin" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '4px' }}>
                                Admin Dashboard
                            </Link>
                        )}
                        <span style={{ fontWeight: '500' }}>Hi, {user.name || user.email}</span>
                        <button onClick={() => { onLogout(); navigate('/login'); }} style={{ background: 'white', color: '#d84f57', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
                        <Link to="/register" style={{ background: 'white', color: '#d84f57', padding: '6px 14px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}