import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clients } from '../services/api';
import type { ClientLifecycleStage } from '../types';
import { PageSkeleton } from '../components/Skeleton';

export default function ClientsAdd() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    legalName: '',
    industry: '',
    size: '',
    phone: '',
    website: '',
    aiReadinessScore: '',
    healthScore: '100',
    lifecycleStage: 'PROSPECT' as ClientLifecycleStage
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await clients.create({
        name: formData.name,
        email: formData.email || undefined,
        legalName: formData.legalName || undefined,
        industry: formData.industry || undefined,
        size: formData.size || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        aiReadinessScore: formData.aiReadinessScore ? parseInt(formData.aiReadinessScore) : undefined,
        healthScore: parseInt(formData.healthScore),
        lifecycleStage: formData.lifecycleStage
      });
      navigate('/clients');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create client');
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
        <h1 className="page-title">Add New Client</h1>
        <p className="page-subtitle">Create a new client account</p>
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
              <label className="form-label">Company Name *</label>
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
              <label className="form-label">Legal Name (optional)</label>
              <input
                type="text"
                name="legalName"
                className="form-input"
                value={formData.legalName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry</label>
              <input
                type="text"
                name="industry"
                className="form-input"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Size</label>
              <select
                name="size"
                className="form-select"
                value={formData.size}
                onChange={handleChange}
              >
                <option value="">Select size...</option>
                <option value="1-50">1-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1001-5000">1001-5000</option>
                <option value="5000+">5000+</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                name="website"
                className="form-input"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://"
              />
            </div>

            <div className="form-group">
              <label className="form-label">AI Readiness Score (0-100)</label>
              <input
                type="number"
                name="aiReadinessScore"
                className="form-input"
                min="0"
                max="100"
                value={formData.aiReadinessScore}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Health Score (0-100)</label>
              <input
                type="number"
                name="healthScore"
                className="form-input"
                min="0"
                max="100"
                value={formData.healthScore}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lifecycle Stage</label>
              <select
                name="lifecycleStage"
                className="form-select"
                value={formData.lifecycleStage}
                onChange={handleChange}
              >
                <option value="PROSPECT">Prospect</option>
                <option value="ACTIVE_PROSPECT">Active Prospect</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="IMPLEMENTATION">Implementation</option>
                <option value="OPTIMIZATION">Optimization</option>
                <option value="RENEWAL">Renewal</option>
                <option value="EXPANSION">Expansion</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginRight: '1rem' }}
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/clients')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
