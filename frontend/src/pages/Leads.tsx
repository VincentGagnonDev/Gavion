import { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp } from 'lucide-react';
import { leads } from '../services/api';

export default function Leads() {
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLeads();
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

  const getScoreBadge = (tier: string) => {
    const colors: Record<string, string> = {
      Hot: 'badge-danger',
      Warm: 'badge-warning',
      Cold: 'badge-info'
    };
    return colors[tier] || 'badge-info';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      NEW: 'badge-info',
      CONTACTED: 'badge-warning',
      QUALIFIED: 'badge-success',
      CONVERTED: 'badge-success',
      LOST: 'badge-danger',
      UNQUALIFIED: 'badge-danger'
    };
    return colors[status] || 'badge-info';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Track and manage your sales leads</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Add Lead
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} style={{ position: 'absolute', margin: '12px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="search-input"
          style={{ paddingLeft: '40px' }}
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {leadsList.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Industry</th>
                <th>Score</th>
                <th>Status</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {leadsList.map(lead => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 500 }}>{lead.companyName}</td>
                  <td>
                    <div>{lead.contactName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.contactEmail}</div>
                  </td>
                  <td>{lead.source}</td>
                  <td>{lead.industry || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={14} />
                      <span className={`badge ${getScoreBadge(lead.scoreTier)}`}>
                        {lead.scoreTier} ({lead.leadScore})
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.owner?.firstName} {lead.owner?.lastName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No leads found</p>
          </div>
        )}
      </div>
    </div>
  );
}
