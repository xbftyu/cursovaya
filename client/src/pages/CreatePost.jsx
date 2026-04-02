import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreatePost = () => {
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [{ loading, error }, setStatus] = useState({ loading: false, error: null });
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            return setStatus({ loading: false, error: 'Please fill all fields' });
        }
        setStatus({ loading: true, error: null });
        try {
            await api.post('/posts', formData);
            navigate('/');
        } catch (err) {
            setStatus({ loading: false, error: err.response?.data?.message || 'Failed to create post' });
        }
    };

    return (
        <div className="container">
            <div className="form-container" style={{ maxWidth: '600px' }}>
                <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Create Discussion</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            name="content"
                            rows="6"
                            value={formData.content}
                            onChange={onChange}
                        ></textarea>
                    </div>
                    {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
                    <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Posting...' : 'Create Post'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
