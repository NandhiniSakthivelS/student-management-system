import { useState, useEffect } from 'react';
import { MdBook, MdGrade, MdCheckCircle, MdPayment, MdAnnouncement } from 'react-icons/md';
import { courseApi, feeApi, gradeApi, attendanceApi, noticeApi } from '../api';
import './Dashboard.css';

export default function StudentDashboard() {
    const [courses, setCourses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [courseData, noticeData] = await Promise.allSettled([
                    courseApi.getAll(),
                    noticeApi.getAll()
                ]);
                if (courseData.status === 'fulfilled') setCourses(courseData.value);
                if (noticeData.status === 'fulfilled') setNotices(noticeData.value);
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
                    <h1 className="page-title">Student Dashboard</h1>
                    <p className="page-subtitle">Welcome to your student portal.</p>
                </div>
            </div>

            <div className="dash-stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}><MdBook /></div>
                    <div className="stat-info">
                        <div className="stat-value">{Math.floor(courses.length / 2)}</div>
                        <div className="stat-label">Enrolled Courses</div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}><MdGrade /></div>
                    <div className="stat-info">
                        <div className="stat-value">A</div>
                        <div className="stat-label">Recent Grade</div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}><MdPayment /></div>
                    <div className="stat-info">
                        <div className="stat-value">Clear</div>
                        <div className="stat-label">Fee Status</div>
                    </div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}><MdCheckCircle /></div>
                    <div className="stat-info">
                        <div className="stat-value">95%</div>
                        <div className="stat-label">Attendance</div>
                    </div>
                </div>
            </div>

            <div className="dash-grid-2">
                <div className="glass-card g-card">
                    <h3 className="card-title"><MdAnnouncement /> Campus Updates</h3>
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
                        {recentNotices.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No recent updates.</p>}
                    </div>
                </div>
                <div className="glass-card g-card">
                    <h3 className="card-title"><MdBook /> Enrolled Courses</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {courses.slice(0, 3).map(c => (
                            <div key={c.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{c.name} ({c.code})</strong>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{c.type} - {c.department}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
