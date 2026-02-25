import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../services/api';
import type { ProjectStatus } from '../types';
import { PageSkeleton } from '../components/Skeleton';

export default function ProjectsAdd() {
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    opportunityId: '',
    projectManagerId: '',
    description: '',
    solutionType: '',
    status: 'NOT_STARTED' as ProjectStatus,
    startDate: '',
    endDate: '',
    budget: '',
    actualCost: '',
    healthStatus: 'GREEN' as 'GREEN' | 'YELLOW' | 'RED',
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await projects.create({
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
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Project</h1>
        <p className="page-subtitle">Create a new AI integration project</p>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
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
              <label className="form-label">Opportunity ID (optional)</label>
              <input
                type="text"
                name="opportunityId"
                className="form-input"
                value={formData.opportunityId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Manager ID (optional)</label>
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
              <label className="form-label">Actual Cost (optional)</label>
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginRight: '1rem' }}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
