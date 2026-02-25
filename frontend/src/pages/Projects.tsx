import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FolderKanban } from 'lucide-react';
import { projects } from '../services/api';
import type { Project, ProjectStatus } from '../types';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import { PageSkeleton } from '../components/Skeleton';

const statusLabels: Record<ProjectStatus, string> = {
  NOT_STARTED: 'Not Started',
  INITIATION: 'Initiation',
  DISCOVERY: 'Discovery',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  DEPLOYMENT: 'Deployment',
  OPTIMIZATION: 'Optimization',
  HANDOVER: 'Handover',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled'
};

const getStatusBadgeVariant = (status: ProjectStatus) => {
  switch (status) {
    case 'NOT_STARTED':
    case 'INITIATION':
    case 'DISCOVERY':
      return 'info';
    case 'DESIGN':
    case 'DEVELOPMENT':
    case 'DEPLOYMENT':
      return 'warning';
    case 'OPTIMIZATION':
    case 'HANDOVER':
    case 'COMPLETED':
      return 'success';
    case 'ON_HOLD':
    case 'CANCELLED':
      return 'danger';
    default:
      return 'default';
  }
};

const getHealthColor = (health: string) => {
  switch (health) {
    case 'GREEN': return 'var(--success)';
    case 'YELLOW': return 'var(--warning)';
    case 'RED': return 'var(--danger)';
    default: return 'var(--border)';
  }
};

export default function Projects() {
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      const data = await projects.getAll({ search, limit: 50 });
      setProjectsList(data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadProjects, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const columns = [
    { key: 'name', header: 'Project' },
    { 
      key: 'client',
      header: 'Client',
      render: (project: Project) => project.client?.name || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (project: Project) => (
        <Badge variant={getStatusBadgeVariant(project.status)}>
          {statusLabels[project.status]}
        </Badge>
      )
    },
    {
      key: 'healthStatus',
      header: 'Health',
      render: (project: Project) => (
        <Badge variant={
          project.healthStatus === 'GREEN' ? 'success' :
          project.healthStatus === 'YELLOW' ? 'warning' : 'danger'
        }>
          {project.healthStatus}
        </Badge>
      )
    },
    {
      key: 'completionPercentage',
      header: 'Progress',
      render: (project: Project) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ProgressBar percent={project.completionPercentage} variant="default" />
          <span style={{ fontSize: '0.75rem' }}>{project.completionPercentage}%</span>
        </div>
      )
    },
    {
      key: 'projectManager',
      header: 'Manager',
      render: (project: Project) => `${project.projectManager?.firstName || ''} ${project.projectManager?.lastName || ''}`
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (project: Project) => project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Track AI integration project progress</p>
        </div>
         <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
           <Plus size={18} />
           New Project
         </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar 
          value={search} 
          onChange={setSearch} 
          placeholder="Search projects..." 
        />
      </div>

      <div className="card">
        {projectsList.length > 0 ? (
           <DataTable 
             columns={columns}
             data={projectsList}
             onRowClick={(project) => navigate(`/projects/${project.id}`)}
           />
        ) : (
          <EmptyState 
            icon={<FolderKanban size={48} />}
            title="No projects found"
            description="Start by creating your first project."
            action={<button className="btn btn-primary" onClick={() => navigate('/projects/new')}>New Project</button>}
          />
        )}
      </div>
    </div>
  );
}
