import React from 'react';

const Comment = ({ comment }) => {
    return (
        <div className="comment">
            <div className="comment-meta">
                {comment.author?.username} • {new Date(comment.createdAt).toLocaleDateString()}
            </div>
            <p className="comment-text">{comment.text}</p>
        </div>
    );
};

export default Comment;
