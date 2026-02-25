import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Headphones, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { tickets } from '../services/api';
import type { Ticket, TicketStatus, TicketSeverity } from '../types';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import { PageSkeleton } from '../components/Skeleton';

const severityColors: Record<TicketSeverity, string> = {
  CRITICAL: 'var(--danger)',
  HIGH: '#f97316',
  MEDIUM: 'var(--warning)',
  LOW: 'var(--success)'
};

export default function Tickets() {
  const [ticketsList, setTicketsList] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<{ openTickets: number; bySeverity: Record<string, number>; byStatus: Record<string, number> }>({ openTickets: 0, bySeverity: {}, byStatus: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case 'NEW':
        return 'danger';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'warning';
      case 'PENDING_CLIENT':
        return 'info';
      case 'RESOLVED':
      case 'CLOSED':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSeverityBadgeVariant = (severity: TicketSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Ticket #',
      render: (ticket: Ticket) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          {ticket.id.substring(0, 8)}
        </span>
      )
    },
    { key: 'title', header: 'Title' },
    { 
      key: 'client',
      header: 'Client',
      render: (ticket: Ticket) => ticket.client?.name || '-'
    },
    {
      key: 'type',
      header: 'Type',
      render: (ticket: Ticket) => ticket.type?.replace('_', ' ') || '-'
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (ticket: Ticket) => (
        <Badge variant={getSeverityBadgeVariant(ticket.severity)}>
          {ticket.severity}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (ticket: Ticket) => (
        <Badge variant={getStatusBadgeVariant(ticket.status)}>
          {ticket.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (ticket: Ticket) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="page-subtitle">Manage client support requests</p>
        </div>
         <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
           <Plus size={18} />
           New Ticket
         </button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard 
          icon={<AlertCircle size={24} />}
          value={stats.openTickets || 0}
          label="Open Tickets"
          variant="danger"
        />
        <StatCard 
          icon={<Clock size={24} />}
          value={stats.bySeverity?.CRITICAL || 0}
          label="Critical"
          variant="warning"
        />
        <StatCard 
          icon={<Headphones size={24} />}
          value={stats.bySeverity?.HIGH || 0}
          label="High Priority"
          variant="primary"
        />
        <StatCard 
          icon={<CheckCircle size={24} />}
          value={stats.byStatus?.RESOLVED || 0}
          label="Resolved"
          variant="success"
        />
      </div>

      <div className="card">
        {ticketsList.length > 0 ? (
           <DataTable 
             columns={columns}
             data={ticketsList}
             onRowClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
           />
        ) : (
          <EmptyState 
            icon={<Headphones size={48} />}
            title="No tickets found"
            description="All caught up!"
          />
        )}
      </div>
    </div>
  );
}
