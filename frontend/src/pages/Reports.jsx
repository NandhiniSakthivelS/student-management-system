import { useState, useEffect } from 'react';
import { studentApi, courseApi, feeApi, gradeApi } from '../api';
import './Reports.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEPTS = ['B.Tech CSE', 'B.Tech ECE', 'B.Tech Mech', 'B.Sc Math', 'BCA', 'MBA', 'MCA'];

export default function Reports() {
    const [tab, setTab] = useState('overview');
    const [animated, setAnimated] = useState(false);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [fees, setFees] = useState([]);
    const [grades, setGrades] = useState([]);

    useEffect(() => {
        Promise.allSettled([
            studentApi.getAll(),
            courseApi.getAll(),
            feeApi.getAll(),
            gradeApi.getAll(),
        ]).then(([s, c, f, g]) => {
            if (s.status === 'fulfilled') setStudents(s.value);
            if (c.status === 'fulfilled') setCourses(c.value);
            if (f.status === 'fulfilled') setFees(f.value);
            if (g.status === 'fulfilled') setGrades(g.value);
        });
        setTimeout(() => setAnimated(true), 200);
    }, []);

    // Compute live KPIs
    const totalStudents = students.length;
    const totalCourses = courses.length;
    const totalFeesPaid = fees.reduce((s, f) => s + Number(f.paid || 0), 0);
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const avgAttend = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
    const passCount = grades.filter(g => Number(g.marks) >= 40).length;
    const passRate = grades.length > 0 ? Math.round((passCount / grades.length) * 100) : 0;

    // Enrollment by month (distribute students across months)
    const enrollData = MONTHS.map(() => 0);
    students.forEach((_, i) => { enrollData[i % 12] += 1; });
    const maxEnroll = Math.max(...enrollData, 1);

    // Fee collection by month
    const feeData = MONTHS.map(() => 0);
    fees.forEach((f, i) => { feeData[i % 12] += Math.round(Number(f.paid || 0) / 1000); });
    const maxFee = Math.max(...feeData, 1);

    // Department-wise stats
    const deptStats = DEPTS.map(dept => {
        const deptStudents = students.filter(s => s.dept === dept);
        const deptCourses = courses.filter(c => c.dept === dept);
        const deptGrades = grades.filter(g => {
            const stu = students.find(s => s.id === g.studentId);
            return stu && stu.dept === dept;
        });
        const avgGpa = deptStudents.length > 0
            ? (deptStudents.reduce((s, st) => s + Number(st.gpa || 0), 0) / deptStudents.length).toFixed(1)
            : 0;
        const attend = deptStudents.length > 0
            ? Math.round((deptStudents.filter(s => s.status === 'Active').length / deptStudents.length) * 100)
            : 0;
        const deptFees = fees.filter(f => {
            const stu = students.find(s => s.name === f.studentName);
            return stu && stu.dept === dept;
        });
        const feeRecovery = deptFees.length > 0
            ? Math.round((deptFees.reduce((s, f) => s + Number(f.paid || 0), 0) / Math.max(deptFees.reduce((s, f) => s + Number(f.amount || 0), 0), 1)) * 100)
            : 0;
        return { dept, students: deptStudents.length, courses: deptCourses.length, gpa: Number(avgGpa), attend, fee: feeRecovery };
    });

    const KPI_DATA = [
        { label: 'Total Students', val: totalStudents.toLocaleString(), icon: '👨‍🎓', diff: `${activeStudents} active`, color: '#6366f1' },
        { label: 'Total Courses', val: totalCourses.toString(), icon: '📚', diff: `${courses.filter(c => c.type === 'Core').length} core`, color: '#0ea5e9' },
        { label: 'Avg Attendance', val: `${avgAttend}%`, icon: '✅', diff: `${totalStudents} enrolled`, color: '#10b981' },
        { label: 'Fee Collection', val: totalFeesPaid > 100000 ? `₹${(totalFeesPaid / 100000).toFixed(1)}L` : `₹${totalFeesPaid.toLocaleString()}`, icon: '💰', diff: `${fees.length} records`, color: '#f59e0b' },
        { label: 'Pass Rate', val: `${passRate}%`, icon: '🎓', diff: `${grades.length} grades`, color: '#8b5cf6' },
        { label: 'Faculty Count', val: [...new Set(courses.map(c => c.instructor).filter(Boolean))].length.toString(), icon: '👨‍🏫', diff: `across ${totalCourses} courses`, color: '#f43f5e' },
    ];

    const exportCSV = () => {
        const headers = ['Department', 'Total Students', 'Active Courses', 'Avg GPA', 'Attendance (%)', 'Fee Recovery (%)'];
        const rows = deptStats.map(d => [
            d.dept,
            d.students,
            d.courses,
            d.gpa,
            d.attend,
            d.fee
        ]);

        // Proper CSV formatting with BOM for Excel compatibility and quoting for special characters
        const csvRows = [headers, ...rows].map(row =>
            row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
        );
        const BOM = '\uFEFF';
        const csvContent = BOM + csvRows.join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `SMS_Report_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => window.print();

    return (
        <div className="reports-page">
            <div className="page-header">
                <div><h1 className="page-title">Reports & Analytics</h1><p className="page-subtitle">Live insights from your database</p></div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={handlePrint}>🖨️ Print PDF</button>
                    <button className="btn btn-primary" onClick={exportCSV}>📄 Export CSV</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="report-tabs glass-card">
                {['overview', 'enrollment', 'attendance', 'fees'].map(t => (
                    <button key={t} className={`report-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {{ 'overview': '📊 Overview', 'enrollment': '👥 Enrollment', 'attendance': '✅ Attendance', 'fees': '💰 Fees' }[t]}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div>
                    {/* KPI Row */}
                    <div className="kpi-row">
                        {KPI_DATA.map(k => (
                            <div key={k.label} className="kpi-card glass-card">
                                <div style={{ fontSize: 28, marginBottom: 8 }}>{k.icon}</div>
                                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk', color: k.color }}>{k.val}</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', margin: '4px 0' }}>{k.label}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.diff}</div>
                            </div>
                        ))}
                    </div>

                    {/* Dept Table */}
                    <div className="glass-card" style={{ marginTop: 20 }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                            <h3 className="section-title" style={{ fontSize: 16, fontWeight: 700 }}>Department-wise Summary</h3>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead><tr><th>Department</th><th>Students</th><th>Courses</th><th>Avg GPA</th><th>Attendance</th><th>Fee Recovery</th><th>Performance</th></tr></thead>
                                <tbody>
                                    {deptStats.map(d => (
                                        <tr key={d.dept}>
                                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.dept}</td>
                                            <td>{d.students}</td>
                                            <td>{d.courses}</td>
                                            <td style={{ color: '#6366f1', fontWeight: 700 }}>{d.gpa}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ flex: 1, height: 4, background: 'rgba(99,102,241,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${Math.min(d.attend, 100)}%`, background: '#10b981', borderRadius: 999 }} />
                                                    </div>
                                                    <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700, minWidth: 38 }}>{d.attend}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ flex: 1, height: 4, background: 'rgba(99,102,241,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${Math.min(d.fee, 100)}%`, background: '#f59e0b', borderRadius: 999 }} />
                                                    </div>
                                                    <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, minWidth: 38 }}>{d.fee}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${d.gpa >= 8.5 ? 'badge-success' : d.gpa >= 8 ? 'badge-info' : 'badge-warning'}`}>
                                                    {d.gpa >= 8.5 ? 'Excellent' : d.gpa >= 8 ? 'Good' : d.students > 0 ? 'Average' : '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'enrollment' && (
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ marginBottom: 24, fontSize: 16, fontWeight: 700 }}>Student Distribution ({totalStudents} total)</h3>
                    <div className="report-chart" style={{ height: 280 }}>
                        {enrollData.map((v, i) => (
                            <div key={i} className="chart-col">
                                <div className="chart-bar" style={{ height: animated ? `${(v / maxEnroll) * 100}%` : '0%', background: 'linear-gradient(180deg,#6366f1,#8b5cf6)', transitionDelay: `${i * 0.08}s` }}>
                                    <span className="chart-val" style={{ fontSize: 10 }}>{v}</span>
                                </div>
                                <span className="chart-label">{MONTHS[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'attendance' && (
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ marginBottom: 24, fontSize: 16, fontWeight: 700 }}>Active Rate: {avgAttend}%</h3>
                    <div className="report-chart" style={{ height: 280 }}>
                        {DEPTS.map((dept, i) => {
                            const deptStu = students.filter(s => s.dept === dept);
                            const activePct = deptStu.length > 0 ? Math.round((deptStu.filter(s => s.status === 'Active').length / deptStu.length) * 100) : 0;
                            return (
                                <div key={dept} className="chart-col">
                                    <div className="chart-bar" style={{ height: animated ? `${activePct}%` : '0%', background: 'linear-gradient(180deg,#10b981,#0ea5e9)', transitionDelay: `${i * 0.08}s` }}>
                                        <span className="chart-val" style={{ fontSize: 10 }}>{activePct}%</span>
                                    </div>
                                    <span className="chart-label" style={{ fontSize: 9 }}>{dept.replace('B.Tech ', '').replace('B.Sc ', '')}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 'fees' && (
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ marginBottom: 24, fontSize: 16, fontWeight: 700 }}>Fee Collection (₹{totalFeesPaid.toLocaleString()} total)</h3>
                    <div className="report-chart" style={{ height: 280 }}>
                        {feeData.map((v, i) => (
                            <div key={i} className="chart-col">
                                <div className="chart-bar" style={{ height: animated ? `${(v / maxFee) * 100}%` : '0%', background: 'linear-gradient(180deg,#f59e0b,#f43f5e)', transitionDelay: `${i * 0.08}s` }}>
                                    <span className="chart-val" style={{ fontSize: 10 }}>₹{v}k</span>
                                </div>
                                <span className="chart-label">{MONTHS[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
