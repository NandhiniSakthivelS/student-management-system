import { useState, useEffect } from 'react';
import { MdAdd, MdClose, MdDelete, MdAnnouncement } from 'react-icons/md';
import './Notices.css';
import { noticeApi } from '../api';

const CATEGORIES = ['General', 'Academic', 'Exams', 'Events', 'Holiday', 'Urgent'];

const INIT_NOTICES = [];

const PRIORITY_CONFIG = {
    High: { color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' },
    Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    Low: { color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
};

const CAT_ICONS = { General: '📋', Academic: '🎓', Exams: '📝', Events: '🎉', Holiday: '🎊', Urgent: '🚨' };

export default function Notices() {
    const [notices, setNotices] = useState([]);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', category: 'General', priority: 'Medium', author: 'Admin' });
    const [catFilter, setCatFilter] = useState('');
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // Fetch notices from backend on mount
    useEffect(() => {
        noticeApi.getAll()
            .then(data => setNotices(data))
            .catch(() => setNotices([]));
    }, []);

    const filtered = catFilter ? notices.filter(n => n.category === catFilter) : notices;

    const handleAdd = async () => {
        if (!form.title || !form.content) return;
        const newNotice = { ...form, date: new Date().toISOString().split('T')[0] };
        try {
            const created = await noticeApi.create(newNotice);
            setNotices(p => [created, ...p]);
        } catch (err) {
            console.error('Notice save error:', err);
            setNotices(p => [{ ...newNotice, id: `n${Date.now()}` }, ...p]);
        }
        setForm({ title: '', content: '', category: 'General', priority: 'Medium', author: 'Admin' });
        setModal(false);
    };

    return (
        <div className="notices-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Notices & Announcements</h1>
                    <p className="page-subtitle">{filtered.length} notices</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal(true)}><MdAdd /> Post Notice</button>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <button className={`btn btn-sm ${catFilter === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCatFilter('')}>All</button>
                {CATEGORIES.map(c => (
                    <button key={c} className={`btn btn-sm ${catFilter === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCatFilter(c === catFilter ? '' : c)}>
                        {CAT_ICONS[c]} {c}
                    </button>
                ))}
            </div>

            {/* Notices */}
            <div className="notices-grid">
                {filtered.map(n => {
                    const pc = PRIORITY_CONFIG[n.priority];
                    return (
                        <div key={n.id} className="notice-card glass-card" style={{ borderLeft: `3px solid ${pc.color}` }}>
                            <div className="notice-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="notice-cat-icon">{CAT_ICONS[n.category]}</span>
                                    <span className="badge badge-primary">{n.category}</span>
                                    <span className="badge" style={{ background: pc.bg, color: pc.color }}>{n.priority}</span>
                                </div>
                                <button className="btn btn-icon btn-sm" style={{ color: '#f43f5e' }} onClick={() => {
                                    noticeApi.delete(n.id).catch(err => console.error(err));
                                    setNotices(p => p.filter(x => x.id !== n.id));
                                }}><MdDelete /></button>
                            </div>
                            <h3 className="notice-title">{n.title}</h3>
                            <p className="notice-content">{n.content}</p>
                            <div className="notice-footer">
                                <span>📅 {n.date}</span>
                                <span>✍️ {n.author}</span>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="empty-state" style={{ gridColumn: 'span 2' }}><MdAnnouncement style={{ fontSize: 48 }} /><h3>No notices found</h3></div>
                )}
            </div>

            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box" style={{ maxWidth: 560 }}>
                        <div className="modal-header"><h2>📢 Post Notice</h2><button className="btn btn-icon" onClick={() => setModal(false)}><MdClose /></button></div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div className="input-group"><label className="input-label">Title</label><input className="input-field" placeholder="Notice title..." value={form.title} onChange={e => set('title', e.target.value)} /></div>
                                <div className="input-group"><label className="input-label">Content</label><textarea className="input-field" rows={4} style={{ resize: 'vertical' }} placeholder="Write your notice here..." value={form.content} onChange={e => set('content', e.target.value)} /></div>
                                <div className="form-grid">
                                    <div className="input-group"><label className="input-label">Category</label>
                                        <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group"><label className="input-label">Priority</label>
                                        <select className="input-field" value={form.priority} onChange={e => set('priority', e.target.value)}>
                                            {['High', 'Medium', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group full-width"><label className="input-label">Author / Department</label><input className="input-field" placeholder="Administration" value={form.author} onChange={e => set('author', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAdd}>📢 Publish Notice</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
