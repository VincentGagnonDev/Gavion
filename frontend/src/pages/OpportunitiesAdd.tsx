import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunities } from '../services/api';
import type { OpportunityStage } from '../types';
import { PageSkeleton } from '../components/Skeleton';

export default function OpportunitiesAdd() {
  const [formData, setFormData] = useState({
    name: '',
    estimatedValue: '',
    expectedCloseDate: '',
    clientId: '',
    leadId: '',
    solutionType: '',
    stage: 'LEAD_INGESTION' as OpportunityStage,
    probability: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await opportunities.create({
        name: formData.name,
        estimatedValue: parseFloat(formData.estimatedValue),
        expectedCloseDate: formData.expectedCloseDate || undefined,
        clientId: formData.clientId || undefined,
        leadId: formData.leadId || undefined,
        solutionType: formData.solutionType || undefined,
        stage: formData.stage,
        probability: formData.probability
      });
      navigate('/opportunities');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <PageSkeleton />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Opportunity</h1>
        <p className="page-subtitle">Create a new sales opportunity</p>
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
              <label className="form-label">Opportunity Name *</label>
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
              <label className="form-label">Estimated Value ($) *</label>
              <input
                type="number"
                name="estimatedValue"
                className="form-input"
                min="0"
                step="0.01"
                value={formData.estimatedValue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Expected Close Date</label>
              <input
                type="date"
                name="expectedCloseDate"
                className="form-input"
                value={formData.expectedCloseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Client ID (optional)</label>
              <input
                type="text"
                name="clientId"
                className="form-input"
                value={formData.clientId}
                onChange={handleChange}
                placeholder="Link to existing client"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead ID (optional)</label>
              <input
                type="text"
                name="leadId"
                className="form-input"
                value={formData.leadId}
                onChange={handleChange}
                placeholder="Convert from lead"
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
                placeholder="e.g., AI Automation, Data Analytics"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stage</label>
              <select
                name="stage"
                className="form-select"
                value={formData.stage}
                onChange={handleChange}
              >
                <option value="LEAD_INGESTION">Lead Ingestion</option>
                <option value="QUALIFICATION">Qualification</option>
                <option value="DISCOVERY">Discovery</option>
                <option value="SOLUTION_DESIGN">Solution Design</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CLOSED_WON">Closed Won</option>
                <option value="CLOSED_LOST">Closed Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Probability (%)</label>
              <input
                type="number"
                name="probability"
                className="form-input"
                min="0"
                max="100"
                value={formData.probability}
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
              {loading ? 'Creating...' : 'Create Opportunity'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/opportunities')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
