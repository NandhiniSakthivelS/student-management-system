import { useState, useEffect } from 'react';
import { MdAdd, MdClose, MdSave, MdPayment, MdCheck } from 'react-icons/md';
import './Fees.css';
import { feeApi, studentApi } from '../api';

// Students list will be fetched dynamically
const FEE_TYPES = ['Tuition Fee', 'Hostel Fee', 'Exam Fee', 'Library Fee', 'Sports Fee', 'Lab Fee', 'Transport Fee'];

const INIT_FEES = [];

const STATUS_COLORS = {
    Paid: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
    Partial: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
    Pending: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.3)' },
    Overdue: { color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)' },
};

function FeeModal({ fee, onClose, onSave, studentsList = [] }) {
    const [form, setForm] = useState(fee || { studentName: '', rollNo: '', feeType: '', amount: '', paid: '', dueDate: '', method: 'Online', txn: '' });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const due = Number(form.amount) - Number(form.paid);
    const status = due <= 0 ? 'Paid' : Number(form.paid) === 0 ? (new Date(form.dueDate) < new Date() ? 'Overdue' : 'Pending') : 'Partial';

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: 560 }}>
                <div className="modal-header">
                    <h2>{form.id ? '✏️ Edit Fee Record' : '➕ Record Fee'}</h2>
                    <button className="btn btn-icon" onClick={onClose}><MdClose /></button>
                </div>
                <div className="modal-body">
                    <div className="form-grid">
                        <div className="input-group"><label className="input-label">Student Name</label>
                            <select className="input-field" value={form.studentName} onChange={e => set('studentName', e.target.value)}>
                                <option value="">Select Student</option>
                                {studentsList.map(s => <option key={s.id || s.name} value={s.name}>{s.name} ({s.rollNo})</option>)}
                            </select>
                        </div>
                        <div className="input-group"><label className="input-label">Roll Number</label><input className="input-field" placeholder="CSE2021001" value={form.rollNo} onChange={e => set('rollNo', e.target.value)} /></div>
                        <div className="input-group"><label className="input-label">Fee Type</label>
                            <select className="input-field" value={form.feeType} onChange={e => set('feeType', e.target.value)}>
                                <option value="">Select Type</option>
                                {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="input-group"><label className="input-label">Total Amount (₹)</label><input className="input-field" type="number" placeholder="45000" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
                        <div className="input-group"><label className="input-label">Amount Paid (₹)</label><input className="input-field" type="number" placeholder="45000" value={form.paid} onChange={e => set('paid', e.target.value)} /></div>
                        <div className="input-group"><label className="input-label">Due Date</label><input className="input-field" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} /></div>
                        <div className="input-group"><label className="input-label">Payment Method</label>
                            <select className="input-field" value={form.method} onChange={e => set('method', e.target.value)}>
                                {['Online', 'Cash', 'Bank Transfer', 'Cheque', 'UPI'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="input-group"><label className="input-label">Transaction ID</label><input className="input-field" placeholder="TXN12345" value={form.txn} onChange={e => set('txn', e.target.value)} /></div>
                    </div>
                    {form.amount && (
                        <div className="fee-summary-box">
                            <div className="fee-summary-row"><span>Total Amount</span><span>₹{Number(form.amount).toLocaleString()}</span></div>
                            <div className="fee-summary-row"><span>Amount Paid</span><span style={{ color: '#10b981' }}>₹{Number(form.paid || 0).toLocaleString()}</span></div>
                            <div className="fee-summary-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}><strong>Balance Due</strong><strong style={{ color: due > 0 ? '#f43f5e' : '#10b981' }}>₹{due.toLocaleString()}</strong></div>
                            <div className="fee-summary-row"><span>Status</span><span className="badge" style={{ background: STATUS_COLORS[status].bg, color: STATUS_COLORS[status].color, border: `1px solid ${STATUS_COLORS[status].border}` }}>{status}</span></div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => { onSave({ ...form, due, status, id: form.id || `f${Date.now()}` }); onClose(); }}><MdSave /> Save</button>
                </div>
            </div>
        </div>
    );
}

export default function Fees() {
    const [fees, setFees] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch fees and students from backend on mount
    useEffect(() => {
        feeApi.getAll().then(data => setFees(data)).catch(() => setFees([]));
        studentApi.getAll().then(data => setStudentsList(data)).catch(() => setStudentsList([]));
    }, []);

    const handleSave = async (f) => {
        try {
            if (f.id && fees.find(x => x.id === f.id)) {
                const updated = await feeApi.update(f.id, f);
                setFees(p => p.map(x => x.id === f.id ? updated : x));
            } else {
                const created = await feeApi.create(f);
                setFees(p => [...p, created]);
            }
        } catch (err) {
            console.error('Fee save error:', err);
            if (f.id && fees.find(x => x.id === f.id)) setFees(p => p.map(x => x.id === f.id ? f : x));
            else setFees(p => [...p, { ...f, id: Date.now().toString() }]);
        }
    };

    const filtered = statusFilter ? fees.filter(f => f.status === statusFilter) : fees;
    const totalCollected = fees.reduce((s, f) => s + Number(f.paid), 0);
    const totalPending = fees.reduce((s, f) => s + Number(f.due), 0);
    const overdue = fees.filter(f => f.status === 'Overdue').length;

    return (
        <div className="fees-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Fee Management</h1>
                    <p className="page-subtitle">{fees.length} fee records</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('add'); }}><MdAdd /> Record Payment</button>
            </div>

            {/* Summary Stats */}
            <div className="fee-stats-row">
                {[
                    { label: 'Total Collected', val: `₹${(totalCollected / 100000).toFixed(1)}L`, icon: '💰', color: '#10b981' },
                    { label: 'Pending Amount', val: `₹${(totalPending / 100000).toFixed(1)}L`, icon: '⏳', color: '#f59e0b' },
                    { label: 'Overdue Records', val: overdue, icon: '⚠️', color: '#f43f5e' },
                    { label: 'Total Records', val: fees.length, icon: '📋', color: '#6366f1' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color, fontSize: 24 }}>{s.icon}</div>
                        <div className="stat-value" style={{ backgroundImage: `linear-gradient(135deg,${s.color},#fff8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="filter-bar glass-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
                {['', 'Paid', 'Partial', 'Pending', 'Overdue'].map(s => (
                    <button key={s || 'all'} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(s)}>
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="glass-card">
                <div className="table-container">
                    <table className="data-table">
                        <thead><tr><th>Student</th><th>Fee Type</th><th>Total</th><th>Paid</th><th>Due</th><th>Due Date</th><th>Status</th><th>Method</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(f => {
                                const sc = STATUS_COLORS[f.status];
                                return (
                                    <tr key={f.id}>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{f.studentName}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.rollNo}</div>
                                        </td>
                                        <td>{f.feeType}</td>
                                        <td style={{ fontWeight: 700 }}>₹{Number(f.amount).toLocaleString()}</td>
                                        <td style={{ color: '#10b981', fontWeight: 600 }}>₹{Number(f.paid).toLocaleString()}</td>
                                        <td style={{ color: Number(f.due) > 0 ? '#f43f5e' : 'var(--text-muted)', fontWeight: 600 }}>₹{Number(f.due).toLocaleString()}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{f.dueDate}</td>
                                        <td><span className="badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{f.status}</span></td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.method || '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-icon btn-sm" onClick={() => { setSelected(f); setModal('edit'); }} title="Edit"><MdPayment /></button>
                                                {f.status !== 'Paid' && <button className="btn btn-icon btn-sm" style={{ color: '#10b981' }} onClick={async () => {
                                                    const updatedFee = { ...f, paid: f.amount, due: 0, status: 'Paid', method: 'Online' };
                                                    try {
                                                        const res = await feeApi.update(f.id, updatedFee);
                                                        setFees(p => p.map(x => x.id === f.id ? res : x));
                                                    } catch (err) {
                                                        console.error(err);
                                                        setFees(p => p.map(x => x.id === f.id ? updatedFee : x));
                                                    }
                                                }} title="Mark Paid"><MdCheck /></button>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {(modal === 'add' || modal === 'edit') && <FeeModal fee={modal === 'edit' ? selected : null} onClose={() => setModal(null)} onSave={handleSave} studentsList={studentsList} />}
        </div>
    );
}
