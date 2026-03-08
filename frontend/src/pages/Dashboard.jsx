import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MdPeople, MdBook, MdCheckCircle, MdGrade,
    MdPayment, MdTrendingUp, MdArrowForward, MdAnnouncement,
    MdWarning, MdStar,
} from 'react-icons/md';
import { studentApi, courseApi, feeApi, noticeApi } from '../api';
import './Dashboard.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const DEPT_LIST = ['B.Tech CSE', 'B.Tech ECE', 'B.Sc Math', 'MBA', 'BCA', 'Others'];
const DEPT_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];

export default function Dashboard() {
    const [animate, setAnimate] = useState(false);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [fees, setFees] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all data from backend
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [stuData, courseData, feeData, noticeData] = await Promise.allSettled([
                    studentApi.getAll(),
                    courseApi.getAll(),
                    feeApi.getAll(),
                    noticeApi.getAll(),
                ]);
                if (stuData.status === 'fulfilled') setStudents(stuData.value);
                if (courseData.status === 'fulfilled') setCourses(courseData.value);
                if (feeData.status === 'fulfilled') setFees(feeData.value);
                if (noticeData.status === 'fulfilled') setNotices(noticeData.value);
            } catch (e) {
                console.error('Dashboard fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
        const t = setTimeout(() => setAnimate(true), 200);
        return () => clearTimeout(t);
    }, []);

    // Compute live stats
    const totalStudents = students.length;
    const activeCourses = courses.length;
    const totalFeesPaid = fees.reduce((s, f) => s + Number(f.paid || 0), 0);
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const attendPct = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

    const STATS = [
        { label: 'Total Students', value: totalStudents.toLocaleString(), icon: '👨‍🎓', change: `${activeStudents} active`, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', to: '/students' },
        { label: 'Active Courses', value: activeCourses.toString(), icon: '📚', change: `${courses.filter(c => c.type === 'Core').length} core`, color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', to: '/courses' },
        { label: 'Avg Attendance', value: `${attendPct}%`, icon: '✅', change: `${totalStudents} enrolled`, color: '#10b981', bg: 'rgba(16,185,129,0.15)', to: '/attendance' },
        { label: 'Fees Collected', value: totalFeesPaid > 100000 ? `₹${(totalFeesPaid / 100000).toFixed(1)}L` : `₹${totalFeesPaid.toLocaleString()}`, icon: '💳', change: `${fees.length} records`, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', to: '/fees' },
    ];

    // Top students by GPA
    const topStudents = [...students]
        .filter(s => s.gpa)
        .sort((a, b) => Number(b.gpa) - Number(a.gpa))
        .slice(0, 5)
        .map((s, i) => ({ ...s, rank: i + 1 }));

    // Department distribution
    const deptCounts = {};
    students.forEach(s => {
        const d = DEPT_LIST.includes(s.dept) ? s.dept : 'Others';
        deptCounts[d] = (deptCounts[d] || 0) + 1;
    });
    const maxDeptCount = Math.max(...Object.values(deptCounts), 1);
    const deptData = DEPT_LIST.map(dept => ({
        dept,
        count: deptCounts[dept] || 0,
        pct: Math.round(((deptCounts[dept] || 0) / maxDeptCount) * 100),
    }));

    // Enrollment chart — students per "month" (simulated by creation order chunks)
    const enrollChunks = MONTHS.map(() => 0);
    students.forEach((_, i) => { enrollChunks[i % 6] += 1; });
    const maxEnroll = Math.max(...enrollChunks, 1);

    // Recent activity from notices
    const recentActivity = notices.slice(0, 5).map((n, i) => ({
        id: n.id || i,
        icon: n.priority === 'High' ? '🚨' : n.category === 'Events' ? '🎉' : '📋',
        text: n.title || 'New notice posted',
        time: n.date || 'Recently',
        type: n.priority === 'High' ? 'warning' : 'info',
    }));

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="page-header welcome-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">
                        {loading ? 'Loading data...' : `Welcome back, Admin! ${totalStudents} students, ${activeCourses} courses active.`}
                    </p>
                </div>
                <div className="welcome-illustration-container">
                    <img src="/student_welcome.png" alt="Welcome student" className="welcome-illustration" />
                </div>
                <div style={{ display: 'flex', gap: 12, zIndex: 10 }}>
                    <Link to="/students" className="btn btn-secondary btn-sm">
                        <MdPeople /> View Students
                    </Link>
                    <Link to="/students" className="btn btn-primary btn-sm">
                        + Add Student
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {STATS.map((s, i) => (
                    <Link to={s.to} key={s.label} className="stat-card stat-card-link" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-value" style={{ backgroundImage: `linear-gradient(135deg, ${s.color}, #ffffff88)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {s.value}
                        </div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-change up">
                            <MdTrendingUp /> {s.change}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Grid */}
            <div className="dashboard-grid">
                {/* Enrollment Chart */}
                <div className="glass-card dash-card">
                    <div className="dash-card-header">
                        <h3>Student Distribution</h3>
                        <span className="badge badge-success">Live</span>
                    </div>
                    <div className="chart-area">
                        {enrollChunks.map((v, i) => (
                            <div key={i} className="chart-col">
                                <div
                                    className="chart-bar"
                                    style={{
                                        height: animate ? `${(v / maxEnroll) * 180}px` : '0px',
                                        background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                                        transitionDelay: `${i * 0.1}s`,
                                    }}
                                >
                                    <span className="chart-val">{v}</span>
                                </div>
                                <span className="chart-label">{MONTHS[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Type Chart */}
                <div className="glass-card dash-card">
                    <div className="dash-card-header">
                        <h3>Courses by Type</h3>
                        <span className="badge badge-info">Live</span>
                    </div>
                    <div className="chart-area">
                        {['Core', 'Elective', 'Lab', 'Project'].map((type, i) => {
                            const count = courses.filter(c => c.type === type).length;
                            return (
                                <div key={type} className="chart-col">
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: animate ? `${Math.max((count / Math.max(activeCourses, 1)) * 180, count > 0 ? 20 : 0)}px` : '0px',
                                            background: 'linear-gradient(180deg, #10b981, #0ea5e9)',
                                            transitionDelay: `${i * 0.1}s`,
                                        }}
                                    >
                                        <span className="chart-val">{count}</span>
                                    </div>
                                    <span className="chart-label">{type}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card dash-card">
                    <div className="dash-card-header">
                        <h3>Recent Activity</h3>
                        <Link to="/notices" className="btn btn-secondary btn-sm">View All <MdArrowForward /></Link>
                    </div>
                    <div className="activity-list">
                        {recentActivity.length === 0 && (
                            <div className="empty-state" style={{ padding: 20 }}>
                                <MdAnnouncement style={{ fontSize: 36, opacity: 0.4 }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent activity. Add students, courses, or notices to see updates here.</p>
                            </div>
                        )}
                        {recentActivity.map(a => (
                            <div key={a.id} className={`activity-item activity-${a.type}`}>
                                <div className="activity-icon">{a.icon}</div>
                                <div className="activity-content">
                                    <p>{a.text}</p>
                                    <span className="activity-time">{a.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Students */}
                <div className="glass-card dash-card">
                    <div className="dash-card-header">
                        <h3>Top Performers</h3>
                        <Link to="/grades" className="btn btn-secondary btn-sm">Grades <MdArrowForward /></Link>
                    </div>
                    <div className="top-students">
                        {topStudents.length === 0 && (
                            <div className="empty-state" style={{ padding: 20 }}>
                                <MdStar style={{ fontSize: 36, opacity: 0.4 }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Add students with GPA to see top performers.</p>
                            </div>
                        )}
                        {topStudents.map(s => (
                            <div key={s.id} className="top-student-row">
                                <div className="rank-badge" style={{ background: s.rank === 1 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : s.rank === 2 ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' : s.rank === 3 ? 'linear-gradient(135deg, #b45309, #d97706)' : 'rgba(99,102,241,0.2)' }}>
                                    {s.rank <= 3 ? ['🥇', '🥈', '🥉'][s.rank - 1] : `#${s.rank}`}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{s.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.dept}</div>
                                </div>
                                <div className="gpa-pill">{s.gpa} GPA</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="glass-card dash-card quick-links-card">
                    <div className="dash-card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-links-grid">
                        {[
                            { to: '/students', icon: '👨‍🎓', label: 'Add Student', color: '#6366f1' },
                            { to: '/attendance', icon: '✅', label: 'Mark Attendance', color: '#10b981' },
                            { to: '/grades', icon: '📊', label: 'Enter Grades', color: '#f59e0b' },
                            { to: '/fees', icon: '💰', label: 'Record Payment', color: '#0ea5e9' },
                            { to: '/courses', icon: '📚', label: 'Add Course', color: '#8b5cf6' },
                            { to: '/notices', icon: '📢', label: 'Post Notice', color: '#f43f5e' },
                        ].map(q => (
                            <Link key={q.to} to={q.to} className="quick-link-btn" style={{ '--qc': q.color }}>
                                <span className="quick-link-icon">{q.icon}</span>
                                <span>{q.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Department Distribution */}
                <div className="glass-card dash-card">
                    <div className="dash-card-header">
                        <h3>Dept. Distribution</h3>
                    </div>
                    <div className="dept-bars">
                        {deptData.map((d, i) => (
                            <div key={d.dept} className="dept-bar-row">
                                <span className="dept-name">{d.dept}</span>
                                <div className="dept-track">
                                    <div
                                        className="dept-fill"
                                        style={{
                                            width: animate ? `${d.pct}%` : '0%',
                                            background: DEPT_COLORS[i],
                                            transitionDelay: `${i * 0.1 + 0.3}s`,
                                        }}
                                    />
                                </div>
                                <span className="dept-count">{d.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
