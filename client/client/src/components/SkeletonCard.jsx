import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="card">
        <div className="skeleton" style={{ height: '180px', width: '100%', marginBottom: '1rem', borderRadius: '8px' }}></div>
        <div className="skeleton" style={{ height: '24px', width: '80%', marginBottom: '1rem' }}></div>
        <div className="skeleton" style={{ height: '40px', width: '100%' }}></div>
    </div>
  );
};

export default SkeletonCard;
