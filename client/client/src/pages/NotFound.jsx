import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '20px' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>Page Not Found</h2>
      <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '400px' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
