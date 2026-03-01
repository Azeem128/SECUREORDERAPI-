
import React, { useState } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      toast.success(res.data.message);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send reset link';
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
          <h2 className="fw-bold mb-4 text-center text-white">Forgot Password</h2>
          <p className="text-center text-white opacity-75 mb-4">
            Enter your email to receive a password reset link.
          </p>

          {message && <Alert variant="success" className="mb-4">{message}</Alert>}
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="text-white">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </Form>

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