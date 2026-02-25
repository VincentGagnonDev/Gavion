import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, TrendingUp } from 'lucide-react';
import { leads } from '../services/api';
import type { Lead } from '../types';
import SearchBar from '../components/SearchBar';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { PageSkeleton } from '../components/Skeleton';

export default function Leads() {
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadLeads = async () => {
    try {
      const data = await leads.getAll({ search, limit: 50 });
      setLeadsList(data.leads || []);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'HOT': return 'danger';
      case 'WARM': return 'warning';
      case 'COLD': return 'info';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'CONTACTED':
        return 'info';
      case 'QUALIFIED':
      case 'CONVERTED':
        return 'success';
      case 'LOST':
      case 'UNQUALIFIED':
        return 'danger';
      default:
        return 'default';
    }
  };

  const columns = [
    { key: 'companyName', header: 'Company' },
    { 
      key: 'contactName',
      header: 'Contact',
      render: (lead: Lead) => (
        <div>
          <div>{lead.contactName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.contactEmail}</div>
        </div>
      )
    },
    { key: 'source', header: 'Source' },
    { key: 'industry', header: 'Industry', render: (lead: Lead) => lead.industry || '-' },
    {
      key: 'leadScore',
      header: 'Score',
      render: (lead: Lead) => (
        <div className="flex items-center gap-2">
          <TrendingUp size={14} />
          <Badge variant={getScoreBadgeVariant(lead.scoreTier)}>
            {lead.scoreTier} ({lead.leadScore})
          </Badge>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead: Lead) => (
        <Badge variant={getStatusBadgeVariant(lead.status)}>
          {lead.status}
        </Badge>
      )
    },
    {
      key: 'owner',
      header: 'Owner',
      render: (lead: Lead) => `${lead.owner?.firstName || ''} ${lead.owner?.lastName || ''}`
    }
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Track and manage your sales leads</p>
        </div>
         <button className="btn btn-primary" onClick={() => navigate('/leads/new')}>
           <Plus size={18} />
           Add Lead
         </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar 
          value={search} 
          onChange={setSearch} 
          placeholder="Search leads..." 
        />
      </div>

      <div className="card">
        {leadsList.length > 0 ? (
           <DataTable 
             columns={columns}
             data={leadsList}
             onRowClick={(lead) => navigate(`/leads/${lead.id}`)}
           />
        ) : (
            <EmptyState 
              icon={<TrendingUp size={48} />}
              title="No leads found"
              description="Start by adding your first lead."
              action={<button className="btn btn-primary" onClick={() => navigate('/leads/new')}>Add Lead</button>}
            />
        )}
      </div>
    </div>
  );
}
