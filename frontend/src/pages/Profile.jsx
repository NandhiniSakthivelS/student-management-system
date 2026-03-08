import { useState } from 'react';
import { MdPerson, MdEmail, MdBadge, MdPhone, MdLocationOn, MdCameraAlt, MdSave } from 'react-icons/md';
import './Profile.css';

export default function Profile() {
    const role = localStorage.getItem('sms_user_role') || 'Admin';
    const username = localStorage.getItem('sms_username') || 'Admin User';

    const [profile, setProfile] = useState({
        name: username,
        email: localStorage.getItem('sms_email') || 'admin@vit.edu.in',
        phone: localStorage.getItem('sms_phone') || '+91 98765 43210',
        location: 'Tamil Nadu, India',
        bio: 'Dedicated administrator managing institutional growth and student excellence.',
        joinDate: 'March 2024'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('sms_username', profile.name);
        localStorage.setItem('sms_email', profile.email);
        localStorage.setItem('sms_phone', profile.phone);
        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your personal information and preferences</p>
                </div>
                <button className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`} onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                    {isEditing ? <MdSave /> : <MdPerson />}
                    {isEditing ? (saved ? 'Saved!' : 'Save Profile') : 'Edit Profile'}
                </button>
            </div>

            <div className="profile-grid">
                {/* Profile Header Card */}
                <div className="profile-card profile-main-card glass-card h-full">
                    <div className="profile-banner" />
                    <div className="profile-avatar-sec">
                        <div className="profile-avatar-wrap">
                            <div className="profile-avatar-large">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            {isEditing && (
                                <button className="avatar-edit-btn">
                                    <MdCameraAlt />
                                </button>
                            )}
                        </div>
                        <div className="profile-info-basic">
                            <h2 className="profile-name">{profile.name}</h2>
                            <p className="profile-role-tag">{role}</p>
                            <p className="profile-join">Member since {profile.joinDate}</p>
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="profile-card glass-card">
                    <h3 className="section-title">Personal Details</h3>
                    <div className="details-list">
                        <div className="detail-item">
                            <div className="detail-icon"><MdBadge /></div>
                            <div className="detail-content">
                                <label>Full Name</label>
                                {isEditing ? (
                                    <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="edit-input" />
                                ) : (
                                    <p>{profile.name}</p>
                                )}
                            </div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-icon"><MdEmail /></div>
                            <div className="detail-content">
                                <label>Email Address</label>
                                {isEditing ? (
                                    <input value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="edit-input" />
                                ) : (
                                    <p>{profile.email}</p>
                                )}
                            </div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-icon"><MdPhone /></div>
                            <div className="detail-content">
                                <label>Phone Number</label>
                                {isEditing ? (
                                    <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="edit-input" />
                                ) : (
                                    <p>{profile.phone}</p>
                                )}
                            </div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-icon"><MdLocationOn /></div>
                            <div className="detail-content">
                                <label>Location</label>
                                {isEditing ? (
                                    <input value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} className="edit-input" />
                                ) : (
                                    <p>{profile.location}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio Card */}
                <div className="profile-card glass-card col-span-2">
                    <h3 className="section-title">About Me</h3>
                    {isEditing ? (
                        <textarea
                            className="edit-textarea"
                            value={profile.bio}
                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                        />
                    ) : (
                        <p className="profile-bio">{profile.bio}</p>
                    )}
                </div>

                {/* Statistics/Activity Card */}
                <div className="profile-card glass-card">
                    <h3 className="section-title">Activity Overview</h3>
                    <div className="activity-stats">
                        <div className="stat-box">
                            <span className="stat-val">12</span>
                            <span className="stat-lab">Notices Issued</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-val">450+</span>
                            <span className="stat-lab">Students Managed</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-val">Active</span>
                            <span className="stat-lab">Status</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
