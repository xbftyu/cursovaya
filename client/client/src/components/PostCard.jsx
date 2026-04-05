import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { getAvatarUrl, getImageUrl } from '../utils/avatarHelper';

const PostCard = ({ post }) => {
    const imageUrl = getImageUrl(post.image, post._id);
    const authorAvatar = getAvatarUrl(post.author?.avatar, post.author?.username);

    return (
        <Link to={`/post/${post._id}`} className="card glow-card" style={{ display: 'flex', flexDirection: 'column' }}>
            {imageUrl ? (
                <img 
                    src={imageUrl}
                    alt="Post Cover" 
                    className="post-image"
                    style={{ borderRadius: 'var(--border-radius-md) var(--border-radius-md) 0 0' }}
                />
            ) : (
                <div style={{
                    height: '160px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                    borderRadius: 'var(--border-radius-md) var(--border-radius-md) 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    marginBottom: '0',
                }}>
                    💬
                </div>
            )}
            <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="badge" style={{ marginBottom: '0.6rem', display: 'inline-block' }}>{post.category?.name || "General"}</div>
                
                <h3 className="post-title" style={{ marginBottom: '1rem', flex: 1 }}>{post.title}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
                    <img 
                        src={authorAvatar}
                        alt="Avatar" 
                        className="avatar"
                        style={{ objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ marginLeft: '10px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                            {post.author?.username}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                </div>
                
                <div className="post-meta">
                    <span className="flex items-center gap-2"><Heart size={14} /> {post.likes?.length || 0}</span>
                    <span className="flex items-center gap-2"><Eye size={14} /> {post.views || 0}</span>
                </div>
            </div>
        </Link>
    );
};

export default PostCard;
