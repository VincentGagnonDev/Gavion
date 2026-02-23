import { useState, useEffect } from 'react';
import { Briefcase, Users, Headphones, FolderKanban, TrendingUp, ArrowUpRight } from 'lucide-react';
import { analytics, projects } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [projectHealth, setProjectHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, projectData] = await Promise.all([
          analytics.getDashboard(),
          projects.getDashboard()
        ]);
        setStats(dashboardData);
        setProjectHealth(projectData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your business.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card stats-card">
          <div className="stats-icon primary">
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stats-value">{stats?.openOpportunities || 0}</div>
            <div className="stats-label">Open Opportunities</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon success">
            <FolderKanban size={24} />
          </div>
          <div>
            <div className="stats-value">{stats?.activeProjects || 0}</div>
            <div className="stats-label">Active Projects</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon warning">
            <Headphones size={24} />
          </div>
          <div>
            <div className="stats-value">{stats?.openTickets || 0}</div>
            <div className="stats-label">Open Tickets</div>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-icon danger">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stats-value">{stats?.upcomingMilestones || 0}</div>
            <div className="stats-label">Upcoming Milestones</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Project Health</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></span>
                Healthy
              </span>
              <span style={{ fontWeight: 600 }}>{projectHealth?.healthCounts?.GREEN || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }}></span>
                At Risk
              </span>
              <span style={{ fontWeight: 600 }}>{projectHealth?.healthCounts?.YELLOW || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }}></span>
                Critical
              </span>
              <span style={{ fontWeight: 600 }}>{projectHealth?.healthCounts?.RED || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="/leads" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <Users size={18} />
              Add New Lead
            </a>
            <a href="/opportunities" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <Briefcase size={18} />
              Create Opportunity
            </a>
            <a href="/projects" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <FolderKanban size={18} />
              Start New Project
            </a>
            <a href="/tickets" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <Headphones size={18} />
              View Support Tickets
            </a>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Active Projects</h3>
          <a href="/projects" className="btn btn-secondary btn-sm">
            View All <ArrowUpRight size={14} />
          </a>
        </div>
        {projectHealth?.projects?.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Status</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {projectHealth.projects.slice(0, 5).map((project: any) => (
                <tr key={project.id}>
                  <td style={{ fontWeight: 500 }}>{project.name}</td>
                  <td>{project.client?.name}</td>
                  <td>
                    <span className={`badge ${
                      project.healthStatus === 'GREEN' ? 'badge-success' :
                      project.healthStatus === 'YELLOW' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {project.healthStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: 60, 
                        height: 6, 
                        background: 'var(--border)', 
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${project.completionPercentage || 0}%`, 
                          height: '100%', 
                          background: 'var(--primary)' 
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>{project.completionPercentage || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No active projects</div>
        )}
      </div>
    </div>
  );
}
