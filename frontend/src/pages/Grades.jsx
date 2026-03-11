import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdGrade } from 'react-icons/md';
import './Grades.css';
import { gradeApi, studentApi } from '../api';

// Students list fetched dynamically

const SUBJECTS = ['DSA', 'OOP', 'DBMS', 'Mathematics', 'Machine Learning', 'Networks', 'OS'];

const INIT_GRADES = [];

const GRADE_MAP = (marks, max) => {
    const pct = (marks / max) * 100;
    if (pct >= 90) return { grade: 'O', color: '#10b981', gpa: 10 };
    if (pct >= 80) return { grade: 'A+', color: '#6366f1', gpa: 9 };
    if (pct >= 70) return { grade: 'A', color: '#0ea5e9', gpa: 8 };
    if (pct >= 60) return { grade: 'B+', color: '#f59e0b', gpa: 7 };
    if (pct >= 50) return { grade: 'B', color: '#f59e0b', gpa: 6 };
    if (pct >= 40) return { grade: 'C', color: '#f43f5e', gpa: 5 };
    return { grade: 'F', color: '#f43f5e', gpa: 0 };
};

function GradeModal({ grade, onClose, onSave, studentsList = [] }) {
    const [form, setForm] = useState(grade || { studentId: '', studentName: '', roll: '', subject: '', marks: '', maxMarks: 100, semester: 'S1', exam: 'Internal-1' });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const selectStudent = id => {
        const s = studentsList.find(x => x.id === id);
        if (s) setForm(f => ({ ...f, studentId: s.id, studentName: s.name, roll: s.rollNo || s.roll }));
    };

    const computed = form.marks && form.maxMarks ? GRADE_MAP(Number(form.marks), Number(form.maxMarks)) : null;

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 500 }}>
                <div className="modal-header">
                    <h2>{form.id ? '✏️ Edit Grade' : '➕ Add Grade'}</h2>
                    <button className="btn btn-icon" onClick={onClose}><MdClose /></button>
                </div>
                <div className="modal-body">
                    <div className="form-grid">
                        <div className="input-group full-width">
                            <label className="input-label">Student</label>
                            <select className="input-field" value={form.studentId} onChange={e => selectStudent(e.target.value)}>
                                <option value="">Select Student</option>
                                {studentsList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Subject</label>
                            <select className="input-field" value={form.subject} onChange={e => set('subject', e.target.value)}>
                                <option value="">Select Subject</option>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Exam Type</label>
                            <select className="input-field" value={form.exam} onChange={e => set('exam', e.target.value)}>
                                {['Internal-1', 'Internal-2', 'Semester Exam', 'Practical'].map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Marks Obtained</label>
                            <input className="input-field" type="number" min="0" max={form.maxMarks} placeholder="85" value={form.marks} onChange={e => set('marks', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Maximum Marks</label>
                            <input className="input-field" type="number" min="0" placeholder="100" value={form.maxMarks} onChange={e => set('maxMarks', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Semester</label>
                            <select className="input-field" value={form.semester} onChange={e => set('semester', e.target.value)}>
                                {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    {computed && (
                        <div className="computed-grade" style={{ borderColor: computed.color, background: `${computed.color}15` }}>
                            <span style={{ color: computed.color, fontWeight: 800, fontSize: 28 }}>{computed.grade}</span>
                            <div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Auto-computed Grade</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>GPA Points: {computed.gpa} · {Math.round((Number(form.marks) / Number(form.maxMarks)) * 100)}%</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => {
                        const g = computed || { grade: 'N/A', gpa: 0 };
                        onSave({ ...form, grade: g.grade, id: form.id || `g${Date.now()}` });
                        onClose();
                    }}><MdSave /> Save Grade</button>
                </div>
            </div>
        </div>
    );
}

export default function Grades() {
    const [grades, setGrades] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [delId, setDelId] = useState(null);
    const [filter, setFilter] = useState('');

    // Fetch grades and students from backend on mount
    useEffect(() => {
        gradeApi.getAll().then(data => setGrades(data)).catch(() => setGrades([]));
        studentApi.getAll().then(data => setStudentsList(data)).catch(() => setStudentsList([]));
    }, []);

    const filtered = filter ? grades.filter(g => g.studentName.toLowerCase().includes(filter.toLowerCase()) || g.subject.toLowerCase().includes(filter.toLowerCase())) : grades;

    const handleSave = async g => {
        try {
            if (g.id && grades.find(x => x.id === g.id)) {
                const updated = await gradeApi.update(g.id, g);
                setGrades(prev => prev.map(x => x.id === g.id ? updated : x));
            } else {
                const created = await gradeApi.create(g);
                setGrades(prev => [...prev, created]);
            }
        } catch (err) {
            console.error('Grade save error:', err);
            if (g.id && grades.find(x => x.id === g.id)) setGrades(prev => prev.map(x => x.id === g.id ? g : x));
            else setGrades(prev => [...prev, { ...g, id: Date.now().toString() }]);
        }
    };

    const exportCSV = () => {
        const headers = ['Student Name', 'Roll No', 'Subject', 'Exam', 'Semester', 'Marks', 'Max Marks', 'Grade'];
        const rows = grades.map(g => [
            g.studentName,
            g.roll,
            g.subject,
            g.exam,
            g.semester,
            g.marks,
            g.maxMarks,
            g.grade
        ]);

        const csvRows = [headers, ...rows].map(row =>
            row.map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(',')
        );
        const BOM = '\uFEFF';
        const csvContent = BOM + csvRows.join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Grades_Export_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="grades-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Grades</h1>
                    <p className="page-subtitle">{grades.length} grade records</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={exportCSV}>📤 Export CSV</button>
                    <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('add'); }}><MdAdd /> Add Grade</button>
                </div>
            </div>

            {/* Grade Scale */}
            <div className="grade-scale glass-card">
                {[{ g: 'O', range: '90-100', gpa: 10, c: '#10b981' }, { g: 'A+', range: '80-89', gpa: 9, c: '#6366f1' }, { g: 'A', range: '70-79', gpa: 8, c: '#0ea5e9' }, { g: 'B+', range: '60-69', gpa: 7, c: '#f59e0b' }, { g: 'B', range: '50-59', gpa: 6, c: '#f59e0b' }, { g: 'C', range: '40-49', gpa: 5, c: '#f43f5e' }, { g: 'F', range: '<40', gpa: 0, c: '#f43f5e' }].map(x => (
                    <div key={x.g} className="grade-pill" style={{ background: `${x.c}18`, border: `1px solid ${x.c}40` }}>
                        <span style={{ color: x.c, fontWeight: 800, fontSize: 16 }}>{x.g}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{x.range}%</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{x.gpa} pts</span>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div style={{ marginBottom: 16 }}>
                <input className="input-field" style={{ maxWidth: 320 }} placeholder="🔍 Search by student or subject..." value={filter} onChange={e => setFilter(e.target.value)} />
            </div>

            {/* Table */}
            <div className="glass-card">
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Student</th><th>Roll No.</th><th>Subject</th><th>Exam</th><th>Semester</th><th>Marks</th><th>Grade</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8}><div className="empty-state"><MdGrade style={{ fontSize: 48 }} /><h3>No grade records</h3></div></td></tr>
                            ) : filtered.map(g => {
                                const cfg = GRADE_MAP(Number(g.marks), Number(g.maxMarks));
                                const pct = Math.round((Number(g.marks) / Number(g.maxMarks)) * 100);
                                return (
                                    <tr key={g.id}>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{g.studentName}</td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{g.roll}</td>
                                        <td>{g.subject}</td>
                                        <td><span className="badge badge-info">{g.exam}</span></td>
                                        <td>{g.semester}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontWeight: 700, color: cfg.color }}>{g.marks}/{g.maxMarks}</span>
                                                <div style={{ flex: 1, height: 4, background: 'rgba(99,102,241,0.1)', borderRadius: 999, minWidth: 60 }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 999 }} />
                                                </div>
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td><span className="badge" style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>{g.grade}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-icon btn-sm" onClick={() => { setSelected(g); setModal('edit'); }}><MdEdit /></button>
                                                <button className="btn btn-icon btn-sm" style={{ color: '#f43f5e' }} onClick={() => setDelId(g.id)}><MdDelete /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {(modal === 'add' || modal === 'edit') && <GradeModal grade={modal === 'edit' ? selected : null} onClose={() => setModal(null)} onSave={handleSave} studentsList={studentsList} />}
            {delId && (
                <div className="modal-overlay" onClick={() => setDelId(null)}>
                    <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Delete Grade?</h2><button className="btn btn-icon" onClick={() => setDelId(null)}><MdClose /></button></div>
                        <div className="modal-body"><p style={{ color: 'var(--text-secondary)' }}>Are you sure?</p></div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => {
                                gradeApi.delete(delId).catch(err => console.error(err));
                                setGrades(p => p.filter(g => g.id !== delId));
                                setDelId(null);
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
