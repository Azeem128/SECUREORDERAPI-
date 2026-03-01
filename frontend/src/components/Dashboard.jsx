
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Alert, Badge, Card, Spinner, Table } from 'react-bootstrap';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent orders 
        const ordersRes = await api.get('/orders/myorders');
        if (ordersRes.data && Array.isArray(ordersRes.data)) {
          const sorted = ordersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentOrders(sorted.slice(0, 8));
        } else {
          setRecentOrders([]);
        }
        // Fetch stats ONLY for admin
        if (isAdmin) {
          const analyticsRes = await api.get('/orders/analytics');
          const data = analyticsRes.data;

          console.log('ADMIN ANALYTICS RESPONSE:', JSON.stringify(data, null, 2)); // Debug

          let pending = 0, processing = 0, completed = 0;

          if (Array.isArray(data?.data)) {
            [pending, processing, completed] = data.data.map(n => Number(n) || 0);
          } else if (data && typeof data === 'object') {
            pending = Number(data.pending) || 0;
            processing = Number(data.processing) || 0;
            completed = Number(data.completed) || 0;
          } else if (Array.isArray(data)) {
            [pending, processing, completed] = data.map(n => Number(n) || 0);
          }

          setStats({
            total: pending + processing + completed,
            pending,
            processing,
            completed,
          });
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Could not load dashboard data.');
        setRecentOrders([]);
        if (isAdmin) setStats({ total: 0, pending: 0, processing: 0, completed: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, isAdmin]);

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-5 flex-wrap gap-4">
        <div className="d-flex align-items-center flex-grow-1">
          <div className="bg-primary rounded-circle p-3 me-3" style={{ width: '64px', height: '64px' }}>
            <i className="bi bi-person-fill fs-3 text-white d-block text-center mt-1"></i>
          </div>
          <div>
            <h2 className="fw-bold mb-1 text-white">
              Welcome, {user?.name || 'User'}!
            </h2>
            <p className="fw-semibold mb-1 text-white fs-5">
              {isAdmin ? 'Administrator' : 'Standard User'} • SecureOrder
            </p>
            <small className="text-white fw-medium opacity-90 d-block">
              {user?.email || 'Email not available'}
            </small>
          </div>
        </div>

        <button className="btn btn-outline-light btn-sm mt-2 mt-md-0" onClick={logout}>
          <i className="bi bi-box-arrow-right me-1"></i> Logout
        </button>
      </div>

      {error && (
        <Alert variant="warning" className="mb-4 text-center fw-medium">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" style={{ width: '3rem', height: '3rem' }} />
          <p className="text-white fw-medium mt-3">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/*  Stats Cards */}
          {isAdmin && (
            <div className="row g-4 mb-5">
              <div className="col-lg-3 col-md-6">
                <div className="card text-white text-center h-100 shadow-lg" style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}>
                  <div className="card-body py-4">
                    <h6 className="mb-2 small fw-medium opacity-90">Total Orders</h6>
                    <h3 className="fw-bold mb-0">{stats.total}</h3>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="card text-white text-center h-100 shadow-lg" style={{ background: 'linear-gradient(135deg, #c026d3, #ec4899)' }}>
                  <div className="card-body py-4">
                    <h6 className="mb-2 small fw-medium opacity-90">Pending</h6>
                    <h3 className="fw-bold mb-0">{stats.pending}</h3>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="card text-white text-center h-100 shadow-lg" style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4)' }}>
                  <div className="card-body py-4">
                    <h6 className="mb-2 small fw-medium opacity-90">Processing</h6>
                    <h3 className="fw-bold mb-0">{stats.processing}</h3>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="card text-white text-center h-100 shadow-lg" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                  <div className="card-body py-4">
                    <h6 className="mb-2 small fw-medium opacity-90">Completed</h6>
                    <h3 className="fw-bold mb-0">{stats.completed}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isAdmin && (
            <Card className="mb-5 shadow-lg border-0 glass text-center">
              <Card.Body className="py-5">
                <i className="bi bi-cart-check-fill fs-1 mb-4 d-block text-info"></i>
                <h4 className="fw-bold text-white mb-3">Your Orders Hub</h4>
                <p className="text-white opacity-75 mb-4">
                  Track, manage, and create your orders in one beautiful place.
                </p>
                <Link to="/orders" className="btn-gradient btn-lg rounded-pill px-5">
                  View / Create Orders
                </Link>
              </Card.Body>
            </Card>
          )}

          {/* Recent Orders */}
          <Card className="mb-5 shadow-lg border-0 glass">
            <Card.Header className="bg-transparent border-0 text-white">
              <h5 className="mb-0 fw-bold">
                {isAdmin ? 'Recent Orders (All)' : 'Your Recent Orders'}
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {recentOrders.length === 0 ? (
                <div className="text-center py-5 text-white fw-medium opacity-75">
                  <i className="bi bi-cart-x fs-1 mb-3 d-block"></i>
                  {isAdmin ? 'No orders in the system yet.' : 'No orders yet. Start creating!'}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 text-white">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order._id}>
                          <td className="fw-medium">{order.product}</td>
                          <td>{order.quantity}</td>
                          <td>
                            <Badge
                              pill
                              bg={
                                order.status === 'pending' ? 'warning' :
                                order.status === 'processing' ? 'info' :
                                'success'
                              }
                              className="px-3 py-2 fs-6"
                            >
                              {order.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="small text-white fw-medium">
                            {new Date(order.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card text-center h-100 shadow-lg glass">
                <div className="card-body py-5">
                  <i className="bi bi-plus-circle-fill text-info fs-1 mb-3 d-block"></i>
                  <h5 className="fw-bold mb-3 text-white">New Order</h5>
                  <Link to="/orders" className="btn-gradient btn-lg rounded-pill px-5">
                    Create Now
                  </Link>
                </div>
              </div>
            </div>
            {isAdmin && (
              <div className="col-md-6">
                <div className="card text-center h-100 shadow-lg glass">
                  <div className="card-body py-5">
                    <i className="bi bi-graph-up fs-1 mb-3 d-block text-success"></i>
                    <h5 className="fw-bold mb-3 text-white">Analytics</h5>
                    <Link to="/analytics" className="btn-gradient btn-lg rounded-pill px-5">
                      View Insights
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}