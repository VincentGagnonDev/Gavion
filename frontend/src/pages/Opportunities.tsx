import { useState, useEffect } from 'react';
import { Search, Plus, DollarSign } from 'lucide-react';
import { opportunities } from '../services/api';

const stageLabels: Record<string, string> = {
  LEAD_INGESTION: 'Lead',
  QUALIFICATION: 'Qualification',
  DISCOVERY: 'Discovery',
  SOLUTION_DESIGN: 'Design',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Won',
  CLOSED_LOST: 'Lost'
};

export default function OpportunitiesPage() {
  const [oppsList, setOppsList] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'pipeline'>('pipeline');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [listData, pipelineData] = await Promise.all([
        opportunities.getAll({ limit: 50 }),
        opportunities.getPipeline()
      ]);
      setOppsList(listData.opportunities || []);
      setPipeline(pipelineData);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      LEAD_INGESTION: '#94a3b8',
      QUALIFICATION: '#60a5fa',
      DISCOVERY: '#34d399',
      SOLUTION_DESIGN: '#818cf8',
      PROPOSAL: '#fbbf24',
      NEGOTIATION: '#f97316',
      CLOSED_WON: '#10b981',
      CLOSED_LOST: '#ef4444'
    };
    return colors[stage] || '#94a3b8';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Sales Pipeline</h1>
          <p className="page-subtitle">Manage opportunities and track your sales progress</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          New Opportunity
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${view === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setView('pipeline')}
        >
          Pipeline View
        </button>
        <button 
          className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setView('list')}
        >
          List View
        </button>
      </div>

      {view === 'pipeline' ? (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {pipeline.map((stage) => (
            <div 
              key={stage.stage}
              style={{ 
                minWidth: 280, 
                background: 'var(--surface)', 
                borderRadius: '0.75rem', 
                border: '1px solid var(--border)',
                padding: '1rem'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: `3px solid ${getStageColor(stage.stage)}`
              }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stageLabels[stage.stage]}</h3>
                <span style={{ 
                  background: 'var(--background)', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {stage.count}
                </span>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Value: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{formatCurrency(stage.totalValue)}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Weighted: <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(stage.weightedValue)}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stage.opportunities?.slice(0, 5).map((opp: any) => (
                  <div 
                    key={opp.id}
                    style={{ 
                      padding: '0.75rem', 
                      background: 'var(--background)', 
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {opp.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{opp.client?.name || 'No client'}</span>
                      <span>{formatCurrency(opp.estimatedValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          {oppsList.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Client</th>
                  <th>Stage</th>
                  <th>Value</th>
                  <th>Probability</th>
                  <th>Expected Close</th>
                </tr>
              </thead>
              <tbody>
                {oppsList.map(opp => (
                  <tr key={opp.id}>
                    <td style={{ fontWeight: 500 }}>{opp.name}</td>
                    <td>{opp.client?.name || '-'}</td>
                    <td>
                      <span className={`badge ${
                        opp.stage === 'CLOSED_WON' ? 'badge-success' :
                        opp.stage === 'CLOSED_LOST' ? 'badge-danger' : 'badge-info'
                      }`}>
                        {stageLabels[opp.stage]}
                      </span>
                    </td>
                    <td>{formatCurrency(opp.estimatedValue)}</td>
                    <td>{opp.probability}%</td>
                    <td>{opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No opportunities found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
