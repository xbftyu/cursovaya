import React, { useState, useEffect } from 'react';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import api from '../services/api';

const Popular = () => {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { Search } = require('lucide-react');

    useEffect(() => {
        const fetchPopularPosts = async () => {
            try {
                const { data } = await api.get('/posts');
                // Data has { posts: [], pages: ... }
                // Sort by views
                let allPosts = data.posts || [];
                allPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
                
                // Keep top 10
                setPosts(allPosts.slice(0, 10));
            } catch (err) {
                console.error("Failed to fetch popular posts", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularPosts();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--accent-primary)' }}>Trending</span> Discussions
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: '10px 0 20px 0' }}>The most viewed and liked threads across the community</p>
                
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search popular discussions..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', padding: '12px 16px 12px 48px', 
                            borderRadius: '999px', border: '1px solid var(--border-color)', 
                            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                            outline: 'none', fontSize: '1rem'
                         }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="posts-grid">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : posts.length === 0 ? (
                <EmptyState
                    title="Nothing Trending Yet"
                    message="As the community grows, the most liked and viewed posts will appear here."
                    actionText="Go to Forum"
                    actionLink="/"
                />
            ) : (
                <div className="posts-grid">
                    {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                    {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && posts.length > 0 && (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>No popular discussions found for "{searchTerm}"</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Popular;
