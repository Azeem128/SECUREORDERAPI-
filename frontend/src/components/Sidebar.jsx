
import React, { useState } from 'react';
import { Offcanvas, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth(); 
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const SidebarContent = ({ isMobile = false }) => (
    <div className="d-flex flex-column h-100 text-white">
      {/* Gradient Header */}
      <div
        className="p-4 border-bottom"
        style={{
          background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
        }}
      >
        <h5 className="fw-bold mb-1">SecureOrder</h5>
        <small className="fw-medium text-white opacity-90">
          {user.role === 'admin' ? 'Administrator' : 'Standard User'}
        </small>
      </div>

      {/* Navigation */}
      <div className="p-3 flex-grow-1">
        <ul className="nav flex-column gap-2">
          <li className="nav-item">
            <Link
              to="/dashboard"
              className="nav-link d-flex align-items-center py-3 px-4 rounded"
              style={{ transition: 'all 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onClick={isMobile ? handleClose : undefined}
            >
              <i className="bi bi-house-door-fill me-3 fs-5 text-info"></i>
              Dashboard
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/orders"
              className="nav-link d-flex align-items-center py-3 px-4 rounded"
              style={{ transition: 'all 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              onClick={isMobile ? handleClose : undefined}
            >
              <i className="bi bi-cart-check-fill me-3 fs-5 text-success"></i>
              Orders
            </Link>
          </li>

          {user.role === 'admin' && (
            <>
              <li className="nav-item">
                <Link
                  to="/analytics"
                  className="nav-link d-flex align-items-center py-3 px-4 rounded"
                  style={{ transition: 'all 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={isMobile ? handleClose : undefined}
                >
                  <i className="bi bi-graph-up me-3 fs-5 text-warning"></i>
                  Analytics
                </Link>
                <li className="nav-item">
                  <li className="nav-item">
  <Link
    to="/audit-log"
    className="nav-link d-flex align-items-center py-3 px-4 rounded"
    style={{ transition: 'all 0.2s' }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    onClick={isMobile ? handleClose : undefined}
  >
    <i className="bi bi-journal-text me-3 fs-5 text-warning"></i>
    Audit Log
  </Link>
</li>
  <Link
    to="/profile"
    className="nav-link d-flex align-items-center py-3 px-4 rounded"
    style={{ transition: 'all 0.2s' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    onClick={isMobile ? handleClose : undefined}
  >
    <i className="bi bi-person-circle me-3 fs-5 text-primary"></i>
    My Profile
  </Link>
</li>
              </li>
              <li className="nav-item">
                <Link
                  to="/admin/users"
                  className="nav-link d-flex align-items-center py-3 px-4 rounded"
                  style={{ transition: 'all 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={isMobile ? handleClose : undefined}
                >
                  <i className="bi bi-people-fill me-3 fs-5 text-primary"></i>
                  Users & Orders
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="p-4 border-top">
        <Button
          variant="outline-danger"
          className="w-100 rounded-pill fw-bold"
          onClick={logout} 
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="outline-light"
        className="d-lg-none position-fixed top-0 start-0 m-3 shadow"
        style={{ zIndex: 1100, borderColor: '#c084fc', color: '#c084fc' }}
        onClick={handleShow}
      >
        <i className="bi bi-list fs-4"></i>
      </Button>
      <div
        className="d-none d-lg-flex flex-column position-fixed top-0 start-0 vh-100 shadow"
        style={{
          width: '230px',
          zIndex: 1000,
          background: 'rgba(30, 10, 50, 0.92)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <SidebarContent />
      </div>
      <Offcanvas show={show} onHide={handleClose} placement="start">
        <Offcanvas.Body className="p-0">
          <SidebarContent isMobile={true} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}