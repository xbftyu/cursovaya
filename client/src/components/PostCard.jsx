import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
    return (
        <div className="post-card">
            <Link to={`/post/${post._id}`}>
                <h2 className="post-title">{post.title}</h2>
            </Link>
            <p className="post-meta">
                Posted by {post.author?.username} on {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <p className="post-content">
                {post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}
            </p>
        </div>
    );
};

export default PostCard;
