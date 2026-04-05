import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const AdminPanel = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast, ToastContainer } = useToast();
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ username: '', email: '', role: '', bio: '', avatar: '' });

    const fetchAdminData = useCallback(async () => {
        try {
            setErrorMsg(null);
            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data || []);
            
            const logsRes = await api.get('/admin/logs');
            setLogs(logsRes.data || []);
        } catch (error) {
            console.error('Admin API error:', error);
            setErrorMsg(error.response?.data?.message || 'Error fetching admin data');
            addToast("Error fetching admin data", "error");
        } finally {
            setDataLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
            navigate('/');
            return;
        }

        fetchAdminData();
    }, [user, navigate, fetchAdminData]);

    const toggleBlock = async (id) => {
        try {
            await api.put(`/admin/users/${id}/block`);
            addToast("User status updated", "success");
            fetchAdminData(); // refresh list
        } catch (error) {
            addToast(error.response?.data?.message || "Error updating user", "error");
        }
    };

    const handleGeneratePopular = async () => {
        try {
            await api.post('/admin/generate-popular');
            addToast("Mock posts generated successfully!", "success");
            fetchAdminData();
        } catch (error) {
            addToast("Failed to generate posts", "error");
        }
    };

    const handleEditClick = (u) => {
        setEditingUser(u._id);
        setEditForm({ username: u.username, email: u.email, role: u.role, bio: u.bio || '', avatar: u.avatar || '' });
    };

    const handleEditSubmit = async (e, userId) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${userId}`, editForm);
            addToast("User updated successfully", "success");
            setEditingUser(null);
            fetchAdminData();
        } catch (error) {
            addToast(error.response?.data?.message || "Error updating user", "error");
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Audit & Admin Dashboard</h1>
                <button className="btn btn-primary" onClick={handleGeneratePopular}>Generate Popular Posts</button>
            </div>

            {dataLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading admin data...</div>
            ) : errorMsg ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                    <h3>Error Loading Admin Panel</h3>
                    <p>{errorMsg}</p>
                    <button className="btn btn-secondary mt-2" onClick={fetchAdminData}>Retry</button>
                </div>
            ) : (
                <>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>Registered Users</h2>
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '0.8rem' }}>Username</th>
                                <th style={{ padding: '0.8rem' }}>Email</th>
                                <th style={{ padding: '0.8rem' }}>Role</th>
                                <th style={{ padding: '0.8rem' }}>Status</th>
                                <th style={{ padding: '0.8rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(users) ? users : []).map((u) => (
                                <React.Fragment key={u._id}>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
                                    <td style={{ padding: '0.8rem' }}>{u.username}</td>
                                    <td style={{ padding: '0.8rem' }}>{u.email}</td>
                                    <td style={{ padding: '0.8rem' }}>
                                        <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'moderator' ? 'bg-primary' : ''}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem' }}>
                                        <span style={{ color: u.isBlocked ? 'var(--danger)' : 'var(--success)' }}>
                                            {u.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem' }}>
                                        {u.role !== 'admin' && (
                                            <button 
                                                className={`btn btn-${u.isBlocked ? 'primary' : 'danger'}`} 
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginRight: '5px' }}
                                                onClick={() => toggleBlock(u._id)}
                                            >
                                                {u.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        )}
                                        {!(user.role === 'moderator' && u.role === 'admin') && (
                                            <button 
                                                className="btn btn-secondary" 
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                                onClick={() => editingUser === u._id ? setEditingUser(null) : handleEditClick(u)}
                                            >
                                                {editingUser === u._id ? 'Cancel' : 'Edit'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                {editingUser === u._id && (
                                    <tr style={{ background: 'var(--bg-secondary)' }}>
                                        <td colSpan="5" style={{ padding: '1.5rem' }}>
                                            <form onSubmit={(e) => handleEditSubmit(e, u._id)} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1, minWidth: '200px' }}>
                                                    <label>Username</label>
                                                    <input className="form-control" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: '200px' }}>
                                                    <label>Email</label>
                                                    <input className="form-control" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: '150px' }}>
                                                    <label>Role</label>
                                                    <select className="form-control" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} disabled={user.role === 'moderator'}>
                                                        <option value="user">user</option>
                                                        <option value="moderator">moderator</option>
                                                        <option value="admin">admin</option>
                                                    </select>
                                                </div>
                                                <div style={{ flex: '100%', minWidth: '100%' }}>
                                                    <label>Avatar URL</label>
                                                    <input className="form-control" value={editForm.avatar} onChange={e => setEditForm({...editForm, avatar: e.target.value})} />
                                                </div>
                                                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button type="submit" className="btn btn-success">Save Changes</button>
                                                </div>
                                            </form>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <h2>Admin Logs</h2>
                <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
                    {(Array.isArray(logs) ? logs : []).map((log) => (
                        <li key={log._id} style={{ padding: '0.8rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</span>
                            <span style={{ fontWeight: 'bold' }}>{log.adminId?.username}:</span>
                            <span style={{ color: 'var(--accent-primary)' }}>{log.action}</span>
                            <span>{log.details}</span>
                        </li>
                    ))}
                </ul>
            </div>
            </>
            )}
            
            <ToastContainer />
        </div>
    );
};

export default AdminPanel;
