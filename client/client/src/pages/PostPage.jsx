import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Comment from '../components/Comment';
import Loader from '../components/Loader';
import { getAvatarUrl, getImageUrl } from '../utils/avatarHelper';

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const [isEditingPost, setIsEditingPost] = useState(false);
    const [postEditForm, setPostEditForm] = useState({ title: '', content: '', image: '' });

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                // If it's a demo post ID starting with 'demo', mock the response
                if (id.startsWith('demo')) {
                    setPostData({
                        post: {
                            _id: id,
                            title: id === 'demo1' ? 'Welcome to ForumApp' : id.includes('2') ? 'Best programming languages in 2025' : 'How to learn React faster',
                            content: 'This is a mocked post for demonstration purposes. Since no database connection resolved this ID properly, we fallback to showing the layout for testing.',
                            author: { username: 'DemoUser' },
                            createdAt: new Date().toISOString()
                        },
                        comments: [
                            {
                                _id: 'c1',
                                text: 'Awesome post! Glad to be here.',
                                author: { username: 'JohnDoe' },
                                createdAt: new Date().toISOString()
                            }
                        ]
                    });
                    setLoading(false);
                    return;
                }

                const res = await api.get(`/posts/${id}`);
                const commentsRes = await api.get(`/comments/post/${id}`);
                setPostData({ post: res.data, comments: commentsRes.data });
                setPostEditForm({ title: res.data.title, content: res.data.content, image: res.data.image || '' });
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching post');
                setLoading(false);
            }
        };
        fetchPostData();
    }, [id]);

    useEffect(() => {
        let intervalId;
        if (!loading && postData && !id.startsWith('demo')) {
            intervalId = setInterval(async () => {
                try {
                    const commentsRes = await api.get(`/comments/post/${id}`);
                    setPostData(prev => ({ ...prev, comments: commentsRes.data }));
                } catch (e) {}
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [loading, id, postData]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await api.delete(`/posts/${id}`);
                navigate('/');
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting post');
            }
        }
    };

    const handleCommentSubmit = async e => {
        e.preventDefault();
        if (!commentText) return;

        // If demo
        if (id.startsWith('demo')) {
            alert('Cannot submit comment to a demo post');
            return;
        }

        setCommentLoading(true);
        try {
            const res = await api.post(`/comments`, { text: commentText, postId: id });
            setPostData(prev => ({
                ...prev,
                comments: [...prev.comments, res.data]
            }));
            setCommentText('');
            setCommentLoading(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding comment');
            setCommentLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (id.startsWith('demo')) return;

        try {
            const res = await api.put(`/posts/${id}/like`);
            setPostData(prev => ({
                ...prev,
                post: { ...prev.post, likes: res.data.likes }
            }));
        } catch (error) {
            alert('Failed to like post');
        }
    };

    if (loading) return <Loader />;
    if (error) return <div className="container error-msg text-center mt-2">{error}</div>;
    if (!postData) return null;

    const { post, comments } = postData;
    const isOwnerOrAdmin = user && (user._id === post.author?._id || user.role === 'admin');

    const handleSavePost = async () => {
        try {
            const res = await api.put(`/posts/${id}`, postEditForm);
            setPostData(prev => ({ ...prev, post: res.data }));
            setIsEditingPost(false);
        } catch (error) {
            alert('Error updating post');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="single-post-container" style={{ marginBottom: '3rem' }}>
                
                {isEditingPost ? (
                    <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <h2 style={{ marginBottom: '15px' }}>Edit Post</h2>
                        <input className="form-control" style={{ marginBottom: '10px' }} value={postEditForm.title} onChange={e => setPostEditForm({...postEditForm, title: e.target.value})} placeholder="Title" />
                        <textarea className="form-control" style={{ marginBottom: '10px' }} value={postEditForm.content} onChange={e => setPostEditForm({...postEditForm, content: e.target.value})} rows="5" placeholder="Content" />
                        <input className="form-control" style={{ marginBottom: '10px' }} value={postEditForm.image} onChange={e => setPostEditForm({...postEditForm, image: e.target.value})} placeholder="Image URL" />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-primary" onClick={handleSavePost}>Save changes</button>
                            <button className="btn btn-outline" onClick={() => setIsEditingPost(false)}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="post-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-color)' }}>{post.title}</h1>

                        <div className="post-header-meta" style={{ marginBottom: '2rem' }}>
                            <img
                                src={getAvatarUrl(post.author?.avatar, post.author?.username)}
                                alt="author avatar"
                                className="avatar-lg"
                            />
                            <div>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{post.author?.username}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Published on {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {post.image && (
                            <div style={{ width: '100%', marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden' }}>
                                <img src={getImageUrl(post.image, post._id)} alt={post.title} style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }} />
                            </div>
                        )}

                        <div className="post-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', marginBottom: '2.5rem', fontSize: '1.15rem' }}>
                            {post.content}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <button 
                                onClick={handleLike} 
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                    background: 'transparent', border: 'none', 
                                    color: post.likes?.includes(user?._id) ? 'var(--danger)' : 'var(--text-muted)',
                                    cursor: 'pointer', fontSize: '1rem', fontWeight: '500',
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                <Heart size={20} fill={post.likes?.includes(user?._id) ? 'currentColor' : 'none'} />
                                {post.likes?.length || 0} Likes
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>
                                <MessageSquare size={20} />
                                {comments.length} Comments
                            </div>
                        </div>

                        {isOwnerOrAdmin && (
                            <div className="post-actions" style={{ display: 'flex', gap: '15px' }}>
                                <button className="btn btn-secondary" onClick={() => setIsEditingPost(true)}>Edit Post</button>
                                <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={handleDelete}>Delete Post</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="comments-section" style={{ backgroundColor: 'var(--white)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '3rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    Discussion ({comments.length})
                </h3>

                {user ? (
                    <form onSubmit={handleCommentSubmit} style={{ marginBottom: '3rem' }}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <textarea
                                rows="4"
                                placeholder="What are your thoughts?"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                style={{ resize: 'vertical' }}
                            ></textarea>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn" disabled={commentLoading}>
                                {commentLoading ? 'Posting...' : 'Comment'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center" style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', marginBottom: '3rem' }}>
                        <p style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Join the discussion</p>
                        <a href="/login" className="btn btn-outline">Log in to comment</a>
                    </div>
                )}

                <div className="comments-list">
                    {comments.length === 0 ? (
                        <p className="text-center" style={{ color: 'var(--text-light)', padding: '2rem 0' }}>No comments yet. Be the first to share your thoughts!</p>
                    ) : (
                        comments.map(comment => (
                            <Comment key={comment._id} comment={comment} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostPage;
