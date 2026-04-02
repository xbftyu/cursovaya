import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container text-center" style={{ paddingTop: '5rem' }}>
            <h1 style={{ fontSize: '4rem', color: 'var(--primary)' }}>404</h1>
            <h2 style={{ marginBottom: '1.5rem' }}>Page Not Found</h2>
            <p style={{ marginBottom: '2rem' }}>The page you are looking for doesn't exist or has been moved.</p>
            <Link to="/" className="btn">Return Home</Link>
        </div>
    );
};

export default NotFound;
