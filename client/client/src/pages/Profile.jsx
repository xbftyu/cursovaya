import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import { UserPlus, ChevronRight, Settings, Camera, Sun, Moon } from 'lucide-react';
import { getAvatarUrl, SERVER_BASE } from '../utils/avatarHelper';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [suggestedFriends, setSuggestedFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '', bio: '', avatar: '' });
    const [saving, setSaving] = useState(false);
    const { addToast, ToastContainer } = useToast();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch profile (posts + user data)
                const res = await api.get('/users/profile');
                setPosts(res.data.posts || []);
                
                // Fetch suggested friends
                const suggestedRes = await api.get('/users/suggested-friends');
                setSuggestedFriends(suggestedRes.data || []);
                
                setLoading(false);
            } catch (err) {
                addToast(err.response?.data?.message || 'Error fetching profile data', "error");
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
            setEditForm({ username: user.username, email: user.email, bio: user.bio || '', avatar: user.avatar || '' });
        } else {
            setLoading(false);
        }
    }, [user, addToast]);

    const handleAddFriend = async (targetId) => {
        try {
            await api.post(`/users/friend-request/${targetId}`, { action: 'send' });
            addToast("Friend request sent!", "success");
            // Remove user from suggestions
            setSuggestedFriends(prev => prev.filter(u => u._id !== targetId));
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to send request", "error");
        }
    };

    const handleFriendRequest = async (targetId, action) => {
        try {
            await api.post(`/users/friend-request/${targetId}`, { action });
            addToast(`Friend request ${action}ed`, "success");
            // Refresh page data is simplest, but here we can just reload the window for now, 
            // since mutating nested context user requires more setup
            window.location.reload();
        } catch (err) {
            addToast(err.response?.data?.message || "Action failed", "error");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.post('/upload', formData);
            // data.image is like "/uploads/image-xxx.jpg"
            const fullUrl = data.image.startsWith('http') ? data.image : `${SERVER_BASE}${data.image}`;
            setEditForm(prev => ({ ...prev, avatar: fullUrl }));
            addToast('Photo uploaded!', 'success');
        } catch (error) {
            addToast('Error uploading image', 'error');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/users/profile', editForm);
            // Update context + localStorage without page reload
            updateUser({
                username: data.username,
                email: data.email,
                bio: data.bio,
                avatar: data.avatar,
            });
            addToast('Profile updated!', 'success');
            setIsEditing(false);
        } catch (error) {
            addToast(error.response?.data?.message || 'Error updating profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
                <EmptyState
                    title="Access Denied"
                    message="Please login to view your profile."
                    actionText="Login"
                    actionLink="/login"
                />
            </div>
        );
    }

    if (loading) return <Loader />;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', margin: '40px 0' }}>
                
                {/* Left Section: User Posts */}
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Your <span style={{ color: 'var(--accent-primary)' }}>Discussions</span></h2>
                        <span className="badge" style={{ padding: '0.5rem 1rem' }}>{posts.length} Posts</span>
                   </div>

                   {posts.length === 0 ? (
                       <EmptyState
                           title="No Posts Yet"
                           message="You haven't participated in any discussions."
                           actionText="Create Post"
                           actionLink="/create-post"
                       />
                   ) : (
                       <div className="posts-grid">
                           {posts.map(post => <PostCard key={post._id} post={post} />)}
                       </div>
                   )}
                </div>

                {/* Right Section: Sidebar & Discovery */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    
                    {/* User Profile Info Card */}
                    <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                        {isEditing ? (
                            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                                <h3 style={{ marginBottom: '4px', textAlign: 'center' }}>Edit Profile</h3>
                                
                                {/* Avatar upload */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <img 
                                            src={editForm.avatar || getAvatarUrl(null, user.username)} 
                                            alt="avatar preview"
                                            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', display: 'block' }}
                                        />
                                        <label 
                                            htmlFor="avatar-upload" 
                                            title="Upload photo"
                                            style={{ 
                                                position: 'absolute', bottom: 0, right: 0, 
                                                background: 'var(--accent-primary)', 
                                                borderRadius: '50%', 
                                                width: '28px', height: '28px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', color: 'white',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                                            }}
                                        >
                                            <Camera size={14} />
                                        </label>
                                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                    </div>
                                </div>

                                <div>
                                    <label>Username</label>
                                    <input type="text" className="form-control" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} required />
                                </div>
                                <div>
                                    <label>Email</label>
                                    <input type="email" className="form-control" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
                                </div>
                                <div>
                                    <label>Bio</label>
                                    <textarea className="form-control" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows="3" placeholder="Tell us about yourself..." />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                                    <img
                                        src={getAvatarUrl(user.avatar, user.username)}
                                        alt="avatar"
                                        style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-secondary)', boxShadow: 'var(--shadow-glow)' }}
                                    />
                                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', backgroundColor: 'var(--success)', width: '18px', height: '18px', borderRadius: '50%', border: '3px solid var(--bg-secondary)' }} />
                                </div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{user.username}</h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>{user.email}</p>
                                {user.bio && <p style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>"{user.bio}"</p>}
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '12px', borderRadius: 'var(--border-radius-sm)' }}>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{posts.length}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Posts</div>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '12px', borderRadius: 'var(--border-radius-sm)' }}>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{user.friends?.length || 0}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Friends</div>
                                    </div>
                                </div>

                                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setIsEditing(true)}>
                                    <Settings size={16} /> Edit Profile
                                </button>
                            </>
                        )}
                    </div>

                    {/* Theme Switcher */}
                    <div className="card" style={{ padding: '22px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {theme === 'light' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} style={{ color: 'var(--accent-primary)' }} />}
                            Appearance
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {[
                                { key: 'dark',  label: 'Dark',  icon: <Moon size={15}/> },
                                { key: 'light', label: 'Light', icon: <Sun size={15}/> },
                            ].map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setTheme(t.key)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                                        padding: '10px 6px', borderRadius: '10px', border: '2px solid',
                                        borderColor: theme === t.key ? 'var(--accent-primary)' : 'var(--border-color)',
                                        background: theme === t.key ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                                        color: theme === t.key ? 'var(--accent-primary)' : 'var(--text-muted)',
                                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t.icon} {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Friend Requests */}
                    {user.friendRequests && user.friendRequests.length > 0 && (
                        <div className="card" style={{ padding: '25px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Friend Requests
                                </h3>
                                <span className="badge">{user.friendRequests.length}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {user.friendRequests.map(request => (
                                    <div key={request._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img 
                                                src={getAvatarUrl(request.avatar, request.username)}
                                                alt="avatar"
                                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                            />
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{request.username}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button 
                                                onClick={() => handleFriendRequest(request._id, 'accept')}
                                                style={{ backgroundColor: 'var(--success)', border: 'none', color: 'white', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => handleFriendRequest(request._id, 'decline')}
                                                style={{ backgroundColor: 'var(--danger)', border: 'none', color: 'white', cursor: 'pointer', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Discovery / Suggested Friends */}
                    <div className="card" style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserPlus size={18} style={{ color: 'var(--accent-primary)' }} /> Find Friends
                            </h3>
                            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                        </div>

                        {suggestedFriends.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No new suggestions</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {suggestedFriends.map(suggested => (
                                    <div key={suggested._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img 
                                                src={getAvatarUrl(suggested.avatar, suggested.username)}
                                                alt="avatar"
                                                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                            />
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{suggested.username}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suggested</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAddFriend(suggested._id)}
                                            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <ToastContainer />
        </div>
    );
};

export default Profile;
