import { useState, useEffect } from 'react';
import { Search, Plus, Headphones, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { tickets } from '../services/api';

const severityColors: Record<string, string> = {
  CRITICAL: 'var(--danger)',
  HIGH: '#f97316',
  MEDIUM: 'var(--warning)',
  LOW: 'var(--success)'
};

export default function Tickets() {
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ticketsData, statsData] = await Promise.all([
        tickets.getAll({ limit: 50 }),
        tickets.getStats()
      ]);
      setTicketsList(ticketsData.tickets || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'badge-danger',
      ASSIGNED: 'badge-warning',
      IN_PROGRESS: 'badge-warning',
      PENDING_CLIENT: 'badge-info',
      RESOLVED: 'badge-success',
      CLOSED: 'badge-success'
    };
    return colors[status] || 'badge-info';
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'badge-danger',
      HIGH: 'badge-warning',
      MEDIUM: 'badge-info',
      LOW: 'badge-success'
    };
    return colors[severity] || 'badge-info';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Manage client support requests</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          New Ticket
        </button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card stats-card">
          <div className="stats-icon danger">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="stats-value">{stats?.openTickets || 0}</div>
            <div className="stats-label">Open Tickets</div>
          </div>
        </div>
        <div className="card stats-card">
          <div className="stats-icon warning">
            <Clock size={24} />
          </div>
          <div>
            <div className="stats-value">{stats?.bySeverity?.CRITICAL || 0}</div>
            <div className="stats-label">Critical</div>
          </div>
        </div>
        <div className="card stats-card">
          <div className="stats-icon primary">
            <Headphones size={24} />
          </div>
          <div>
            <div className="stats-value">{stats?.bySeverity?.HIGH || 0}</div>
            <div className="stats-label">High Priority</div>
          </div>
        </div>
        <div className="card stats-card">
          <div className="stats-icon success">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stats-value">{stats?.byStatus?.RESOLVED || 0}</div>
            <div className="stats-label">Resolved</div>
          </div>
        </div>
      </div>

      <div className="card">
        {ticketsList.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Title</th>
                <th>Client</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {ticketsList.map(ticket => (
                <tr key={ticket.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                    {ticket.ticketNumber}
                  </td>
                  <td style={{ fontWeight: 500 }}>{ticket.title}</td>
                  <td>{ticket.client?.name}</td>
                  <td>{ticket.type?.replace('_', ' ')}</td>
                  <td>
                    <span className={`badge ${getSeverityBadge(ticket.severity)}`}>
                      {ticket.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(ticket.status)}`}>
                      {ticket.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Headphones size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No tickets found</p>
          </div>
        )}
      </div>
    </div>
  );
}
