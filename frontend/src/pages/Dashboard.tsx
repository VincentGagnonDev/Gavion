import { useState, useEffect } from 'react';
import { Briefcase, Users, Headphones, FolderKanban, TrendingUp, ArrowRight } from 'lucide-react';
import { analytics, projects } from '../services/api';
import type { DashboardStats, ProjectHealth } from '../types';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { PageSkeleton } from '../components/Skeleton';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projectHealth, setProjectHealth] = useState<ProjectHealth | null>(null);
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
    return <PageSkeleton />;
  }

  // Define columns for active projects table
  const projectColumns = [
    { key: 'name', header: 'Project' },
    { key: 'client.name', header: 'Client' },
    { 
      key: 'healthStatus', 
      header: 'Status',
      render: (project: any) => {
        const variant = project.healthStatus === 'GREEN' ? 'success' : 
                       project.healthStatus === 'YELLOW' ? 'warning' : 'danger';
        return <Badge variant={variant}>{project.healthStatus}</Badge>;
      }
    },
    {
      key: 'completionPercentage',
      header: 'Completion',
      render: (project: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ProgressBar percent={project.completionPercentage || 0} variant="default" />
          <span style={{ fontSize: '0.75rem' }}>{project.completionPercentage || 0}%</span>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your business.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <StatCard 
          icon={<Briefcase size={24} />}
          value={stats?.openOpportunities || 0}
          label="Open Opportunities"
          variant="primary"
        />
        <StatCard 
          icon={<FolderKanban size={24} />}
          value={stats?.activeProjects || 0}
          label="Active Projects"
          variant="success"
        />
        <StatCard 
          icon={<Headphones size={24} />}
          value={stats?.openTickets || 0}
          label="Open Tickets"
          variant="warning"
        />
        <StatCard 
          icon={<TrendingUp size={24} />}
          value={stats?.upcomingMilestones || 0}
          label="Upcoming Milestones"
          variant="warning"
        />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Project Health</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }}></span>
                Healthy
              </span>
              <span style={{ fontWeight: 600 }}>{projectHealth?.healthCounts?.GREEN || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }}></span>
                At Risk
              </span>
              <span style={{ fontWeight: 600 }}>{projectHealth?.healthCounts?.YELLOW || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }}></span>
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
          <div className="flex flex-col gap-2">
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
            View All <ArrowRight size={14} />
          </a>
        </div>
        {projectHealth && projectHealth.projects && projectHealth.projects.length > 0 ? (
          <DataTable 
            columns={projectColumns}
            data={projectHealth.projects.slice(0, 5)}
          />
        ) : (
          <EmptyState 
            icon={<FolderKanban size={48} />}
            title="No active projects"
          />
        )}
      </div>
    </div>
  );
}
