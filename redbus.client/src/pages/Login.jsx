import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://localhost:7196/api';

export default function Login({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
            const loggedInUser = res.data.user;
            setUser(loggedInUser);
            localStorage.setItem('redbus_user', JSON.stringify(loggedInUser));

            const isAdmin = loggedInUser.role?.toLowerCase() === 'admin';
            navigate(isAdmin ? '/admin' : '/');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '400px', margin: '50px auto', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>Login</h2>
            {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label><br />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label><br />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#d84f57', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
            </form>
        </div>
    );
}