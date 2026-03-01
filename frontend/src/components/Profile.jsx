
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
  Modal,
  ListGroup,
  Form,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/myorders');
        const userOrders = res.data || [];

        setOrders(userOrders);

        const statusCount = { pending: 0, processing: 0, completed: 0, cancelled: 0 };
        userOrders.forEach((o) => {
          if (o.status in statusCount) statusCount[o.status]++;
        });

        setStats({
          total: userOrders.length,
          ...statusCount,
        });
      } catch (err) {
        setError('Failed to load your orders');
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfileData();
  }, [user]);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setNoteText('');
    setShowDetailsModal(true);
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedOrder) return;
    try {
      await api.put(`/orders/${selectedOrder._id}`, { note: noteText });
      toast.success('Note added');
      setNoteText('');
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-5 text-center text-white">My Profile</h2>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="text-white mt-3">Loading your profile...</p>
        </div>
      ) : (
        <>
          <Card className="mb-5 shadow-lg border-0 glass text-white">
            <Card.Body className="p-5 text-center">
              <div className="mb-4">
                <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mx-auto" style={{ width: '120px', height: '120px' }}>
                  <i className="bi bi-person-fill fs-1 text-white"></i>
                </div>
              </div>

              <h3 className="fw-bold">{user?.name || 'User'}</h3>
              <p className="fs-5 opacity-90">{user?.email}</p>
              <Badge bg={user?.role === 'admin' ? 'danger' : 'success'} className="px-4 py-2 fs-6">
                {user?.role.toUpperCase()}
              </Badge>

              <div className="row mt-5 g-4">
                <div className="col-md-3">
                  <Card className="bg-transparent text-white h-100 border-0 shadow-sm glass">
                    <Card.Body className="text-center">
                      <h6 className="opacity-75 mb-1">Total Orders</h6>
                      <h3 className="fw-bold">{stats.total}</h3>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-3">
                  <Card className="bg-transparent text-white h-100 border-0 shadow-sm glass">
                    <Card.Body className="text-center">
                      <h6 className="opacity-75 mb-1">Pending</h6>
                      <h3 className="fw-bold text-warning">{stats.pending}</h3>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-3">
                  <Card className="bg-transparent text-white h-100 border-0 shadow-sm glass">
                    <Card.Body className="text-center">
                      <h6 className="opacity-75 mb-1">Processing</h6>
                      <h3 className="fw-bold text-info">{stats.processing}</h3>
                    </Card.Body>
                  </Card>
                </div>
                <div className="col-md-3">
                  <Card className="bg-transparent text-white h-100 border-0 shadow-sm glass">
                    <Card.Body className="text-center">
                      <h6 className="opacity-75 mb-1">Completed</h6>
                      <h3 className="fw-bold text-success">{stats.completed}</h3>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-lg border-0 glass">
            <Card.Header className="bg-transparent border-0 text-white">
              <h5 className="mb-0 fw-bold">My Orders</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {orders.length === 0 ? (
                <div className="text-center py-5 text-white fw-medium opacity-75">
                  <i className="bi bi-cart-x fs-1 mb-3 d-block"></i>
                  No orders yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 text-white" style={{ cursor: 'pointer' }}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} onClick={() => openDetails(order)}>
                          <td className="fw-medium text-white">{order.product}</td>
                          <td className="text-white">{order.category}</td>
                          <td className="text-white">{order.quantity}</td>
                          <td>
                            <Badge
                              pill
                              bg={
                                order.status === 'pending' ? 'warning' :
                                order.status === 'processing' ? 'info' :
                                order.status === 'completed' ? 'success' : 'danger'
                              }
                              className="px-3 py-2"
                            >
                              {order.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="small text-white">
                            {new Date(order.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
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
        </>
      )}

      {/* Order Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered contentClassName="glass">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-transparent text-white">
          {selectedOrder ? (
            <>
              <div className="mb-4">
                <h5 className="fw-bold">Order Information</h5>
                <p><strong>Product:</strong> {selectedOrder.product}</p>
                <p><strong>Category:</strong> {selectedOrder.category}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <Badge
                    bg={
                      selectedOrder.status === 'pending' ? 'warning' :
                      selectedOrder.status === 'processing' ? 'info' :
                      selectedOrder.status === 'completed' ? 'success' : 'danger'
                    }
                  >
                    {selectedOrder.status.toUpperCase()}
                  </Badge>
                </p>
                <p><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                {selectedOrder.cancelReason && (
                  <p className="text-danger"><strong>Cancel Reason:</strong> {selectedOrder.cancelReason}</p>
                )}
              </div>

              <h5 className="fw-bold mb-3">Activity Timeline</h5>
              {selectedOrder.notes?.length > 0 ? (
                <ListGroup variant="flush" className="bg-transparent border-0">
                  {selectedOrder.notes
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((note, i) => (
                      <ListGroup.Item key={i} className="bg-transparent border-0 text-white py-2">
                        <small className="text-light opacity-75">
                          {new Date(note.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          •{' '}
                        </small>
                        <strong>{note.userName || 'System'}:</strong> {note.text}
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No activity yet.</p>
              )}

              {user?.role === 'admin' && (
                <div className="mt-4">
                  <Form.Label className="text-white">Add Internal Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="e.g. Waiting for supplier..."
                    className="bg-dark text-white border-secondary"
                  />
                  <Button variant="outline-primary" size="sm" className="mt-2" onClick={handleAddNote}>
                    Add Note
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-transparent border-0">
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}