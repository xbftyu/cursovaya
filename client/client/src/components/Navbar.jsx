import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Home, PenTool, LogOut, Shield, Users, TrendingUp, Heart } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatarHelper';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <MessageSquare size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                Dev<span>Forum</span>
            </Link>
            
            <div className="nav-links">
                <Link to="/" className="nav-link"><Home size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> Home</Link>
                <Link to="/popular" className="nav-link"><TrendingUp size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> Popular</Link>
                <Link to="/interests" className="nav-link"><Heart size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> Interests</Link>
                {user ? (
                    <>
                        <Link to="/create-post" className="nav-link"><PenTool size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> Create</Link>
                        <Link to="/friends" className="nav-link"><Users size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> Friends</Link>
                        {(user.role === 'admin' || user.role === 'moderator') && (
                            <Link to="/admin" className="nav-link" style={{ color: 'var(--danger)' }}><Shield size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> Admin</Link>
                        )}
                        <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img src={getAvatarUrl(user.avatar, user.username)} alt="profile" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-primary)' }} />
                            Profile
                        </Link>
                        <button onClick={logout} className="btn btn-secondary">
                            <LogOut size={16} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
