// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const token = localStorage.getItem('accessToken');
  const isLoggedIn = !!token && !!user;

  if (!isLoggedIn) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/dashboard">
          SecureOrder
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/orders">Orders</Link>
            </li>
            {user.role === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/analytics">Analytics</Link>
              </li>
            )}
          </ul>
          <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}