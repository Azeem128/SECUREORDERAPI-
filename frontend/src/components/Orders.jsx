
import React, { useState, useEffect } from 'react';
import {
  Table,
  Form,
  Pagination,
  Badge,
  Spinner,
  Alert,
  Card,
  Button,
  Modal,
  DropdownButton,
  Dropdown,
  ListGroup,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io('http://localhost:5000');

export default function Orders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [unitPriceInput, setUnitPriceInput] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();

    socket.on('orderCreated', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      setFilteredOrders((prev) => [newOrder, ...prev]);
      toast.success(`New order created: ${newOrder.product}`);
    });

    socket.on('orderUpdated', (updated) => {
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setFilteredOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      toast.info(`Order updated to ${updated.status}`);
      if (selectedOrder && selectedOrder._id === updated._id) {
        setSelectedOrder(updated);
      }
    });

    socket.on('orderDeleted', (deletedId) => {
      setOrders((prev) => prev.filter((o) => o._id !== deletedId));
      setFilteredOrders((prev) => prev.filter((o) => o._id !== deletedId));
      toast.error('Order deleted');
      if (selectedOrder && selectedOrder._id === deletedId) {
        setShowDetailsModal(false);
        setSelectedOrder(null);
      }
    });

    return () => {
      socket.off('orderCreated');
      socket.off('orderUpdated');
      socket.off('orderDeleted');
    };
  }, []);

  useEffect(() => {
    let result = [...orders];
    if (search) {
      result = result.filter((o) => o.product.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter) {
      result = result.filter((o) => o.status === statusFilter);
    }
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [search, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/orders' : '/orders/myorders';
      const res = await api.get(endpoint);
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      setError('Could not load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders', { product, quantity, category });
      setProduct('');
      setQuantity(1);
      setCategory('');
      toast.success('Order created successfully!');
    } catch (err) {
      toast.error('Failed to create order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, customNote = '') => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus, note: customNote });
      toast.info(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
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

  const handleUpdatePrice = async () => {
    if (!selectedOrder || !unitPriceInput || isNaN(unitPriceInput) || Number(unitPriceInput) < 0) {
      toast.error('Enter a valid unit price');
      return;
    }
    try {
      await api.put(`/orders/${selectedOrder._id}`, { unitPrice: Number(unitPriceInput) });
      toast.success('Price updated successfully');
      setUnitPriceInput('');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  const confirmDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    try {
      await api.delete(`/orders/${orderToDelete}`);
      toast.error('Order deleted successfully');
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setNoteText('');
    setUnitPriceInput(order.unitPrice || '');
    setShowDetailsModal(true);
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (page) => setCurrentPage(page);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-5 text-center text-white">Order Management</h2>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Filters & Create */}
      <Card className="mb-5 shadow-lg border-0 glass">
        <Card.Body className="p-4">
          <div className="row g-3 mb-4">
            <div className="col-md-5">
              <Form.Control
                placeholder="Search product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-dark text-white border-0 rounded-pill"
              />
            </div>
            <div className="col-md-4">
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark text-white border-0 rounded-pill"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </div>
            <div className="col-md-3">
              <Button
                variant="outline-light"
                className="w-100 rounded-pill"
                onClick={() => { setSearch(''); setStatusFilter(''); }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <form onSubmit={handleCreate}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <Form.Control
                  placeholder="Product name"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  required
                  className="bg-dark text-white border-0 rounded-pill"
                />
              </div>
              <div className="col-md-3">
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="bg-dark text-white border-0 rounded-pill"
                >
                  <option value="">Select Category</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Electronics">Electronics</option>
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Cleaning Supplies">Cleaning Supplies</option>
                  <option value="Groceries / Refreshments">Groceries / Refreshments</option>
                  <option value="Services">Services</option>
                  <option value="Others">Others</option>
                </Form.Select>
              </div>
              <div className="col-md-2">
                <Form.Control
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="bg-dark text-white border-0 rounded-pill"
                />
              </div>
              <div className="col-md-3">
                <Button type="submit" variant="success" className="w-100 rounded-pill">
                  <i className="bi bi-plus-lg me-2"></i> Add Order
                </Button>
              </div>
            </div>
          </form>
        </Card.Body>
      </Card>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="text-white mt-3">Loading orders...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <Alert variant="info" className="text-center py-4 bg-dark text-white border-0">
          No orders found.
        </Alert>
      ) : (
        <>
          <Card className="shadow-lg border-0 glass">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0 text-white" style={{ cursor: 'pointer' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((order) => (
                      <tr key={order._id} onClick={() => openDetails(order)}>
                        <td className="fw-medium">{order.product}</td>
                        <td>{order.category}</td>
                        <td>{order.quantity}</td>
                        <td>${Number(order.unitPrice || 0).toFixed(2)}</td>
                        <td>${Number(order.totalPrice || 0).toFixed(2)}</td>
                        <td>
                          <Badge
                            pill
                            bg={
                              order.status === 'pending' ? 'warning' :
                              order.status === 'processing' ? 'info' :
                              order.status === 'completed' ? 'success' :
                              'danger'
                            }
                            className="px-3 py-2"
                          >
                            {order.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="small">
                          {new Date(order.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="d-flex gap-2 flex-wrap">
                            {!isAdmin && order.status === 'pending' && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOrderToDelete(order._id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                Cancel
                              </Button>
                            )}

                            {isAdmin && (
                              <>
                                <DropdownButton
                                  variant="outline-info"
                                  size="sm"
                                  title="Update Status"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Dropdown.Item
                                    style={{ backgroundColor: '#ffc107', color: '#000' }} // yellow/orange for pending
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(order._id, 'processing');
                                    }}
                                  >
                                    Processing
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    style={{ backgroundColor: '#28a745', color: '#fff' }} // green for completed
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(order._id, 'completed');
                                    }}
                                  >
                                    Completed
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    style={{ backgroundColor: '#dc3545', color: '#fff' }} // red for cancelled
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateStatus(order._id, 'cancelled');
                                    }}
                                  >
                                    Cancelled
                                  </Dropdown.Item>
                                </DropdownButton>

                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrderToDelete(order._id);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination size="sm">
                <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this order? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Order Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered contentClassName="glass">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder ? (
            <>
              <div className="mb-4">
                <h5 className="fw-bold text-white">Order Information</h5>
                <p><strong>Product:</strong> {selectedOrder.product}</p>
                <p><strong>Category:</strong> {selectedOrder.category}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                <p><strong>Unit Price:</strong> ${Number(selectedOrder.unitPrice || 0).toFixed(2)}</p>
                <p><strong>Total Price:</strong> ${Number(selectedOrder.totalPrice || 0).toFixed(2)}</p>
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

              {isAdmin && (
                <div className="mb-4 p-3 border border-secondary rounded">
                  <h6 className="text-white">Update Unit Price (Admin Only)</h6>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-secondary">$</span>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={unitPriceInput}
                      onChange={(e) => setUnitPriceInput(e.target.value)}
                      placeholder="New unit price"
                      className="bg-dark text-white border-secondary"
                    />
                    <Button variant="outline-primary" onClick={handleUpdatePrice}>
                      Update
                    </Button>
                  </div>
                </div>
              )}

              <h5 className="fw-bold text-white mb-3">Activity Timeline</h5>
              {selectedOrder.notes?.length > 0 ? (
                <ListGroup variant="flush" className="bg-transparent">
                  {selectedOrder.notes
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((note, i) => (
                      <ListGroup.Item key={i} className="bg-transparent border-0 text-white py-2">
                        <small className="text-light opacity-75">
                          {new Date(note.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} •
                        </small>
                        <strong>{note.userName || 'System'}:</strong> {note.text}
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No activity yet.</p>
              )}

              {isAdmin && (
                <div className="mt-4">
                  <Form.Label className="text-white">Add Internal Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="e.g. Waiting for supplier..."
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}