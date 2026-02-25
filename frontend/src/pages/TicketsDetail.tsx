import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Headphones, User, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { tickets } from '../services/api';
import type { Ticket } from '../types';
import { PageSkeleton } from '../components/Skeleton';
import Badge from '../components/Badge';

export default function TicketsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TECHNICAL_ISSUE' as any,
    severity: 'MEDIUM' as any,
    status: 'NEW' as any,
    resolution: '',
    rootCause: ''
  });
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await tickets.getById(id!);
      setTicket(data);
      setFormData({
        title: data.title,
        description: data.description,
        type: data.type,
        severity: data.severity,
        status: data.status,
        resolution: data.resolution || '',
        rootCause: data.rootCause || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tickets.update(id!, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        severity: formData.severity,
        status: formData.status,
        resolution: formData.resolution || undefined,
        rootCause: formData.rootCause || undefined
      });
      setIsEditing(false);
      await loadTicket();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update ticket');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      await tickets.addComment(id!, { content: newComment });
      setNewComment('');
      await loadTicket();
    } catch (err: any) {
      alert('Failed to add comment: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NEW': return 'danger';
      case 'ASSIGNED':
      case 'IN_PROGRESS': return 'warning';
      case 'PENDING_CLIENT': return 'info';
      case 'RESOLVED':
      case 'CLOSED': return 'success';
      default: return 'default';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  if (loading) return <PageSkeleton />;

  if (!ticket) {
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => navigate('/tickets')}>
            <ArrowLeft size={18} /> Back to Tickets
          </button>
        </div>
        <div className="card">
          <p>Ticket not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">Ticket #{ticket.id.substring(0, 8)}</h1>
          <p className="page-subtitle">
            <Badge variant={getSeverityBadgeVariant(ticket.severity)}>{ticket.severity}</Badge>
            {' • '}<Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
          </p>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <Edit2 size={18} /> Edit
          </button>
        )}
      </div>

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

      {isEditing ? (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Resolution (if resolved)</label>
                <textarea
                  name="resolution"
                  className="form-textarea"
                  value={formData.resolution}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Root Cause (optional)</label>
                <input
                  type="text"
                  name="rootCause"
                  className="form-input"
                  value={formData.rootCause}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ marginRight: '1rem' }}>
                Save Changes
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Details</h3>
            <div className="flex flex-col gap-3">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client</div>
                <div>{ticket.client?.name || 'No client'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type</div>
                <div>{ticket.type.replace('_', ' ')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Severity</div>
                <Badge variant={getSeverityBadgeVariant(ticket.severity)}>{ticket.severity}</Badge>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
              </div>
              {ticket.assignee && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned To</div>
                  <div>{ticket.assignee.firstName} {ticket.assignee.lastName}</div>
                </div>
              )}
              {ticket.slaResponseAt && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SLA Response By</div>
                  <div>{new Date(ticket.slaResponseAt).toLocaleDateString()}</div>
                </div>
              )}
              {ticket.slaResolutionAt && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SLA Resolution By</div>
                  <div>{new Date(ticket.slaResolutionAt).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Description</h3>
            <div style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
          </div>
        </div>
      )}

      {ticket.resolution && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Resolution</h3>
          <div style={{ whiteSpace: 'pre-wrap' }}>{ticket.resolution}</div>
          {ticket.rootCause && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Root Cause: {ticket.rootCause}
            </p>
          )}
        </div>
      )}

      {ticket.comments && ticket.comments.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Comments</h3>
          <div className="flex flex-col gap-3">
            {ticket.comments.map(comment => (
              <div key={comment.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 500 }}>
                    {comment.author.firstName} {comment.author.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Add Comment</h3>
        <form onSubmit={handleAddComment}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <textarea
              className="form-textarea"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="Add a comment..."
              style={{ width: '100%' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submittingComment || !newComment.trim()}
          >
            {submittingComment ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Created: {new Date(ticket.createdAt).toLocaleDateString()}
        {ticket.updatedAt && ` • Updated: ${new Date(ticket.updatedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}
