import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getAvatarUrl } from '../utils/avatarHelper';

const Comment = ({ comment, onCommentUpdate, onCommentDelete }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);

    const isOwnerOrAdmin = user && (user._id === comment.author?._id || user.role === 'admin');

    const handleSave = async () => {
        try {
            const { data } = await api.put(`/comments/${comment._id}`, { text: editText });
            setIsEditing(false);
            if (onCommentUpdate) onCommentUpdate(data);
        } catch (error) {
            alert('Failed to update comment');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this comment?')) {
            try {
                await api.delete(`/comments/${comment._id}`);
                if (onCommentDelete) onCommentDelete(comment._id);
            } catch (error) {
                alert('Failed to delete comment');
            }
        }
    };

    return (
        <div className="comment" style={{ marginBottom: '1.5rem', padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px' }}>
            <div className="comment-avatar">
                <img
                    src={getAvatarUrl(comment.author?.avatar, comment.author?.username)}
                    alt="avatar"
                    className="avatar-lg"
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }}
                />
            </div>
            <div className="comment-body" style={{ flex: 1 }}>
                <div className="comment-meta" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <strong style={{ fontWeight: 600 }}>{comment.author?.username || 'User'}</strong> 
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '10px' }}>
                            {new Date(comment.createdAt).toLocaleString()}
                        </span>
                    </div>
                    {isOwnerOrAdmin && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.8rem' }}>{isEditing ? 'Cancel' : 'Edit'}</button>
                            <button onClick={handleDelete} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <div style={{ marginTop: '10px' }}>
                        <textarea 
                            value={editText} 
                            onChange={e => setEditText(e.target.value)} 
                            className="form-control" 
                            rows="2"
                        />
                        <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginTop: '10px' }}>Save</button>
                    </div>
                ) : (
                    <p className="comment-text" style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{comment.text}</p>
                )}
            </div>
        </div>
    );
};

export default Comment;
