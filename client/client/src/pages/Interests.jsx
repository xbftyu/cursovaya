import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import { Hash, Sparkles, TrendingUp, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Interests = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { addToast, ToastContainer } = useToast();
    const { t } = useTranslation();


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
                if (data.length > 0) {
                    setSelectedCategory(data[0]);
                }
            } catch (err) {
                addToast("Failed to load categories", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [addToast]);

    useEffect(() => {
        if (!selectedCategory) return;

        let cancelled = false;
        const fetchCategoryPosts = async () => {
            try {
                const { data } = await api.get(`/posts?category=${selectedCategory._id}`);
                if (!cancelled) setPosts(data.posts || []);
            } catch (err) {
                if (!cancelled) {
                    addToast("Error fetching posts for this interest", "error");
                    setPosts([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        setLoading(true);
        fetchCategoryPosts();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <Sparkles style={{ color: 'var(--accent-primary)' }} /> {t('interests.title')} <span style={{ color: 'var(--accent-primary)' }}>{t('interests.titleCol')}</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>{t('interests.subtitle')}</p>
            </div>

            {/* Interest Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                overflowX: 'auto', 
                paddingBottom: '20px', 
                marginBottom: '40px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }} className="no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '999px',
                            border: '1px solid',
                            borderColor: selectedCategory?._id === cat._id ? 'var(--accent-primary)' : 'var(--border-color)',
                            backgroundColor: selectedCategory?._id === cat._id ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)',
                            color: selectedCategory?._id === cat._id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Hash size={16} /> {cat.name}
                    </button>
                ))}
            </div>

            {/* Posts Content */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            Trending in {selectedCategory?.name || 'Loading...'}
                        </h2>
                    </div>
                    
                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', padding: '10px 10px 10px 40px', 
                                borderRadius: '999px', border: '1px solid var(--border-color)', 
                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                outline: 'none'
                             }}
                        />
                    </div>
                </div>

                {loading && posts.length === 0 ? (
                    <div className="posts-grid">
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ padding: '4rem 0' }}>
                        <EmptyState 
                            title="No current discussions" 
                            message={`Nobody has posted about ${selectedCategory?.name} yet. Why not start the conversation?`}
                            actionText="Create first post"
                            actionLink="/create-post"
                        />
                    </div>
                ) : (
                    <div className="posts-grid" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
                        {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())).map(post => (
                            <PostCard key={post._id} post={post} />
                        ))}
                        {posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && posts.length > 0 && (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>No discussions found for "{searchTerm}"</p>
                        )}
                    </div>
                )}
            </div>
            
            <ToastContainer />
        </div>
    );
};

export default Interests;
