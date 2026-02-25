import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tickets } from '../services/api';
import type { TicketStatus, TicketSeverity, TicketType } from '../types';
import { PageSkeleton } from '../components/Skeleton';

export default function TicketsAdd() {
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    type: 'TECHNICAL_ISSUE' as TicketType,
    severity: 'MEDIUM' as TicketSeverity,
    status: 'NEW' as TicketStatus
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await tickets.create({
        clientId: formData.clientId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        severity: formData.severity,
        status: formData.status
      });
      navigate('/tickets');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Ticket</h1>
        <p className="page-subtitle">Create a support ticket</p>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Client ID *</label>
              <input
                type="text"
                name="clientId"
                className="form-input"
                value={formData.clientId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="TECHNICAL_ISSUE">Technical Issue</option>
                <option value="HOW_TO_QUESTION">How To Question</option>
                <option value="ENHANCEMENT_REQUEST">Enhancement Request</option>
                <option value="BILLING_INQUIRY">Billing Inquiry</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <select
                name="severity"
                className="form-select"
                value={formData.severity}
                onChange={handleChange}
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING_CLIENT">Pending Client</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginRight: '1rem' }}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/tickets')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
