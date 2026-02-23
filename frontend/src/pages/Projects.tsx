import { useState, useEffect } from 'react';
import { Search, Plus, FolderKanban } from 'lucide-react';
import { projects } from '../services/api';

const statusLabels: Record<string, string> = {
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

export default function Projects() {
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProjects();
  }, [search]);

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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      NOT_STARTED: 'badge-info',
      INITIATION: 'badge-info',
      DISCOVERY: 'badge-info',
      DESIGN: 'badge-warning',
      DEVELOPMENT: 'badge-warning',
      DEPLOYMENT: 'badge-warning',
      OPTIMIZATION: 'badge-success',
      HANDOVER: 'badge-success',
      COMPLETED: 'badge-success',
      ON_HOLD: 'badge-danger',
      CANCELLED: 'badge-danger'
    };
    return colors[status] || 'badge-info';
  };

  const getHealthBadge = (health: string) => {
    const colors: Record<string, string> = {
      GREEN: 'badge-success',
      YELLOW: 'badge-warning',
      RED: 'badge-danger'
    };
    return colors[health] || 'badge-info';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Track AI integration project progress</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} style={{ position: 'absolute', margin: '12px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="search-input"
          style={{ paddingLeft: '40px' }}
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {projectsList.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Status</th>
                <th>Health</th>
                <th>Progress</th>
                <th>Manager</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {projectsList.map(project => (
                <tr key={project.id}>
                  <td style={{ fontWeight: 500 }}>{project.name}</td>
                  <td>{project.client?.name}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(project.status)}`}>
                      {statusLabels[project.status]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getHealthBadge(project.healthStatus)}`}>
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
                          width: `${project.completionPercentage}%`, 
                          height: '100%', 
                          background: project.healthStatus === 'GREEN' ? 'var(--success)' : project.healthStatus === 'YELLOW' ? 'var(--warning)' : 'var(--danger)'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>{project.completionPercentage}%</span>
                    </div>
                  </td>
                  <td>{project.projectManager?.firstName} {project.projectManager?.lastName}</td>
                  <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <FolderKanban size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}
