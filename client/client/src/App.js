import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Interests from './pages/Interests';
import Popular from './pages/Popular';
import Friends from './pages/Friends';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/main.css';

// Protected Route HOC
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
    }
    return children;
};

function AppRoutes() {
    return (
        <div className="app-wrapper">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/interests" element={<Interests />} />
                    <Route path="/popular" element={<Popular />} />

                    {/* Protected Routes */}
                    <Route path="/create-post" element={
                        <ProtectedRoute>
                            <CreatePost />
                        </ProtectedRoute>
                    } />
                    <Route path="/post/:id" element={<PostPage />} />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/friends" element={
                        <ProtectedRoute>
                            <Friends />
                        </ProtectedRoute>
                    } />

                    {/* Admin/Moderator Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole={['admin', 'moderator']}>
                            <AdminPanel />
                        </ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
