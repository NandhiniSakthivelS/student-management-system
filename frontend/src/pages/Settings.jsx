import { useState } from 'react';
import { MdSave } from 'react-icons/md';
import './Settings.css';

export default function Settings() {
    const [collegeName, setCollegeName] = useState(localStorage.getItem('sms_college') || 'Vidyasagar Institute of Technology');
    const [email, setEmail] = useState(localStorage.getItem('sms_email') || 'admin@vit.edu.in');
    const [phone, setPhone] = useState(localStorage.getItem('sms_phone') || '+91 98765 43210');
    const [academic, setAcademic] = useState(localStorage.getItem('sms_academic') || '2024-25');
    const [theme, setTheme] = useState(localStorage.getItem('sms_theme') || 'dark');
    const [accent, setAccent] = useState(localStorage.getItem('sms_accent') || '#6366f1');
    const [notif, setNotif] = useState(JSON.parse(localStorage.getItem('sms_notif') || '{"email": true, "sms": false, "push": true}'));
    const [saved, setSaved] = useState(false);

    const applyTheme = (t) => {
        setTheme(t);
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('sms_theme', t);
    };

    const applyAccent = (c) => {
        setAccent(c);
        document.documentElement.style.setProperty('--primary', c);
        // Compute lighter/darker variations if needed or just use the main one
        document.documentElement.style.setProperty('--border-glow', `${c}80`);
        document.documentElement.style.setProperty('--shadow-glow', `0 0 30px ${c}4d`);
        localStorage.setItem('sms_accent', c);
    };

    const save = () => {
        localStorage.setItem('sms_college', collegeName);
        localStorage.setItem('sms_email', email);
        localStorage.setItem('sms_phone', phone);
        localStorage.setItem('sms_academic', academic);
        localStorage.setItem('sms_notif', JSON.stringify(notif));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage your institution configuration</p></div>
                <button className="btn btn-primary" onClick={save}>
                    <MdSave /> {saved ? 'Saved! ✓' : 'Save Changes'}
                </button>
            </div>

            <div className="settings-grid">
                {/* College Info */}
                <div className="settings-card glass-card">
                    <h3 className="settings-section-title">🏫 Institution Information</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { label: 'College Name', val: collegeName, set: setCollegeName },
                            { label: 'Admin Email', val: email, set: setEmail, type: 'email' },
                            { label: 'Phone Number', val: phone, set: setPhone },
                            { label: 'Academic Year', val: academic, set: setAcademic },
                        ].map(f => (
                            <div key={f.label} className="input-group">
                                <label className="input-label">{f.label}</label>
                                <input className="input-field" type={f.type || 'text'} value={f.val} onChange={e => f.set(e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Appearance */}
                <div className="settings-card glass-card">
                    <h3 className="settings-section-title">🎨 Appearance</h3>
                    <div className="theme-options">
                        {[{ key: 'dark', icon: '🌙', label: 'Dark Mode' }, { key: 'light', icon: '☀️', label: 'Light Mode' }].map(t => (
                            <div key={t.key} className={`theme-opt ${theme === t.key ? 'active' : ''}`} onClick={() => applyTheme(t.key)}>
                                <span style={{ fontSize: 24 }}>{t.icon}</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
                                {theme === t.key && <div className="theme-check">✓</div>}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 20 }} className="input-group">
                        <label className="input-label">Accent Color</label>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                            {['#6366f1', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'].map(c => (
                                <div
                                    key={c}
                                    className={`accent-color ${accent === c ? 'active' : ''}`}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: c,
                                        cursor: 'pointer',
                                        border: accent === c ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                                        boxShadow: accent === c ? `0 0 10px ${c}` : 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => applyAccent(c)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-card glass-card">
                    <h3 className="settings-section-title">🔔 Notification Preferences</h3>
                    {[
                        { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                        { key: 'sms', label: 'SMS Alerts', desc: 'Get SMS for urgent notices' },
                        { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                    ].map(n => (
                        <div key={n.key} className="notif-row">
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{n.label}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.desc}</div>
                            </div>
                            <div className={`toggle ${notif[n.key] ? 'on' : ''}`} onClick={() => setNotif(p => ({ ...p, [n.key]: !p[n.key] }))}>
                                <div className="toggle-knob" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Security */}
                <div className="settings-card glass-card">
                    <h3 className="settings-section-title">🔐 Security</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { label: 'Current Password', ph: 'Enter current password', type: 'password' },
                            { label: 'New Password', ph: 'Enter new password', type: 'password' },
                            { label: 'Confirm Password', ph: 'Confirm new password', type: 'password' },
                        ].map(f => (
                            <div key={f.label} className="input-group">
                                <label className="input-label">{f.label}</label>
                                <input className="input-field" type={f.type} placeholder={f.ph} />
                            </div>
                        ))}
                        <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={save}>Update Password</button>
                    </div>
                </div>

                {/* Academic */}
                <div className="settings-card glass-card">
                    <h3 className="settings-section-title">🎓 Academic Settings</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="input-group">
                            <label className="input-label">Grading System</label>
                            <select className="input-field"><option>10-Point GPA (CGPA)</option><option>Percentage</option><option>Letter Grade</option></select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Attendance Threshold (%)</label>
                            <input className="input-field" type="number" defaultValue={75} min={60} max={100} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Semester Duration</label>
                            <select className="input-field"><option>6 Months</option><option>4 Months (Trimester)</option></select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Fee Late Penalty (₹/week)</label>
                            <input className="input-field" type="number" defaultValue={500} />
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="settings-card glass-card about-card">
                    <h3 className="settings-section-title">ℹ️ About</h3>
                    <div className="about-logo">🎓</div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, backgroundImage: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SMS Portal v1.0</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, maxWidth: 300, textAlign: 'center' }}>
                        A full-stack Student Management System built with React, Spring Boot & MongoDB.
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                        {['⚛️ React 18', '☕ Spring Boot 3', '🍃 MongoDB', '🔧 Maven'].map(t => (
                            <span key={t} className="badge badge-primary" style={{ fontSize: 11 }}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
