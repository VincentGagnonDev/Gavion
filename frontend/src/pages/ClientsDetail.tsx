import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Users, FolderKanban, Briefcase, Headphones } from 'lucide-react';
import { clients } from '../services/api';
import type { Client, Contact } from '../types';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import { PageSkeleton } from '../components/Skeleton';

export default function ClientsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    size: '',
    phone: '',
    website: '',
    healthScore: 100,
    aiReadinessScore: 0,
    lifecycleStage: 'PROSPECT' as any
  });

  useEffect(() => {
    if (id) loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      const data = await clients.getById(id!);
      setClient(data);
      setFormData({
        name: data.name,
        email: data.email || '',
        industry: data.industry || '',
        size: data.size || '',
        phone: data.phone || '',
        website: data.website || '',
        healthScore: data.healthScore || 100,
        aiReadinessScore: data.aiReadinessScore || 0,
        lifecycleStage: data.lifecycleStage
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clients.update(id!, formData);
      setIsEditing(false);
      await loadClient();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update client');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'PROSPECT':
      case 'ACTIVE_PROSPECT': return 'info';
      case 'ONBOARDING':
      case 'RENEWAL':
      case 'EXPANSION': return 'warning';
      case 'IMPLEMENTATION':
      case 'OPTIMIZATION': return 'success';
      case 'INACTIVE': return 'danger';
      default: return 'default';
    }
  };

  const contactColumns = [
    { key: 'name', header: 'Name', render: (c: Contact) => `${c.firstName} ${c.lastName}` },
    { key: 'email', header: 'Email' },
    { key: 'jobTitle', header: 'Title', render: (c: Contact) => c.jobTitle || '-' },
    { key: 'phone', header: 'Phone', render: (c: Contact) => c.phone || '-' }
  ];

  if (loading) return <PageSkeleton />;

  if (!client) {
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-secondary" onClick={() => navigate('/clients')}>
            <ArrowLeft size={18} /> Back to Clients
          </button>
        </div>
        <div className="card">
          <p>Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/clients')} style={{ marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">{client.name}</h1>
          <p className="page-subtitle">{client.industry || 'No industry set'}</p>
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
                <label className="form-label">Website</label>
                <input
                  type="url"
                  name="website"
                  className="form-input"
                  value={formData.website}
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
                <Badge variant={getStageBadgeVariant(client.lifecycleStage)}>
                  {client.lifecycleStage.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Health Score</div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '60px',
                    height: '8px',
                    background: 'var(--border)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                     <div style={{
                       width: `${client.healthScore || 0}%`,
                       height: '100%',
                       background: (client.healthScore || 0) >= 70 ? 'var(--success)' : (client.healthScore || 0) >= 40 ? 'var(--warning)' : 'var(--danger)'
                     }} />
                  </div>
                   <span>{client.healthScore || 0}/100</span>
                </div>
              </div>
              {client.aiReadinessScore && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Readiness</div>
                  <div>{client.aiReadinessScore}/100</div>
                </div>
              )}
              {client.industry && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Industry</div>
                  <div>{client.industry}</div>
                </div>
              )}
              {client.size && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size</div>
                  <div>{client.size} employees</div>
                </div>
              )}
              {client.email && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
                  <div>{client.email}</div>
                </div>
              )}
              {client.phone && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</div>
                  <div>{client.phone}</div>
                </div>
              )}
              {client.website && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Website</div>
                  <div><a href={client.website} target="_blank" rel="noopener noreferrer">{client.website}</a></div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Activities</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Projects</span>
                <span>{client.projects?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Opportunities</span>
                <span>{client.opportunities?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Tickets</span>
                <span>{client.tickets?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Contacts</span>
                <span>{client.contacts?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {client.contacts && client.contacts.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Contacts</h3>
          <DataTable
            columns={contactColumns}
            data={client.contacts}
          />
        </div>
      )}

      {client.projects && client.projects.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Projects</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>
              <FolderKanban size={14} /> View All
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: 'Project' },
              { key: 'status', header: 'Status', render: (p: any) => p.status }
            ]}
            data={client.projects}
          />
        </div>
      )}

      {client.opportunities && client.opportunities.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Opportunities</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/opportunities')}>
              <Briefcase size={14} /> View All
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: 'Opportunity' },
              { key: 'estimatedValue', header: 'Value', render: (o: any) => `$${o.estimatedValue?.toLocaleString()}` }
            ]}
            data={client.opportunities}
          />
        </div>
      )}

      {client.tickets && client.tickets.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Support Tickets</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')}>
              <Headphones size={14} /> View All
            </button>
          </div>
          <DataTable
            columns={[
              { key: 'title', header: 'Title' },
              { key: 'status', header: 'Status' },
              { key: 'severity', header: 'Severity' }
            ]}
            data={client.tickets}
          />
        </div>
      )}
    </div>
  );
}
