import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ title, message, actionText, actionLink }) => {
    return (
        <div className="empty-state">
            <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3"
                alt="Empty State Illustration"
                style={{ borderRadius: '50%', width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <h2>{title}</h2>
            <p>{message}</p>
            {actionText && actionLink && (
                <Link to={actionLink} className="btn">
                    {actionText}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;
