import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Briefcase, TrendingUp } from 'lucide-react';
import { leads } from '../services/api';
import type { Lead } from '../types';
import { PageSkeleton } from '../components/Skeleton';
import Badge from '../components/Badge';

export default function LeadsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
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
    status: 'NEW' as any
  });

  useEffect(() => {
    if (id) loadLead();
  }, [id]);

  const loadLead = async () => {
    try {
      const data = await leads.getById(id!);
      setLead(data);
      setFormData({
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || '',
        source: data.source || '',
        industry: data.industry || '',
        companySize: data.companySize || '',
        budgetRange: data.budgetRange || '',
        timeline: data.timeline || '',
        needDescription: data.needDescription || '',
        status: data.status
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leads.update(id!, formData);
      setIsEditing(false);
      await loadLead();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update lead');
    }
  };

  const handleConvert = async () => {
    const name = prompt('Opportunity name:', lead?.companyName);
    if (!name) return;
    const value = prompt('Estimated value ($):');
    if (!value) return;

    try {
      await leads.convert(id!, {
        name,
        estimatedValue: parseFloat(value)
      });
      navigate('/opportunities');
    } catch (err: any) {
      alert('Failed to convert: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleMarkLost = async () => {
    const reason = prompt('Loss reason (optional):') || undefined;
    try {
      await leads.markLost(id!, { lossReason: reason });
      await loadLead();
    } catch (err: any) {
      alert('Failed to mark lost: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'CONTACTED': return 'info';
      case 'QUALIFIED':
      case 'CONVERTED': return 'success';
      case 'LOST':
      case 'UNQUALIFIED': return 'danger';
      default: return 'default';
    }
  };

  if (loading) return <PageSkeleton />;

  if (!lead) {
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => navigate('/leads')}>
            <ArrowLeft size={18} /> Back to Leads
          </button>
        </div>
        <div className="card"><p>Lead not found</p></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leads')} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">{lead.companyName}</h1>
          <p className="page-subtitle">
            <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status.replace('_', ' ')}</Badge>
            {' • '}Score: {lead.leadScore} ({lead.scoreTier})
          </p>
        </div>
        {!isEditing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => handleConvert()}>
              <Briefcase size={18} /> Convert to Opportunity
            </button>
            {lead.status !== 'LOST' && (
              <button className="btn btn-danger" onClick={() => handleMarkLost()}>
                Mark Lost
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} /> Edit
            </button>
          </div>
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
        <div className="card">
          <div className="grid grid-2" style={{ gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Contact Information</h3>
              <div className="flex flex-col gap-2">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact Name</div>
                  <div>{lead.contactName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
                  <div>{lead.contactEmail}</div>
                </div>
                {lead.contactPhone && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</div>
                    <div>{lead.contactPhone}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Lead Details</h3>
              <div className="flex flex-col gap-2">
                {lead.source && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source</div>
                    <div>{lead.source}</div>
                  </div>
                )}
                {lead.industry && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Industry</div>
                    <div>{lead.industry}</div>
                  </div>
                )}
                {lead.companySize && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Company Size</div>
                    <div>{lead.companySize} employees</div>
                  </div>
                )}
                {lead.budgetRange && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget Range</div>
                    <div>{lead.budgetRange}</div>
                  </div>
                )}
                {lead.timeline && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timeline</div>
                    <div>{lead.timeline}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {lead.needDescription && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Need Description</h3>
              <p style={{ color: 'var(--text-muted)' }}>{lead.needDescription}</p>
            </div>
          )}

          {lead.opportunities && lead.opportunities.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Opportunities</h3>
              <div className="flex flex-col gap-2">
                {lead.opportunities.map(opp => (
                  <div key={opp.id} className="card" style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{opp.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      ${opp.estimatedValue?.toLocaleString()} • {opp.stage}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Created: {new Date(lead.createdAt).toLocaleDateString()}
            {lead.updatedAt && ` • Updated: ${new Date(lead.updatedAt).toLocaleDateString()}`}
          </div>
        </div>
      )}
    </div>
  );
}
