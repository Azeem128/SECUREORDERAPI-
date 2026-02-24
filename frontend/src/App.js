import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// Home Page with Buttons
function Home() {
  return (
    <div className="container-fluid bg-primary text-white min-vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 className="display-1 fw-bold mb-4">SecureOrder</h1>
      <p className="lead mb-5">Secure Order Management System</p>
      <div className="d-flex gap-4">
        <Link to="/login" className="btn btn-light btn-lg px-5 py-3 fw-bold">Login</Link>
        <Link to="/register" className="btn btn-outline-light btn-lg px-5 py-3 fw-bold">Register</Link>
      </div>
    </div>
  );
}

// Login Page
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg p-5" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control form-control-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control form-control-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-100">Login</button>
        </form>
        <p className="text-center mt-4">
          No account? <Link to="/register" className="text-primary">Register</Link>
        </p>
      </div>
    </div>
  );
}

// Register Page
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
      alert('Registered! Now login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg p-5" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-4">Register</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control form-control-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control form-control-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control form-control-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-select form-select-lg"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success btn-lg w-100">Register</button>
        </form>
        <p className="text-center mt-4">
          Already have account? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
}

// Dashboard (placeholder)
function Dashboard() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">Dashboard</h1>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Orders</h5>
              <Link to="/orders" className="btn btn-primary mt-3">View Orders</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Analytics</h5>
              <Link to="/analytics" className="btn btn-info mt-3">View Analytics</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<div className="container py-5"><h1>Orders (coming soon)</h1></div>} />
        <Route path="/analytics" element={<div className="container py-5"><h1>Analytics (coming soon)</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;