import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/posts');
                setPosts(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching posts');
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>Latest Discussions</h1>
            {error && <div className="error-msg">{error}</div>}
            {posts.length === 0 && !error ? (
                <p>No posts found. Start the discussion!</p>
            ) : (
                posts.map(post => <PostCard key={post._id} post={post} />)
            )}
        </div>
    );
};

export default Home;
