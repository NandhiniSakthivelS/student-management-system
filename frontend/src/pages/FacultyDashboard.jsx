import { useState, useEffect } from 'react';
import { MdPeople, MdBook, MdAnnouncement, MdCheckCircle } from 'react-icons/md';
import { courseApi, noticeApi, studentApi } from '../api';
import './Dashboard.css';

export default function FacultyDashboard() {
    const [courses, setCourses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [courseData, noticeData, stuData] = await Promise.allSettled([
                    courseApi.getAll(),
                    noticeApi.getAll(),
                    studentApi.getAll()
                ]);
                if (courseData.status === 'fulfilled') setCourses(courseData.value);
                if (noticeData.status === 'fulfilled') setNotices(noticeData.value);
                if (stuData.status === 'fulfilled') setStudents(stuData.value);
            } catch (e) {
                console.error('Fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const recentNotices = notices.slice(0, 3);

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Faculty Dashboard</h1>
                    <p className="page-subtitle">Welcome back! Here is your academic overview.</p>
                </div>
            </div>

            <div className="dash-stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}><MdBook /></div>
                    <div className="stat-info">
                        <div className="stat-value">{courses.length}</div>
                        <div className="stat-label">Active Courses</div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}><MdPeople /></div>
                    <div className="stat-info">
                        <div className="stat-value">{students.length}</div>
                        <div className="stat-label">Total Students</div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><MdCheckCircle /></div>
                    <div className="stat-info">
                        <div className="stat-value">Attendance</div>
                        <div className="stat-label">Ready to Mark</div>
                    </div>
                </div>
            </div>

            <div className="dash-grid-2">
                <div className="glass-card g-card">
                    <h3 className="card-title"><MdAnnouncement /> Recent Notices</h3>
                    <div className="activity-list">
                        {recentNotices.map((n, i) => (
                            <div key={i} className="activity-item">
                                <div className={`activity-icon info`}>📋</div>
                                <div className="activity-content">
                                    <div className="activity-text">{n.title}</div>
                                    <div className="activity-time">{n.date} - {n.author}</div>
                                </div>
                            </div>
                        ))}
                        {recentNotices.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent notices.</p>}
                    </div>
                </div>
                <div className="glass-card g-card">
                    <h3 className="card-title"><MdBook /> My Courses Quick View</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {courses.slice(0, 4).map(c => (
                            <div key={c.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{c.name} ({c.code})</strong>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{c.type} - {c.credits} Credits</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
