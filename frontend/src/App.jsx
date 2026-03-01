
import React from 'react';
import Profile from './components/Profile';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Analytics from './components/Analytics';
import AdminUsers from './components/AdminUsers';
import { useAuth } from './context/AuthContext';
import AuditLog from './components/AuditLog';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <div className="d-flex min-vh-100">
        {user && <Sidebar />}
        <div 
          className="flex-grow-1"
          style={{ 
            marginLeft: user ? '240px' : '0',
            transition: 'margin-left 0.3s ease'
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/orders" 
              element={<ProtectedRoute><Orders /></ProtectedRoute>} 
            />
            <Route 
              path="/analytics" 
              element={<ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute>} 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
  path="/audit-log" 
  element={
    <ProtectedRoute requiredRole="admin">
      <AuditLog />
    </ProtectedRoute>
  } 
/>
            <Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>

            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;