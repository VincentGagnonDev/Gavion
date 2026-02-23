import { useState, useEffect } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { clients } from '../services/api';

export default function Clients() {
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
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

  const getStageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      PROSPECT: 'badge-info',
      ACTIVE_PROSPECT: 'badge-info',
      ONBOARDING: 'badge-warning',
      IMPLEMENTATION: 'badge-success',
      OPTIMIZATION: 'badge-success',
      RENEWAL: 'badge-warning',
      EXPANSION: 'badge-warning',
      INACTIVE: 'badge-danger'
    };
    return colors[stage] || 'badge-info';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client relationships and accounts</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Client
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} style={{ position: 'absolute', margin: '12px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="search-input"
          style={{ paddingLeft: '40px' }}
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {clientsList.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Size</th>
                <th>Stage</th>
                <th>Health</th>
                <th>Projects</th>
              </tr>
            </thead>
            <tbody>
              {clientsList.map(client => (
                <tr key={client.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{client.name}</div>
                  </td>
                  <td>{client.industry || '-'}</td>
                  <td>{client.size || '-'}</td>
                  <td>
                    <span className={`badge ${getStageBadge(client.lifecycleStage)}`}>
                      {client.lifecycleStage?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: 40, 
                        height: 6, 
                        background: 'var(--border)', 
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${client.healthScore}%`, 
                          height: '100%', 
                          background: client.healthScore >= 70 ? 'var(--success)' : client.healthScore >= 40 ? 'var(--warning)' : 'var(--danger)' 
                        }} />
                      </div>
                      <span>{client.healthScore}</span>
                    </div>
                  </td>
                  <td>{client._count?.projects || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
