import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, DollarSign } from 'lucide-react';
import { opportunities } from '../services/api';
import type { Opportunity, OpportunityStage } from '../types';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import { PageSkeleton } from '../components/Skeleton';

const stageLabels: Record<OpportunityStage, string> = {
  LEAD_INGESTION: 'Lead',
  QUALIFICATION: 'Qualification',
  DISCOVERY: 'Discovery',
  SOLUTION_DESIGN: 'Design',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Won',
  CLOSED_LOST: 'Lost'
};

const stageColors: Record<OpportunityStage, string> = {
  LEAD_INGESTION: '#94a3b8',
  QUALIFICATION: '#60a5fa',
  DISCOVERY: '#34d399',
  SOLUTION_DESIGN: '#818cf8',
  PROPOSAL: '#fbbf24',
  NEGOTIATION: '#f97316',
  CLOSED_WON: '#10b981',
  CLOSED_LOST: '#ef4444'
};

export default function OpportunitiesPage() {
  const [oppsList, setOppsList] = useState<Opportunity[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'pipeline'>('pipeline');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [listData, pipelineData] = await Promise.all([
        opportunities.getAll({ search, limit: 50 }),
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

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const getStageBadgeVariant = (stage: OpportunityStage) => {
    switch (stage) {
      case 'CLOSED_WON': return 'success';
      case 'CLOSED_LOST': return 'danger';
      default: return 'info';
    }
  };

  const columns = [
    { key: 'name', header: 'Opportunity' },
    { 
      key: 'client',
      header: 'Client',
      render: (opp: Opportunity) => opp.client?.name || '-'
    },
    {
      key: 'stage',
      header: 'Stage',
      render: (opp: Opportunity) => (
        <Badge variant={getStageBadgeVariant(opp.stage)}>
          {stageLabels[opp.stage]}
        </Badge>
      )
    },
    {
      key: 'estimatedValue',
      header: 'Value',
      render: (opp: Opportunity) => formatCurrency(opp.estimatedValue)
    },
    {
      key: 'probability',
      header: 'Probability',
      render: (opp: Opportunity) => `${opp.probability}%`
    },
    {
      key: 'expectedCloseDate',
      header: 'Expected Close',
      render: (opp: Opportunity) => opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Sales Pipeline</h1>
          <p className="page-subtitle">Manage opportunities and track your sales progress</p>
        </div>
         <button className="btn btn-primary" onClick={() => navigate('/opportunities/new')}>
           <Plus size={18} />
           New Opportunity
         </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex gap-2 mb-4">
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search opportunities..." />
      </div>

      {view === 'pipeline' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipeline.map((stage) => (
            <div 
              key={stage.stage}
              className="card"
              style={{ 
                minWidth: 280,
                padding: '1rem'
              }}
            >
               <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: `3px solid ${stageColors[stage.stage as OpportunityStage]}`
              }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stageLabels[stage.stage as OpportunityStage]}</h3>
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

               <div className="flex flex-col gap-2">
                 {stage.opportunities?.slice(0, 5).map((opp: Opportunity) => (
                   <div 
                     key={opp.id}
                     className="card"
                     style={{ 
                       padding: '0.75rem',
                       cursor: 'pointer'
                     }}
                     onClick={() => navigate(`/opportunities/${opp.id}`)}
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
             <DataTable 
               columns={columns}
               data={oppsList}
               onRowClick={(opp) => navigate(`/opportunities/${opp.id}`)}
             />
           ) : (
             <EmptyState 
               icon={<DollarSign size={48} />}
               title="No opportunities found"
               description="Create your first opportunity to start tracking."
               action={<button className="btn btn-primary" onClick={() => navigate('/opportunities/new')}>New Opportunity</button>}
             />
           )}
        </div>
      )}
    </div>
  );
}
