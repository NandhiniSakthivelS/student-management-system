import { useState, useEffect, useCallback } from 'react';
import {
    MdAdd, MdEdit, MdDelete, MdSearch, MdRefresh,
    MdPeople, MdFilterList, MdClose, MdPhone, MdEmail,
    MdLocationOn, MdSchool, MdSave, MdVisibility,
} from 'react-icons/md';
import { studentApi } from '../api';
import './Students.css';

const DEPARTMENTS = ['B.Tech CSE', 'B.Tech ECE', 'B.Tech Mech', 'B.Sc Math', 'BCA', 'MBA', 'MCA', 'B.Com'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const SAMPLE_STUDENTS = [];

const EMPTY_FORM = {
    rollNo: '', name: '', email: '', phone: '', dept: '', year: '', gender: '',
    bloodGroup: '', dob: '', address: '', gpa: '', status: 'Active',
};

function StudentModal({ student, onClose, onSave }) {
    const [form, setForm] = useState(student || EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.rollNo) e.rollNo = 'Required';
        if (!form.name) e.name = 'Required';
        if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
        if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = '10-digit number required';
        if (!form.dept) e.dept = 'Required';
        if (!form.year) e.year = 'Required';
        if (!form.gender) e.gender = 'Required';
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            if (form.id) {
                await studentApi.update(form.id, form).catch(() => null); // backend optional
            } else {
                await studentApi.create(form).catch(() => null);
            }
        } finally {
            setLoading(false);
            onSave({ ...form, id: form.id || Date.now().toString() });
            onClose();
        }
    };

    const field = (key, val) => setForm(f => ({ ...f, [key]: val }));

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 640 }}>
                <div className="modal-header">
                    <h2>{form.id ? '✏️ Edit Student' : '➕ New Student'}</h2>
                    <button className="btn btn-icon" onClick={onClose}><MdClose /></button>
                </div>
                <div className="modal-body">
                    <div className="form-grid">
                        {[
                            { key: 'rollNo', label: 'Roll Number', placeholder: 'CSE2024001' },
                            { key: 'name', label: 'Full Name', placeholder: 'Aarav Mehta' },
                            { key: 'email', label: 'Email Address', placeholder: 'aarav@college.edu', type: 'email' },
                            { key: 'phone', label: 'Phone', placeholder: '9876543210' },
                        ].map(f => (
                            <div className="input-group" key={f.key}>
                                <label className="input-label">{f.label}</label>
                                <input
                                    className={`input-field ${errors[f.key] ? 'error' : ''}`}
                                    type={f.type || 'text'}
                                    placeholder={f.placeholder}
                                    value={form[f.key]}
                                    onChange={e => field(f.key, e.target.value)}
                                />
                                {errors[f.key] && <span className="field-error">{errors[f.key]}</span>}
                            </div>
                        ))}
                        <div className="input-group">
                            <label className="input-label">Department</label>
                            <select className="input-field" value={form.dept} onChange={e => field('dept', e.target.value)}>
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.dept && <span className="field-error">{errors.dept}</span>}
                        </div>
                        <div className="input-group">
                            <label className="input-label">Year</label>
                            <select className="input-field" value={form.year} onChange={e => field('year', e.target.value)}>
                                <option value="">Select Year</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Gender</label>
                            <select className="input-field" value={form.gender} onChange={e => field('gender', e.target.value)}>
                                <option value="">Select Gender</option>
                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Blood Group</label>
                            <select className="input-field" value={form.bloodGroup} onChange={e => field('bloodGroup', e.target.value)}>
                                <option value="">Select Blood Group</option>
                                {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Date of Birth</label>
                            <input className="input-field" type="date" value={form.dob} onChange={e => field('dob', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">GPA</label>
                            <input className="input-field" type="number" min="0" max="10" step="0.1" placeholder="9.5" value={form.gpa} onChange={e => field('gpa', e.target.value)} />
                        </div>
                        <div className="input-group full-width">
                            <label className="input-label">Address</label>
                            <input className="input-field" placeholder="City, State" value={form.address} onChange={e => field('address', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Status</label>
                            <select className="input-field" value={form.status} onChange={e => field('status', e.target.value)}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Graduated">Graduated</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? <><div className="loading-spinner" style={{ width: 16, height: 16 }} /> Saving...</> : <><MdSave /> Save Student</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StudentDetail({ student, onClose }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-header">
                    <h2>👤 Student Profile</h2>
                    <button className="btn btn-icon" onClick={onClose}><MdClose /></button>
                </div>
                <div className="modal-body">
                    <div className="student-profile-card">
                        <div className="student-avatar-lg" style={{ background: `hsl(${student.name.charCodeAt(0) * 10}, 70%, 50%)` }}>
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800 }}>{student.name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{student.rollNo}</p>
                            <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{student.status}</span>
                        </div>
                    </div>
                    <div className="student-detail-grid">
                        {[
                            { icon: <MdSchool />, label: 'Department', value: student.dept },
                            { icon: <MdSchool />, label: 'Year', value: student.year },
                            { icon: <MdEmail />, label: 'Email', value: student.email },
                            { icon: <MdPhone />, label: 'Phone', value: student.phone },
                            { icon: <MdLocationOn />, label: 'Address', value: student.address },
                            { icon: '🩸', label: 'Blood Group', value: student.bloodGroup },
                            { icon: '📅', label: 'Date of Birth', value: student.dob },
                            { icon: '⭐', label: 'GPA', value: student.gpa ? `${student.gpa} / 10` : 'N/A' },
                        ].map(d => (
                            <div key={d.label} className="detail-row">
                                <span className="detail-icon">{d.icon}</span>
                                <div>
                                    <div className="detail-label">{d.label}</div>
                                    <div className="detail-value">{d.value || '—'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Students() {
    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [modal, setModal] = useState(null); // 'add' | 'edit' | 'view'
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Fetch students from backend on mount
    useEffect(() => {
        studentApi.getAll()
            .then(data => { setStudents(data); setLoading(false); })
            .catch(() => { setStudents([]); setLoading(false); });
    }, []);

    // Filter students
    useEffect(() => {
        let list = students;
        if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
        if (deptFilter) list = list.filter(s => s.dept === deptFilter);
        if (yearFilter) list = list.filter(s => s.year === yearFilter);
        setFiltered(list);
    }, [students, search, deptFilter, yearFilter]);

    const handleSave = async (student) => {
        try {
            if (student.id && students.find(s => s.id === student.id)) {
                const updated = await studentApi.update(student.id, student);
                setStudents(prev => prev.map(s => s.id === student.id ? updated : s));
            } else {
                const created = await studentApi.create(student);
                setStudents(prev => [...prev, created]);
            }
        } catch (err) {
            console.error('Save error:', err);
            // Fallback to local state
            if (student.id && students.find(s => s.id === student.id)) {
                setStudents(prev => prev.map(s => s.id === student.id ? student : s));
            } else {
                setStudents(prev => [...prev, { ...student, id: Date.now().toString() }]);
            }
        }
    };

    const handleDelete = (id) => {
        setStudents(prev => prev.filter(s => s.id !== id));
        setDeleteConfirm(null);
        studentApi.delete(id).catch(() => null);
    };

    const getAvatarColor = name => `hsl(${name.charCodeAt(0) * 10}, 65%, 50%)`;

    return (
        <div className="students-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Students</h1>
                    <p className="page-subtitle">{filtered.length} of {students.length} students</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('add'); }}>
                    <MdAdd /> Add Student
                </button>
            </div>

            {/* Filters */}
            <div className="filter-bar glass-card">
                <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
                    <MdSearch className="search-icon" />
                    <input
                        className="input-field"
                        style={{ paddingLeft: 40 }}
                        placeholder="Search by name, roll number, email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select className="input-field" style={{ width: 180 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="input-field" style={{ width: 140 }} value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                    <option value="">All Years</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setDeptFilter(''); setYearFilter(''); }}>
                    <MdRefresh /> Reset
                </button>
            </div>

            {/* Table */}
            <div className="glass-card table-card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Roll No.</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Contact</th>
                                <th>GPA</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <MdPeople style={{ fontSize: 48 }} />
                                            <h3>No Students Found</h3>
                                            <p>Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="avatar" style={{ background: getAvatarColor(s.name) }}>
                                                {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{s.rollNo}</td>
                                    <td>{s.dept}</td>
                                    <td>{s.year}</td>
                                    <td>
                                        <div style={{ fontSize: 12 }}>
                                            <div>{s.phone}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontWeight: 700,
                                            color: s.gpa >= 9 ? '#10b981' : s.gpa >= 7.5 ? '#f59e0b' : '#f43f5e'
                                        }}>{s.gpa || '—'}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${s.status === 'Active' ? 'badge-success' : s.status === 'Graduated' ? 'badge-info' : 'badge-warning'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-icon btn-sm" title="View" onClick={() => { setSelected(s); setModal('view'); }}>
                                                <MdVisibility />
                                            </button>
                                            <button className="btn btn-icon btn-sm" title="Edit" style={{ color: '#f59e0b' }} onClick={() => { setSelected(s); setModal('edit'); }}>
                                                <MdEdit />
                                            </button>
                                            <button className="btn btn-icon btn-sm" title="Delete" style={{ color: '#f43f5e' }} onClick={() => setDeleteConfirm(s.id)}>
                                                <MdDelete />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {(modal === 'add' || modal === 'edit') && (
                <StudentModal
                    student={modal === 'edit' ? selected : null}
                    onClose={() => { setModal(null); setSelected(null); }}
                    onSave={handleSave}
                />
            )}
            {modal === 'view' && selected && (
                <StudentDetail student={selected} onClose={() => { setModal(null); setSelected(null); }} />
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🗑️ Delete Student</h2>
                            <button className="btn btn-icon" onClick={() => setDeleteConfirm(null)}><MdClose /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete this student? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                                <MdDelete /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
