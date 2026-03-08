import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    MdDashboard, MdPeople, MdBook, MdCheckCircle,
    MdGrade, MdPayment, MdNotifications, MdSettings,
    MdSearch, MdMenuOpen, MdMenu, MdLogout, MdBarChart,
    MdChevronRight, MdClose, MdAnnouncement, MdPerson,
} from 'react-icons/md';
import './Layout.css';

const NAV_CONFIG = {
    Admin: [
        { section: 'OVERVIEW', items: [{ to: '/', icon: <MdDashboard />, label: 'Dashboard' }, { to: '/students', icon: <MdPeople />, label: 'Students' }] },
        { section: 'ACADEMIC', items: [{ to: '/courses', icon: <MdBook />, label: 'Courses' }, { to: '/attendance', icon: <MdCheckCircle />, label: 'Attendance' }, { to: '/grades', icon: <MdGrade />, label: 'Grades' }] },
        { section: 'ADMIN', items: [{ to: '/fees', icon: <MdPayment />, label: 'Fee Management' }, { to: '/notices', icon: <MdAnnouncement />, label: 'Notices' }, { to: '/reports', icon: <MdBarChart />, label: 'Reports' }] },
        { section: 'SYSTEM', items: [{ to: '/profile', icon: <MdPerson />, label: 'My Profile' }, { to: '/settings', icon: <MdSettings />, label: 'Settings' }] },
    ],
    Faculty: [
        { section: 'OVERVIEW', items: [{ to: '/', icon: <MdDashboard />, label: 'Dashboard' }, { to: '/students', icon: <MdPeople />, label: 'Students List' }] },
        { section: 'ACADEMIC', items: [{ to: '/courses', icon: <MdBook />, label: 'My Courses' }, { to: '/attendance', icon: <MdCheckCircle />, label: 'Attendance' }, { to: '/grades', icon: <MdGrade />, label: 'Grades' }] },
        { section: 'GENERAL', items: [{ to: '/profile', icon: <MdPerson />, label: 'My Profile' }, { to: '/notices', icon: <MdAnnouncement />, label: 'Notices' }] },
    ],
    Student: [
        { section: 'OVERVIEW', items: [{ to: '/', icon: <MdDashboard />, label: 'Student Dashboard' }] },
        { section: 'MY ACADEMICS', items: [{ to: '/courses', icon: <MdBook />, label: 'My Courses' }, { to: '/attendance', icon: <MdCheckCircle />, label: 'My Attendance' }, { to: '/grades', icon: <MdGrade />, label: 'My Grades' }] },
        { section: 'GENERAL', items: [{ to: '/profile', icon: <MdPerson />, label: 'My Profile' }, { to: '/fees', icon: <MdPayment />, label: 'My Fees' }, { to: '/notices', icon: <MdAnnouncement />, label: 'Notices' }] },
    ]
};

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    const [notifications] = useState([
        { id: 1, title: 'New Student Registered', time: '2 mins ago', type: 'info', read: false },
        { id: 2, title: 'Fee Payment Received', time: '15 mins ago', type: 'success', read: false },
        { id: 3, title: 'System Maintenance', time: '1 hour ago', type: 'warning', read: true },
        { id: 4, title: 'Exam Schedule Updated', time: '3 hours ago', type: 'info', read: true },
    ]);

    const handleLogout = () => {
        localStorage.removeItem('sms_token');
        localStorage.removeItem('sms_user_role');
        localStorage.removeItem('sms_username');
        navigate('/login');
    };

    const role = localStorage.getItem('sms_user_role') || 'Admin';
    const username = localStorage.getItem('sms_username') || 'Admin User';
    const navItems = NAV_CONFIG[role] || NAV_CONFIG['Admin'];

    return (
        <div className="layout-root">
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Brand */}
                <NavLink to="/" className="sidebar-brand" onClick={() => setMobileOpen(false)}>
                    <div className="sidebar-brand-icon">🎓</div>
                    <div className="sidebar-brand-text">
                        <h1>SMS Portal</h1>
                        <span>Student Management</span>
                    </div>
                </NavLink>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map(group => (
                        <div key={group.section}>
                            <div className="nav-section-label">{group.section}</div>
                            {group.items.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => setMobileOpen(false)}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-text">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user" onClick={handleLogout}>
                        <div className="avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>{username.charAt(0).toUpperCase()}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{username}</div>
                            <div className="sidebar-user-role">{role}</div>
                        </div>
                    </div>
                    <div className="nav-item" style={{ cursor: 'pointer', marginTop: 4 }} onClick={handleLogout}>
                        <span className="nav-icon"><MdLogout /></span>
                        <span className="nav-text">Sign Out</span>
                    </div>
                </div>
            </aside>

            {/* Collapse Toggle */}
            <button
                className="sidebar-toggle"
                onClick={() => setCollapsed(c => !c)}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? <MdChevronRight /> : <MdMenuOpen />}
            </button>

            {/* Main */}
            <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                {/* Topbar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            className="topbar-icon-btn mobile-menu-btn"
                            onClick={() => setMobileOpen(o => !o)}
                        >
                            {mobileOpen ? <MdClose /> : <MdMenu />}
                        </button>
                        <div className="topbar-search">
                            <MdSearch className="topbar-search-icon" />
                            <input placeholder="Search students, courses..." />
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="notification-wrapper">
                            <button
                                className={`topbar-icon-btn ${showNotifications ? 'active' : ''}`}
                                title="Notifications"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <MdNotifications />
                                {notifications.some(n => !n.read) && (
                                    <span className="notification-badge" />
                                )}
                            </button>

                            {showNotifications && (
                                <div className="notification-dropdown glass-card">
                                    <div className="notif-header">
                                        <h3>Notifications</h3>
                                        <button className="notif-mark-read">Mark all as read</button>
                                    </div>
                                    <div className="notif-list">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                                                <div className={`notif-type-icon ${n.type}`} />
                                                <div className="notif-content">
                                                    <div className="notif-title">{n.title}</div>
                                                    <div className="notif-time">{n.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="notif-footer">
                                        <button onClick={() => navigate('/notices')}>View all notices</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', cursor: 'pointer' }} onClick={() => navigate('/settings')}>{username.charAt(0).toUpperCase()}</div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
