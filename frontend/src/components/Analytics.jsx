
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';
import { Spinner } from 'react-bootstrap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/analytics');
        const { labels, data } = res.data;

        setChartData({
          labels: labels || ['Pending', 'Processing', 'Completed'],
          datasets: [{
            label: 'Orders by Status',
            data: data || [0, 0, 0],
            backgroundColor: [
              'rgba(245, 158, 11, 0.75)',   // amber
              'rgba(59, 130, 246, 0.75)',   // blue
              'rgba(34, 197, 94, 0.75)',    // purple
            ],
            borderColor: [
              'rgba(245, 158, 11, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(34, 197, 94, 1)',
            ],
            borderWidth: 1,
          }],
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load real data. Showing sample.');
        setChartData({
          labels: ['Pending', 'Processing', 'Completed'],
          datasets: [{
            label: 'Orders by Status',
            data: [12, 8, 20],
            backgroundColor: ['rgba(245, 158, 11, 0.75)', 'rgba(59, 130, 246, 0.75)', 'rgba(34, 197, 94, 0.75)'],
          }],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#e0d4ff' } },
      title: { display: true, text: 'Order Status Distribution', color: '#e0d4ff', font: { size: 20 } },
    },
    scales: {
      x: { ticks: { color: '#e0d4ff' }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { beginAtZero: true, ticks: { color: '#e0d4ff' }, grid: { color: 'rgba(255,255,255,0.08)' } },
    },
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5 fw-bold text-white">Analytics Dashboard</h2>

      <div className="card shadow-lg mb-5" style={{
        background: 'rgba(40, 20, 70, 0.65)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '20px',
        backdropFilter: 'blur(12px)',
        height: '520px',
        overflow: 'hidden'
      }}>
        <div className="card-body p-4 d-flex flex-column">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <Spinner animation="border" variant="light" style={{ width: '3rem', height: '3rem' }} />
            </div>
          ) : error ? (
            <div className="alert alert-warning text-center flex-grow-1 d-flex align-items-center justify-content-center mb-0">
              {error}
            </div>
          ) : chartData ? (
            <div className="flex-grow-1">
              <Bar data={chartData} options={options} />
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-center text-white opacity-75 small">
        {error ? 'Showing sample data' : 'Real-time order status distribution'}
      </p>
    </div>
  );
}