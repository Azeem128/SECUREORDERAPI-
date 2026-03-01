
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          id: userData.id,
          name: userData.name || 'User',
          email: userData.email || 'Email not available',
          role: userData.role,
        });
        setLoading(false);
        return;
      } catch (e) {
        console.warn('Stored user corrupt:', e);
        localStorage.removeItem('user');
      }
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          role: decoded.role,
          name: decoded.name || 'User',
          email: decoded.email || 'Email not available',
        });
      } catch (err) {
        console.warn('Invalid token on load:', err.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.warn('Refresh user failed, using stored:', err);
      loadUser(); 
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const logoutWithConfirm = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of SecureOrder.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Stay logged in',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
      }
    });
  };

  const logoutSilent = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout: logoutWithConfirm, logoutSilent, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);