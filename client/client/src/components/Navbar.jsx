import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Home, PenTool, LogOut, Shield, Users, TrendingUp, Heart, Globe } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatarHelper';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <MessageSquare size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                Dev<span>Forum</span>
            </Link>
            
            <div className="nav-links">
                <Link to="/" className="nav-link"><Home size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> {t('navbar.home')}</Link>
                <Link to="/popular" className="nav-link"><TrendingUp size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> {t('navbar.popular')}</Link>
                <Link to="/interests" className="nav-link"><Heart size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> {t('navbar.interests')}</Link>
                {user ? (
                    <>
                        <Link to="/create-post" className="nav-link"><PenTool size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> {t('navbar.create')}</Link>
                        <Link to="/friends" className="nav-link"><Users size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> {t('navbar.friends')}</Link>
                        {(user.role === 'admin' || user.role === 'moderator') && (
                            <Link to="/admin" className="nav-link" style={{ color: 'var(--danger)' }}><Shield size={18} style={{verticalAlign: 'text-bottom', marginRight:'4px'}}/> {t('navbar.admin')}</Link>
                        )}
                        <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img src={getAvatarUrl(user.avatar, user.username)} alt="profile" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-primary)' }} />
                            {t('navbar.profile')}
                        </Link>
                        <button onClick={logout} className="btn btn-secondary">
                            <LogOut size={16} /> {t('navbar.logout')}
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">{t('navbar.login')}</Link>
                        <Link to="/register" className="btn btn-primary">{t('navbar.register')}</Link>
                    </>
                )}
                
                <div className="language-switcher" style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                    <select 
                        onChange={(e) => changeLanguage(e.target.value)} 
                        value={i18n.language}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="ru">RU</option>
                        <option value="en">EN</option>
                        <option value="kk">KK</option>
                    </select>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
