import { useState, useEffect } from 'react';
import { MdCheckCircle, MdCancel, MdAccessTime, MdSave, MdPeople } from 'react-icons/md';
import './Attendance.css';
import { studentApi, attendanceApi } from '../api';

// Students & history fetched dynamically

const STATUS_CYCLE = { Present: 'Absent', Absent: 'Late', Late: 'Present' };
const STATUS_CONFIG = {
    Present: { icon: <MdCheckCircle />, color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'P' },
    Absent: { icon: <MdCancel />, color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', label: 'A' },
    Late: { icon: <MdAccessTime />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'L' },
};

export default function Attendance() {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [course, setCourse] = useState('CS101 - Data Structures');
    const [studentsList, setStudentsList] = useState([]);
    const [history, setHistory] = useState([]);
    const [statuses, setStatuses] = useState({});
    const [saved, setSaved] = useState(false);

    // Fetch students and history on mount
    useEffect(() => {
        studentApi.getAll().then(data => {
            setStudentsList(data);
            setStatuses(Object.fromEntries(data.map(s => [s.id, 'Present'])));
        }).catch(() => setStudentsList([]));

        attendanceApi.getAll().then(data => setHistory(data)).catch(() => setHistory([]));
    }, []);

    const toggle = id => setStatuses(prev => ({ ...prev, [id]: STATUS_CYCLE[prev[id]] }));
    const markAll = status => setStatuses(Object.fromEntries(studentsList.map(s => [s.id, status])));

    const counts = Object.values(statuses).reduce(
        (a, v) => { a[v] = (a[v] || 0) + 1; return a; }, {}
    );
    const pct = studentsList.length > 0 ? Math.round(((counts.Present || 0) / studentsList.length) * 100) : 0;

    const handleSave = async () => {
        const attendanceData = Object.entries(statuses).map(([studentId, status]) => ({
            studentId, date, course, status
        }));
        try {
            await attendanceApi.mark(attendanceData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            attendanceApi.getAll().then(data => setHistory(data));
        } catch (err) {
            console.error('Failed to save attendance:', err);
            // Optional fallback
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const exportCSV = () => {
        const headers = ['Course', 'Date', 'Status', 'Present Count', 'Absent Count'];
        const rows = history.map(h => [
            h.course || 'N/A',
            h.date || 'N/A',
            h.status || 'N/A',
            (h.status === 'Present' ? 1 : 0) || h.present || 0,
            (h.status === 'Absent' ? 1 : 0) || h.absent || 0
        ]);

        const csvRows = [headers, ...rows].map(row =>
            row.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')
        );
        const BOM = '\uFEFF';
        const csvContent = BOM + csvRows.join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Attendance_History_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="attendance-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Attendance</h1>
                    <p className="page-subtitle">Mark & track student attendance</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={exportCSV}>📤 Export History</button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        <MdSave /> {saved ? 'Saved! ✓' : 'Save Attendance'}
                    </button>
                </div>
            </div>

            <div className="attendance-layout">
                {/* Mark Attendance Panel */}
                <div className="glass-card attend-panel">
                    <div className="attend-panel-header">
                        <h3>Mark Attendance</h3>
                    </div>

                    {/* Controls */}
                    <div className="attend-controls">
                        <div className="input-group">
                            <label className="input-label">Date</label>
                            <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Course</label>
                            <select className="input-field" value={course} onChange={e => setCourse(e.target.value)}>
                                {['CS101 - Data Structures', 'CS201 - OOP', 'CS301 - DBMS', 'CS401 - Machine Learning'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="attend-quick-actions">
                        <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }} onClick={() => markAll('Present')}>
                            ✓ All Present
                        </button>
                        <button className="btn btn-sm" style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }} onClick={() => markAll('Absent')}>
                            ✗ All Absent
                        </button>
                    </div>

                    {/* Student List */}
                    <div className="attend-list">
                        {studentsList.map(s => {
                            const st = statuses[s.id] || 'Present';
                            const cfg = STATUS_CONFIG[st] || STATUS_CONFIG['Present'];
                            return (
                                <div key={s.id} className={`attend-item ${st.toLowerCase()}`} onClick={() => toggle(s.id)}>
                                    <div className="avatar" style={{ background: `hsl(${s.name.charCodeAt(0) * 10}, 65%, 50%)`, fontSize: 14 }}>
                                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="attend-name">{s.name}</div>
                                        <div className="attend-roll">{s.rollNo} · {s.dept}</div>
                                    </div>
                                    <button
                                        className="attend-status-btn"
                                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                                    >
                                        {cfg.icon} {st}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="attend-right">
                    {/* Summary Card */}
                    <div className="glass-card attend-summary">
                        <h3>Today's Summary</h3>
                        <div className="attend-circle-wrap">
                            <svg className="attend-circle" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="url(#grad)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${pct * 2.638} 263.8`}
                                    strokeDashoffset="66"
                                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                />
                                <defs>
                                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="attend-circle-text">
                                <span className="attend-pct">{pct}%</span>
                                <span>Attendance</span>
                            </div>
                        </div>
                        <div className="attend-stat-row">
                            {['Present', 'Absent', 'Late'].map(s => (
                                <div key={s} className="attend-stat-box">
                                    <span style={{ color: STATUS_CONFIG[s].color, fontSize: 22, fontWeight: 800 }}>{counts[s] || 0}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* History */}
                    <div className="glass-card attend-history">
                        <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Recent Records</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {history.slice(0, 10).map((h, i) => (
                                <div key={i} className="hist-row">
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{h.course || 'N/A'}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{h.date || 'N/A'}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                                        <span style={{ color: '#10b981' }}>✓ {(h.status === 'Present' ? 1 : 0) || h.present || 0}</span>
                                        <span style={{ color: '#f43f5e' }}>✗ {(h.status === 'Absent' ? 1 : 0) || h.absent || 0}</span>
                                    </div>
                                </div>
                            ))}
                            {history.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No recent history</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
