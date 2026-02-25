import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Briefcase, User, Calendar, DollarSign, FileText } from 'lucide-react';
import { opportunities } from '../services/api';
import type { Opportunity } from '../types';
import { PageSkeleton } from '../components/Skeleton';
import Badge from '../components/Badge';

export default function OpportunitiesDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    estimatedValue: '',
    expectedCloseDate: '',
    clientId: '',
    leadId: '',
    solutionType: '',
    stage: 'LEAD_INGESTION' as any,
    probability: 10,
    nextStep: '',
    nextStepDate: ''
  });

  useEffect(() => {
    if (id) loadOpportunity();
  }, [id]);

  const loadOpportunity = async () => {
    try {
      const data = await opportunities.getById(id!);
      setOpportunity(data);
      setFormData({
        name: data.name,
        estimatedValue: data.estimatedValue.toString(),
        expectedCloseDate: data.expectedCloseDate || '',
        clientId: data.clientId || '',
        leadId: data.leadId || '',
        solutionType: data.solutionType || '',
        stage: data.stage,
        probability: data.probability,
        nextStep: data.nextStep || '',
        nextStepDate: data.nextStepDate || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await opportunities.update(id!, {
        name: formData.name,
        estimatedValue: parseFloat(formData.estimatedValue),
        expectedCloseDate: formData.expectedCloseDate || undefined,
        clientId: formData.clientId || undefined,
        leadId: formData.leadId || undefined,
        solutionType: formData.solutionType || undefined,
        stage: formData.stage,
        probability: formData.probability,
        nextStep: formData.nextStep || undefined,
        nextStepDate: formData.nextStepDate || undefined
      });
      setIsEditing(false);
      await loadOpportunity();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update opportunity');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'CLOSED_WON': return 'success';
      case 'CLOSED_LOST': return 'danger';
      default: return 'info';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  const stageLabels: Record<string, string> = {
    LEAD_INGESTION: 'Lead',
    QUALIFICATION: 'Qualification',
    DISCOVERY: 'Discovery',
    SOLUTION_DESIGN: 'Design',
    PROPOSAL: 'Proposal',
    NEGOTIATION: 'Negotiation',
    CLOSED_WON: 'Won',
    CLOSED_LOST: 'Lost'
  };

  if (loading) return <PageSkeleton />;

  if (!opportunity) {
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => navigate('/opportunities')}>
            <ArrowLeft size={18} /> Back to Opportunities
          </button>
        </div>
        <div className="card">
          <p>Opportunity not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/opportunities')} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">{opportunity.name}</h1>
          <p className="page-subtitle">
            <Badge variant={getStageBadgeVariant(opportunity.stage)}>{stageLabels[opportunity.stage]}</Badge>
            {' • '}{formatCurrency(opportunity.estimatedValue)}
            {opportunity.expectedCloseDate && ` • Expected: ${new Date(opportunity.expectedCloseDate).toLocaleDateString()}`}
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
                <label className="form-label">Client ID</label>
                <input
                  type="text"
                  name="clientId"
                  className="form-input"
                  value={formData.clientId}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead ID</label>
                <input
                  type="text"
                  name="leadId"
                  className="form-input"
                  value={formData.leadId}
                  onChange={handleChange}
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

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Next Step</label>
                <input
                  type="text"
                  name="nextStep"
                  className="form-input"
                  value={formData.nextStep}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Step Date</label>
                <input
                  type="date"
                  name="nextStepDate"
                  className="form-input"
                  value={formData.nextStepDate}
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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stage</div>
                <Badge variant={getStageBadgeVariant(opportunity.stage)}>
                  {stageLabels[opportunity.stage]}
                </Badge>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Value</div>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  <span style={{ fontWeight: 600 }}>{formatCurrency(opportunity.estimatedValue)}</span>
                </div>
              </div>
              {opportunity.expectedCloseDate && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Close Date</div>
                  <div>{new Date(opportunity.expectedCloseDate).toLocaleDateString()}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Probability</div>
                <div>{opportunity.probability}%</div>
              </div>
              {opportunity.weightedValue && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weighted Value</div>
                  <div>{formatCurrency(opportunity.weightedValue)}</div>
                </div>
              )}
              {opportunity.solutionType && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solution Type</div>
                  <div>{opportunity.solutionType}</div>
                </div>
              )}
              {opportunity.client && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client</div>
                  <div>{opportunity.client.name}</div>
                </div>
              )}
              {opportunity.lead && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead</div>
                  <div>{opportunity.lead.companyName}</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Next Actions</h3>
            <div className="flex flex-col gap-3">
              {opportunity.nextStep ? (
                <>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Step</div>
                    <div>{opportunity.nextStep}</div>
                  </div>
                  {opportunity.nextStepDate && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date</div>
                      <div>{new Date(opportunity.nextStepDate).toLocaleDateString()}</div>
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No next step defined</p>
              )}
            </div>
          </div>
        </div>
      )}

      {opportunity.proposals && opportunity.proposals.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Proposals</h3>
          </div>
          <div className="flex flex-col gap-2">
            {opportunity.proposals.map(prop => (
              <div key={prop.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600 }}>Version {prop.version}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>{formatCurrency(prop.amount)}</span>
                  <span>{prop.validityPeriod ? `Valid until ${new Date(prop.validityPeriod).toLocaleDateString()}` : 'No expiry'}</span>
                </div>
                {prop.terms && (
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>{prop.terms}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Created: {new Date(opportunity.createdAt).toLocaleDateString()}
        {opportunity.updatedAt && ` • Updated: ${new Date(opportunity.updatedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}
