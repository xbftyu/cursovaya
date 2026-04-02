import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [{ loading, error }, setStatus] = useState({ loading: false, error: null });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (!formData.username || !formData.email || !formData.password) {
            return setStatus({ loading: false, error: 'Please fill all fields' });
        }
        setStatus({ loading: true, error: null });
        try {
            await register(formData.username, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setStatus({ loading: false, error: err.response?.data?.message || 'Registration failed' });
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Register</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" name="username" value={formData.username} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={onChange} />
                    </div>
                    {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
                    <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
