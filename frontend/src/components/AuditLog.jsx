
import React, { useState, useEffect } from 'react';
import { Table, Spinner, Card, Alert, Badge } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/orders/audit-log');
        setLogs(res.data);
      } catch (err) {
        setError('Failed to load audit log');
        toast.error('Failed to load audit log');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-5 text-center text-white">Audit Log (Admin)</h2>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
          <p className="text-white mt-3">Loading audit log...</p>
        </div>
      ) : logs.length === 0 ? (
        <Alert variant="info" className="text-center bg-dark text-white border-0">
          No audit entries yet.
        </Alert>
      ) : (
        <Card className="shadow-lg border-0 glass">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 text-white">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Order</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="small">
                        {new Date(log.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        {log.userName} <Badge bg={log.role === 'admin' ? 'danger' : 'success'}>{log.role.toUpperCase()}</Badge>
                      </td>
                      <td>
                        <Badge bg="info">{log.action.replace('_', ' ').toUpperCase()}</Badge>
                      </td>
                      <td>{log.orderProduct}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}