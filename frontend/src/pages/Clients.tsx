import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users } from 'lucide-react';
import { clients } from '../services/api';
import type { Client } from '../types';
import SearchBar from '../components/SearchBar';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { PageSkeleton } from '../components/Skeleton';

export default function Clients() {
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadClients = async () => {
    try {
      const data = await clients.getAll({ search, limit: 50 });
      setClientsList(data.clients || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'PROSPECT':
      case 'ACTIVE_PROSPECT':
        return 'info';
      case 'ONBOARDING':
      case 'RENEWAL':
      case 'EXPANSION':
        return 'warning';
      case 'IMPLEMENTATION':
      case 'OPTIMIZATION':
        return 'success';
      case 'INACTIVE':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'var(--success)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  const columns = [
    { key: 'name', header: 'Company' },
    { key: 'industry', header: 'Industry' },
    { key: 'size', header: 'Size' },
    {
      key: 'lifecycleStage',
      header: 'Stage',
      render: (client: Client) => (
        <Badge variant={getStageBadgeVariant(client.lifecycleStage)}>
          {client.lifecycleStage.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'healthScore',
      header: 'Health',
      render: (client: Client) => (
        <div className="flex items-center gap-2">
          <div style={{ 
            width: 40, 
            height: 6, 
            background: 'var(--border)', 
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${client.healthScore || 0}%`, 
              height: '100%', 
              background: getHealthColor(client.healthScore || 0) 
            }} />
          </div>
          <span>{client.healthScore || 0}</span>
        </div>
      )
    },
    {
      key: 'projects',
      header: 'Projects',
      render: (client: Client) => (
        <span>{client.projects?.length || 0}</span>
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
           <h1 className="page-title">Clients</h1>
           <p className="page-subtitle">Manage your client relationships and accounts</p>
         </div>
         <button className="btn btn-primary" onClick={() => navigate('/clients/new')}>
           <Plus size={18} />
           Add Client
         </button>
       </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar 
          value={search} 
          onChange={setSearch} 
          placeholder="Search clients..." 
        />
      </div>

      <div className="card">
        {clientsList.length > 0 ? (
          <DataTable 
            columns={columns}
            data={clientsList}
            onRowClick={(client) => navigate(`/clients/${client.id}`)}
          />
        ) : (
           <EmptyState 
             icon={<Users size={48} />}
             title="No clients found"
             description="Create your first client to get started."
             action={<button className="btn btn-primary" onClick={() => navigate('/clients/new')}>Add Client</button>}
           />
        )}
      </div>
    </div>
  );
}
