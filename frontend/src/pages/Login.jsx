import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { authApi } from '../api';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: Math.random() * 100, size: Math.random() * 4 + 2,
    dur: Math.random() * 5 + 4, delay: Math.random() * 5,
    color: ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981'][Math.floor(Math.random() * 4)],
}));

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'Admin' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (!form.username || !form.password || (isRegister && !form.email)) {
            setError('Please fill all required fields');
            return;
        }
        setLoading(true);
        try {
            if (isRegister) {
                await authApi.register(form);
                setError('');
                setIsRegister(false); // Switch to login view
                alert('Registration successful! Please sign in.');
            } else {
                const user = await authApi.login({ username: form.username, password: form.password });
                localStorage.setItem('sms_token', 'real-token');
                localStorage.setItem('sms_user_role', user.role);
                localStorage.setItem('sms_username', user.username);
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Background */}
            <div className="login-bg">
                <div className="login-orb login-orb-1" />
                <div className="login-orb login-orb-2" />
                <div className="login-grid" />
                <div className="login-particles">
                    {PARTICLES.map(p => (
                        <div key={p.id} className="particle" style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.color, '--dur': `${p.dur}s`, '--delay': `${p.delay}s`, boxShadow: `0 0 ${p.size * 2}px ${p.color}` }} />
                    ))}
                </div>
            </div>

            {/* Card */}
            <div className="login-card glass-card">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-inner">🎓</div>
                </div>
                <h1 className="login-title">SMS Portal</h1>
                <p className="login-subtitle">Student Management System</p>

                {/* Role Tabs for Registration */}
                {isRegister && (
                    <div className="role-tabs">
                        {['Admin', 'Faculty', 'Student'].map(r => (
                            <button type="button" key={r} className={`role-tab ${form.role === r ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, role: r }))}>
                                {{ 'Admin': '👨‍💼 Admin', 'Faculty': '👩‍🏫 Faculty', 'Student': '👨‍🎓 Student' }[r]}
                            </button>
                        ))}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label className="input-label">Username</label>
                        <input
                            className="input-field"
                            placeholder="Enter username"
                            value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                            autoComplete="username"
                        />
                    </div>
                    {isRegister && (
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                className="input-field"
                                type="email"
                                placeholder="Enter email"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            className="input-field"
                            type="password"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="login-error">⚠️ {error}</div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
                        {loading ? (
                            <><div className="loading-spinner" style={{ width: 20, height: 20 }} /> Processing...</>
                        ) : (isRegister ? '📝 Create Account' : '🚀 Sign In to Portal')}
                    </button>

                    <div className="demo-hint" style={{ textAlign: 'center', marginTop: '16px', cursor: 'pointer', color: '#6366f1' }} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                        {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
                    </div>
                </form>

                {/* Features */}
                <div className="login-features">
                    {['Students', 'Courses', 'Attendance', 'Grades', 'Fees', 'Reports'].map(f => (
                        <span key={f} className="login-feature-tag">{f}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
