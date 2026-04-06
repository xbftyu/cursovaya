import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();


  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError(t('login.fillAll'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '4rem 0' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{t('login.welcome')}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('login.subtitle')}</p>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">{t('login.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="form-input"
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('login.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          {error && <div style={{ color: 'var(--danger)', textAlign: 'center', marginBottom: '1.5rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('login.loggingIn') : t('login.loginBtn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {t('login.noAccount')}{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{t('login.registerHere')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;