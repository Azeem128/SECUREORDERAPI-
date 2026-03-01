
import React, { useState, useEffect } from 'react';
import { Table, Spinner, Card, Button, Modal, Alert, Badge } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/orders/users');
        setUsers(res.data);
      } catch (err) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const fetchUserOrders = async (userId, userName) => {
    try {
      const res = await api.get(`/orders/user/${userId}/orders`);
      setUserOrders(res.data);
      setSelectedUser({ name: userName });
      setShowOrdersModal(true);
    } catch (err) {
      toast.error('Failed to load user orders');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-5 text-center text-white">All Users</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="text-white mt-3">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <Alert variant="info" className="text-center bg-dark text-white border-0">
          No users found.
        </Alert>
      ) : (
        <Card className="shadow-lg border-0" style={{
          background: 'rgba(40, 20, 70, 0.65)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px'
        }}>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 text-white">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <Badge bg={u.role === 'admin' ? 'danger' : 'success'}>
                          {u.role.toUpperCase()}
                        </Badge>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => fetchUserOrders(u._id, u.name)}
                        >
                          View Orders
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* User Orders Modal */}
      <Modal show={showOrdersModal} onHide={() => setShowOrdersModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Orders by {selectedUser?.name || 'User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userOrders.length === 0 ? (
            <p className="text-center text-muted">No orders for this user.</p>
          ) : (
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {userOrders.map(o => (
                  <tr key={o._id}>
                    <td>{o.product}</td>
                    <td>{o.quantity}</td>
                    <td>
                      <Badge bg={o.status === 'pending' ? 'warning' : o.status === 'processing' ? 'info' : 'success'}>
                        {o.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrdersModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}