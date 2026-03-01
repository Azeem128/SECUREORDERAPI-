
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast, ToastContainer, Spinner } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const showNotification = (msg, variant = 'success') => {
    setToastMessage(msg);
    setToastVariant(variant);
    setShowToast(true);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await api.post('/auth/login', { email, password });

    const { accessToken, refreshToken, user } = res.data;

    if (!accessToken || !refreshToken || !user) {
      throw new Error('Incomplete login response');
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    localStorage.setItem('user', JSON.stringify(user)); // optional backup
    await refreshUser(); 
    showNotification('Welcome back! Redirecting...', 'success');
    navigate('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    const errMsg = err.response?.data?.message || err.message || 'Login failed';
    showNotification(errMsg, 'danger');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 bg-gradient-dark">
      <div
        className="glass-card p-5 shadow-xl"
        style={{
          maxWidth: '450px',
          width: '100%',
          borderRadius: '24px',
          background: 'rgba(40, 20, 70, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
        }}
      >
        <h2 className="text-center mb-4 fw-bold text-white" style={{ fontSize: '2.5rem' }}>
          Welcome Back
        </h2>
        <p className="text-center text-white opacity-75 mb-5 fw-medium">
          Sign in to your SecureOrder account
        </p>

        <form onSubmit={handleSubmit} className="d-grid gap-4">
          <div>
            <label className="form-label text-white fw-medium mb-2">Email Address</label>
            <input
              type="email"
              className="form-control glass-input rounded-pill py-3 px-4"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(168,85,247,0.4)',
                color: '#fff',
              }}
            />
          </div>

          <div>
            <label className="form-label text-white fw-medium mb-2">Password</label>
            <input
              type="password"
              className="form-control glass-input rounded-pill py-3 px-4"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(168,85,247,0.4)',
                color: '#fff',
              }}
            />
            <div className="text-end mt-3">
              <Link
                to="/forgot-password"
                className="btn btn-sm fw-bold px-4 py-2 rounded-pill"
                style={{
                  background: 'linear-gradient(90deg, #c084fc, #7c3aed)',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 0.35s ease',
                  boxShadow: '0 4px 15px rgba(192, 132, 252, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.08)';
                  e.target.style.boxShadow = '0 8px 25px rgba(192, 132, 252, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(192, 132, 252, 0.3)';
                }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn-gradient btn-lg fw-bold py-3 rounded-pill shadow-lg"
            disabled={loading}
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              border: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="fw-medium mb-2 text-white opacity-90" style={{ fontSize: '0.95rem' }}>
            Don't have an account?
          </p>
          <Link
            to="/register"
            className="text-info fw-bold text-decoration-none hover:text-purple-300 transition-colors"
            style={{ fontSize: '1.05rem' }}
          >
            Create Account
          </Link>
        </div>
      </div>

      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white fw-medium">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}