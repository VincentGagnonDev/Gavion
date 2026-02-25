import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, FolderKanban, Users, Calendar, DollarSign, FileText } from 'lucide-react';
import { projects } from '../services/api';
import type { Project } from '../types';
import { PageSkeleton } from '../components/Skeleton';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';

export default function ProjectsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    opportunityId: '',
    projectManagerId: '',
    description: '',
    solutionType: '',
    status: 'NOT_STARTED' as any,
    startDate: '',
    endDate: '',
    budget: '',
    actualCost: '',
    healthStatus: 'GREEN' as 'GREEN' | 'YELLOW' | 'RED',
    completionPercentage: 0
  });

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projects.getById(id!);
      setProject(data);
      setFormData({
        name: data.name,
        clientId: data.clientId,
        opportunityId: data.opportunityId || '',
        projectManagerId: data.projectManagerId || '',
        description: data.description || '',
        solutionType: data.solutionType || '',
        status: data.status,
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        budget: data.budget.toString(),
        actualCost: data.actualCost?.toString() || '',
        healthStatus: data.healthStatus,
        completionPercentage: data.completionPercentage
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projects.update(id!, {
        name: formData.name,
        clientId: formData.clientId,
        opportunityId: formData.opportunityId || undefined,
        projectManagerId: formData.projectManagerId || undefined,
        description: formData.description || undefined,
        solutionType: formData.solutionType || undefined,
        status: formData.status,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        budget: parseFloat(formData.budget),
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
        healthStatus: formData.healthStatus,
        completionPercentage: formData.completionPercentage
      });
      setIsEditing(false);
      await loadProject();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update project');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
      case 'INITIATION':
      case 'DISCOVERY': return 'info';
      case 'DESIGN':
      case 'DEVELOPMENT':
      case 'DEPLOYMENT': return 'warning';
      case 'OPTIMIZATION':
      case 'HANDOVER':
      case 'COMPLETED': return 'success';
      case 'ON_HOLD':
      case 'CANCELLED': return 'danger';
      default: return 'default';
    }
  };

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

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'GREEN': return 'var(--success)';
      case 'YELLOW': return 'var(--warning)';
      case 'RED': return 'var(--danger)';
      default: return 'var(--border)';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  if (loading) return <PageSkeleton />;

  if (!project) {
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            <ArrowLeft size={18} /> Back to Projects
          </button>
        </div>
        <div className="card">
          <p>Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-subtitle">
            <Badge variant={getStatusBadgeVariant(project.status)}>{statusLabels[project.status]}</Badge>
            {' • '}Health: <Badge variant={project.healthStatus === 'GREEN' ? 'success' : project.healthStatus === 'YELLOW' ? 'warning' : 'danger'}>{project.healthStatus}</Badge>
          </p>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <Edit2 size={18} /> Edit
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client ID *</label>
                <input
                  type="text"
                  name="clientId"
                  className="form-input"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Opportunity ID</label>
                <input
                  type="text"
                  name="opportunityId"
                  className="form-input"
                  value={formData.opportunityId}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Manager ID</label>
                <input
                  type="text"
                  name="projectManagerId"
                  className="form-input"
                  value={formData.projectManagerId}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Solution Type</label>
                <input
                  type="text"
                  name="solutionType"
                  className="form-input"
                  value={formData.solutionType}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="INITIATION">Initiation</option>
                  <option value="DISCOVERY">Discovery</option>
                  <option value="DESIGN">Design</option>
                  <option value="DEVELOPMENT">Development</option>
                  <option value="DEPLOYMENT">Deployment</option>
                  <option value="OPTIMIZATION">Optimization</option>
                  <option value="HANDOVER">Handover</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Health Status</label>
                <select
                  name="healthStatus"
                  className="form-select"
                  value={formData.healthStatus}
                  onChange={handleChange}
                >
                  <option value="GREEN">Green</option>
                  <option value="YELLOW">Yellow</option>
                  <option value="RED">Red</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-input"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Budget ($) *</label>
                <input
                  type="number"
                  name="budget"
                  className="form-input"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Actual Cost</label>
                <input
                  type="number"
                  name="actualCost"
                  className="form-input"
                  min="0"
                  step="0.01"
                  value={formData.actualCost}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Completion Percentage (%)</label>
                <input
                  type="number"
                  name="completionPercentage"
                  className="form-input"
                  min="0"
                  max="100"
                  value={formData.completionPercentage}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" style={{ marginRight: '1rem' }}>
                Save Changes
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Details</h3>
            <div className="flex flex-col gap-3">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                <Badge variant={getStatusBadgeVariant(project.status)}>
                  {statusLabels[project.status]}
                </Badge>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health</div>
                <Badge variant={project.healthStatus === 'GREEN' ? 'success' : project.healthStatus === 'YELLOW' ? 'warning' : 'danger'}>
                  {project.healthStatus}
                </Badge>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progress</div>
                <div className="flex items-center gap-2">
                  <ProgressBar percent={project.completionPercentage} variant="default" />
                  <span>{project.completionPercentage}%</span>
                </div>
              </div>
              {project.solutionType && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solution Type</div>
                  <div>{project.solutionType}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget</div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  <span style={{ fontWeight: 600 }}>{formatCurrency(project.budget)}</span>
                </div>
              </div>
              {project.actualCost && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actual Cost</div>
                  <div>{formatCurrency(project.actualCost)}</div>
                </div>
              )}
              {project.client && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client</div>
                  <div>{project.client.name}</div>
                </div>
              )}
              {project.projectManager && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Manager</div>
                  <div>{project.projectManager.firstName} {project.projectManager.lastName}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Timeline</h3>
            <div className="flex flex-col gap-3">
              {project.startDate && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start Date</div>
                  <div>{new Date(project.startDate).toLocaleDateString()}</div>
                </div>
              )}
              {project.endDate && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>End Date</div>
                  <div>{new Date(project.endDate).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {project.description && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Description</h3>
          <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{project.description}</p>
        </div>
      )}

      {project.milestones && project.milestones.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Milestones</h3>
          </div>
          <div className="flex flex-col gap-2">
            {project.milestones.map(milestone => (
              <div key={milestone.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 500 }}>{milestone.name}</div>
                  <Badge variant={milestone.status === 'COMPLETED' ? 'success' : milestone.status === 'DELAYED' || milestone.status === 'CANCELLED' ? 'danger' : 'info'}>
                    {milestone.status.replace('_', ' ')}
                  </Badge>
                </div>
                {milestone.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{milestone.description}</p>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {milestone.plannedStartDate && <span>Start: {new Date(milestone.plannedStartDate).toLocaleDateString()}</span>}
                  {milestone.plannedEndDate && <span>End: {new Date(milestone.plannedEndDate).toLocaleDateString()}</span>}
                  <span>{milestone.completionPercentage}% complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.tasks && project.tasks.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Tasks</h3>
          </div>
          <div className="flex flex-col gap-2">
            {project.tasks.map(task => (
              <div key={task.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 500 }}>{task.title}</div>
                  <Badge variant={
                    task.status === 'COMPLETE' ? 'success' :
                    task.status === 'BLOCKED' ? 'danger' :
                    task.status === 'IN_PROGRESS' ? 'warning' : 'info'
                  }>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                {task.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{task.description}</p>
                )}
                {task.assignee && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Assigned to: {task.assignee.firstName} {task.assignee.lastName}
                  </div>
                )}
                {task.dueDate && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Created: {new Date(project.createdAt).toLocaleDateString()}
        {project.updatedAt && ` • Updated: ${new Date(project.updatedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}
