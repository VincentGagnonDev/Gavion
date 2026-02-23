import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FolderKanban, DollarSign } from 'lucide-react';
import { analytics } from '../services/api';

export default function Analytics() {
  const [salesData, setSalesData] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any>(null);
  const [clientsData, setClientsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sales, projects, clients] = await Promise.all([
        analytics.getSales(),
        analytics.getProjects(),
        analytics.getClients()
      ]);
      setSalesData(sales);
      setProjectsData(projects);
      setClientsData(clients);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Business insights and performance metrics</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card stats-card">
          <div className="stats-icon primary">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stats-value">{formatCurrency(salesData?.totalPipeline || 0)}</div>
            <div className="stats-label">Total Pipeline</div>
          </div>
        </div>
        <div className="card stats-card">
          <div className="stats-icon success">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stats-value">{salesData?.winRate || 0}%</div>
            <div className="stats-label">Win Rate</div>
          </div>
        </div>
        <div className="card stats-card">
          <div className="stats-icon warning">
            <FolderKanban size={24} />
          </div>
          <div>
            <div className="stats-value">{projectsData?.avgCompletion || 0}%</div>
            <div className="stats-label">Avg Completion</div>
          </div>
        </div>
        <div className="card stats-card">
          <div className="stats-icon primary">
            <Users size={24} />
          </div>
          <div>
            <div className="stats-value">{clientsData?.avgHealthScore || 0}</div>
            <div className="stats-label">Avg Health Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sales Pipeline</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {salesData?.pipelineByStage?.map((stage: any) => (
              <div key={stage.stage} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 100, fontSize: '0.875rem' }}>
                  {stage.stage.replace('_', ' ')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    height: 24, 
                    background: 'var(--background)', 
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'var(--primary)',
                      width: `${(stage.value / (salesData?.totalPipeline || 1)) * 100}%`,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '0.5rem'
                    }}>
                      <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 500 }}>
                        {stage.count} deals
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ width: 80, textAlign: 'right', fontSize: '0.875rem', fontWeight: 500 }}>
                  {formatCurrency(stage.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Project Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projectsData?.projectsByStatus?.map((status: any) => (
              <div key={status.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>{status.status.replace('_', ' ')}</span>
                <span style={{ 
                  background: 'var(--background)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  {status.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Client Distribution by Industry</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {clientsData?.clientsByIndustry?.slice(0, 5).map((item: any, index: number) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 120, fontSize: '0.875rem' }}>{item.industry}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    height: 20, 
                    background: 'var(--background)', 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'var(--success)',
                      width: `${(item.count / (clientsData?.totalClients || 1)) * 100}%`
                    }} />
                  </div>
                </div>
                <div style={{ width: 40, textAlign: 'right', fontSize: '0.875rem' }}>
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Client Lifecycle</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {clientsData?.clientsByStage?.map((stage: any) => (
              <div key={stage.stage} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem' }}>{stage.stage}</span>
                <span style={{ 
                  background: 'var(--background)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
