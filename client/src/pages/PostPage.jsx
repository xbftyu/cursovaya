import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Comment from '../components/Comment';
import Loader from '../components/Loader';

const PostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                setPostData(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching post');
                setLoading(false);
            }
        };
        fetchPostData();
    }, [id]);

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

        setCommentLoading(true);
        try {
            const res = await api.post(`/posts/${id}/comment`, { text: commentText });
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

    if (loading) return <Loader />;
    if (error) return <div className="container error-msg">{error}</div>;
    if (!postData) return null;

    const { post, comments } = postData;
    const isAuthor = user && post.author && user._id === post.author._id;

    return (
        <div className="container">
            <div className="single-post-container">
                <h1 className="post-title" style={{ fontSize: '2rem' }}>{post.title}</h1>
                <p className="post-meta">
                    Posted by {post.author?.username} on {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <div className="post-content mt-2">{post.content}</div>

                {isAuthor && (
                    <div className="post-actions">
                        <button className="btn btn-danger" onClick={handleDelete}>Delete Post</button>
                    </div>
                )}
            </div>

            <div className="comments-section">
                <h3>Comments ({comments.length})</h3>

                {user ? (
                    <form onSubmit={handleCommentSubmit} style={{ marginBottom: '2rem' }}>
                        <div className="form-group">
                            <textarea
                                rows="3"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn" disabled={commentLoading}>
                            {commentLoading ? 'Posting...' : 'Add Comment'}
                        </button>
                    </form>
                ) : (
                    <p style={{ marginBottom: '2rem' }}>Please <a href="/login" style={{ color: 'var(--primary)' }}>login</a> to add a comment.</p>
                )}

                <div className="comments-list">
                    {comments.map(comment => (
                        <Comment key={comment._id} comment={comment} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostPage;
