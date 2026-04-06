import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import SkeletonCard from '../components/SkeletonCard';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast, ToastContainer } = useToast();
    const { t } = useTranslation();

    // Filters and Pagination could be added here
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetching first page limits default 10
                const { data } = await api.get('/posts');
                setPosts(data.posts || []);
            } catch (error) {
                console.error(error);
                addToast(t('home.failedLoad'), "error");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [addToast, t]);

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                    {t('home.titlePart1')} <span style={{ color: 'var(--accent-primary)' }}>{t('home.titlePart2')}</span>
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>{t('home.subtitle')}</p>
            </div>

            {loading ? (
                <div className="posts-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center mt-4">
                    <p style={{ color: 'var(--text-muted)' }}>{t('home.noPosts')}</p>
                </div>
            ) : (
                <div className="posts-grid">
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default Home;
