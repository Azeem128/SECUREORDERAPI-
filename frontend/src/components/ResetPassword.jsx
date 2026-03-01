
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom'; // ← FIXED: added Link import
import api from '../services/api';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage(res.data.message);
      toast.success(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-lg glass p-4" style={{ maxWidth: '450px', width: '100%' }}>
        <Card.Body>
          <h2 className="fw-bold mb-4 text-center text-white">Reset Password</h2>

          {message && <Alert variant="success" className="mb-4">{message}</Alert>}
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          {!error && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="text-white">New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  className="bg-dark text-white border-0 rounded-pill"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-white">Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                  className="bg-dark text-white border-0 rounded-pill"
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 rounded-pill fw-bold py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </Form>
          )}

          <div className="text-center mt-4">
            <Link to="/login" className="text-info fw-medium">
              Back to Login
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}