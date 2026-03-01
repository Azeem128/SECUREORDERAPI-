
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast, ToastContainer, Spinner, ButtonGroup, ToggleButton } from 'react-bootstrap';
import api from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: 33, text: 'Weak', color: 'bg-danger' };
    if (score <= 3) return { strength: 66, text: 'Medium', color: 'bg-warning' };
    return { strength: 100, text: 'Strong', color: 'bg-success' };
  };

  const passwordStrength = getPasswordStrength();

  const showNotification = (msg, variant = 'success') => {
    setToastMessage(msg);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordStrength.strength < 66) {
      return showNotification('Password too weak. Add uppercase, number & special char.', 'danger');
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, role });
      showNotification('Account created! Redirecting to login...', 'success');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Registration failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 bg-gradient-dark">
      <div
        className="glass-card p-4 shadow-xl"
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '20px',
          background: 'rgba(40, 20, 70, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
        }}
      >
        <h2 className="text-center mb-3 fw-bold text-white" style={{ fontSize: '2.1rem' }}>
          Create Account
        </h2>
        <p className="text-center text-white opacity-75 mb-4 fw-medium" style={{ fontSize: '1rem' }}>
          Join SecureOrder in seconds
        </p>

        <form onSubmit={handleSubmit} className="d-grid gap-3">
          <div>
            <label className="form-label text-white fw-medium small mb-1">Full Name</label>
            <input
              type="text"
              className="form-control glass-input rounded-pill py-2 px-3"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label className="form-label text-white fw-medium small mb-1">Email</label>
            <input
              type="email"
              className="form-control glass-input rounded-pill py-2 px-3"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label className="form-label text-white fw-medium small mb-1">Password</label>
            <input
              type="password"
              className="form-control glass-input rounded-pill py-2 px-3"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ fontSize: '0.95rem' }}
            />
            {password && (
              <div className="progress mt-2" style={{ height: '5px' }}>
                <div
                  className={`progress-bar ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="form-label text-white fw-medium small mb-2">Account Type</label>
            <ButtonGroup className="w-100 d-flex justify-content-between" toggle>
              <ToggleButton
                id="radio-user"
                type="radio"
                variant={role === 'user' ? 'success' : 'outline-success'}
                name="radio"
                value="user"
                checked={role === 'user'}
                onChange={(e) => setRole(e.currentTarget.value)}
                className="rounded-pill fw-bold py-3 flex-fill mx-2 shadow-sm"
                style={{
                  fontSize: '1.05rem',
                  transition: 'all 0.35s ease',
                  borderWidth: '2px',
                  minWidth: '45%',
                }}
              >
                Standard User
              </ToggleButton>

              <ToggleButton
                id="radio-admin"
                type="radio"
                variant={role === 'admin' ? 'danger' : 'outline-danger'}
                name="radio"
                value="admin"
                checked={role === 'admin'}
                onChange={(e) => setRole(e.currentTarget.value)}
                className="rounded-pill fw-bold py-3 flex-fill mx-2 shadow-sm"
                style={{
                  fontSize: '1.05rem',
                  transition: 'all 0.35s ease',
                  borderWidth: '2px',
                  minWidth: '45%',
                }}
              >
                Administrator
              </ToggleButton>
            </ButtonGroup>
          </div>

          <button
            type="submit"
            className="btn-gradient btn-lg fw-bold rounded-pill shadow-lg py-3 mt-2"
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
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="fw-medium mb-1 text-white opacity-90" style={{ fontSize: '0.95rem' }}>
            Already have an account?
          </p>
          <Link
            to="/login"
            className="text-info fw-bold text-decoration-none hover:text-purple-300 transition-colors"
            style={{ fontSize: '1.05rem' }}
          >
            Log In
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