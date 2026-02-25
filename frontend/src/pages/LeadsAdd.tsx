import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { leads } from '../services/api';
import type { LeadStatus } from '../types';
import { PageSkeleton } from '../components/Skeleton';

export default function LeadsAdd() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    source: '',
    industry: '',
    companySize: '',
    budgetRange: '',
    timeline: '',
    needDescription: '',
    status: 'NEW' as LeadStatus
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await leads.create({
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        source: formData.source || undefined,
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
        budgetRange: formData.budgetRange || undefined,
        timeline: formData.timeline || undefined,
        needDescription: formData.needDescription || undefined
      });
      navigate('/leads');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create lead');
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
        <h1 className="page-title">Add New Lead</h1>
        <p className="page-subtitle">Capture new lead information</p>
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
                name="companyName"
                className="form-input"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Name *</label>
              <input
                type="text"
                name="contactName"
                className="form-input"
                value={formData.contactName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email *</label>
              <input
                type="email"
                name="contactEmail"
                className="form-input"
                value={formData.contactEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                className="form-input"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Source</label>
              <input
                type="text"
                name="source"
                className="form-input"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g., Website, Referral, Event"
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
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Size</label>
              <select
                name="companySize"
                className="form-select"
                value={formData.companySize}
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
              <label className="form-label">Budget Range</label>
              <select
                name="budgetRange"
                className="form-select"
                value={formData.budgetRange}
                onChange={handleChange}
              >
                <option value="">Select budget...</option>
                <option value="<$10k">&lt;$10k</option>
                <option value="$10k-$50k">$10k-$50k</option>
                <option value="$50k-$100k">$50k-$100k</option>
                <option value="$100k-$500k">$100k-$500k</option>
                <option value="$500k+">&gt;$500k</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timeline</label>
              <select
                name="timeline"
                className="form-select"
                value={formData.timeline}
                onChange={handleChange}
              >
                <option value="">Select timeline...</option>
                <option value="Immediate">Immediate</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="12+ months">12+ months</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="UNQUALIFIED">Unqualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Need Description</label>
              <textarea
                name="needDescription"
                className="form-textarea"
                value={formData.needDescription}
                onChange={handleChange}
                rows={4}
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
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/leads')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
