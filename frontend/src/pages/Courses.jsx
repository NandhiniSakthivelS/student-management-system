import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdBook, MdClose, MdSave, MdSearch } from 'react-icons/md';
import { courseApi } from '../api';

const SAMPLE_COURSES = [];

const EMPTY = { code: '', name: '', dept: '', credits: '', instructor: '', students: '', schedule: '', room: '', type: 'Core' };
const TYPES = ['Core', 'Elective', 'Lab', 'Project'];

function CourseModal({ course, onClose, onSave }) {
    const [form, setForm] = useState(course || EMPTY);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 580 }}>
                <div className="modal-header">
                    <h2>{form.id ? '✏️ Edit Course' : '➕ New Course'}</h2>
                    <button className="btn btn-icon" onClick={onClose}><MdClose /></button>
                </div>
                <div className="modal-body">
                    <div className="form-grid">
                        {[
                            { k: 'code', label: 'Course Code', ph: 'CS101' },
                            { k: 'name', label: 'Course Name', ph: 'Data Structures' },
                            { k: 'dept', label: 'Department', ph: 'B.Tech CSE' },
                            { k: 'credits', label: 'Credits', ph: '4' },
                            { k: 'instructor', label: 'Instructor', ph: 'Dr. Ramesh Kumar' },
                            { k: 'students', label: 'Students Enrolled', ph: '85' },
                            { k: 'schedule', label: 'Schedule', ph: 'Mon/Wed 9-11 AM' },
                            { k: 'room', label: 'Room / Lab', ph: 'Lab-101' },
                        ].map(f => (
                            <div className="input-group" key={f.k}>
                                <label className="input-label">{f.label}</label>
                                <input className="input-field" placeholder={f.ph} value={form[f.k]} onChange={e => set(f.k, e.target.value)} />
                            </div>
                        ))}
                        <div className="input-group">
                            <label className="input-label">Type</label>
                            <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => { onSave({ ...form, id: form.id || Date.now().toString() }); onClose(); }}>
                        <MdSave /> Save Course
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Fetch courses from backend on mount
    useEffect(() => {
        courseApi.getAll()
            .then(data => setCourses(data))
            .catch(() => setCourses([]));
    }, []);

    const filtered = courses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.dept.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = async c => {
        try {
            if (c.id && courses.find(x => x.id === c.id)) {
                const updated = await courseApi.update(c.id, c);
                setCourses(prev => prev.map(x => x.id === c.id ? updated : x));
            } else {
                const created = await courseApi.create(c);
                setCourses(prev => [...prev, created]);
            }
        } catch (err) {
            console.error('Save course error:', err);
            // Fallback for UI responsiveness
            if (c.id && courses.find(x => x.id === c.id)) setCourses(prev => prev.map(x => x.id === c.id ? c : x));
            else setCourses(prev => [...prev, { ...c, id: Date.now().toString() }]);
        }
    };

    return (
        <div className="courses-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Courses</h1>
                    <p className="page-subtitle">{filtered.length} courses available</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('add'); }}>
                    <MdAdd /> Add Course
                </button>
            </div>

            {/* Search */}
            <div className="filter-bar glass-card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                    <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ paddingLeft: 40 }} placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Cards Grid */}
            <div className="courses-grid">
                {filtered.map(c => (
                    <div key={c.id} className="course-card glass-card">
                        <div className="course-header">
                            <div>
                                <span className="course-code">{c.code}</span>
                                <span className={`badge ${c.type === 'Core' ? 'badge-primary' : c.type === 'Elective' ? 'badge-info' : 'badge-warning'}`} style={{ marginLeft: 8 }}>{c.type}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-icon btn-sm" onClick={() => { setSelected(c); setModal('edit'); }}><MdEdit /></button>
                                <button className="btn btn-icon btn-sm" style={{ color: '#f43f5e' }} onClick={() => setDeleteConfirm(c.id)}><MdDelete /></button>
                            </div>
                        </div>
                        <h3 className="course-name">{c.name}</h3>
                        <p className="course-dept">{c.dept}</p>
                        <div className="course-meta">
                            <div className="course-meta-item"><span>👨‍🏫</span> {c.instructor}</div>
                            <div className="course-meta-item"><span>🕐</span> {c.schedule}</div>
                            <div className="course-meta-item"><span>📍</span> {c.room}</div>
                        </div>
                        <div className="course-footer">
                            <div className="course-stat"><span className="course-stat-val">{c.students}</span><span className="course-stat-label">Students</span></div>
                            <div className="course-stat"><span className="course-stat-val">{c.credits}</span><span className="course-stat-label">Credits</span></div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="empty-state" style={{ gridColumn: 'span 3' }}>
                        <MdBook style={{ fontSize: 48 }} />
                        <h3>No courses found</h3>
                    </div>
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <CourseModal course={modal === 'edit' ? selected : null} onClose={() => setModal(null)} onSave={handleSave} />
            )}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Delete Course?</h2><button className="btn btn-icon" onClick={() => setDeleteConfirm(null)}><MdClose /></button></div>
                        <div className="modal-body"><p style={{ color: 'var(--text-secondary)' }}>This will remove the course permanently.</p></div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => {
                                courseApi.delete(deleteConfirm).catch(err => console.error(err));
                                setCourses(p => p.filter(c => c.id !== deleteConfirm));
                                setDeleteConfirm(null);
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
