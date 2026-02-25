import { useState, useEffect } from 'react';
import { useAuth } from '../App';

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  legalName?: string;
  industry?: string;
  lifecycleStage: string;
  contractStartDate?: string;
  contractEndDate?: string;
  healthScore: number;
  npsScore?: number;
  aiMaturityLevel?: string;
  aiReadinessScore?: number;
}

export default function ClientCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchCompany() {
      try {
        const response = await fetch('/api/client/company', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to load company');
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchCompany();
  }, [token]);

  const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('en-CA') : '-');

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!company) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
        <p className="text-gray-600">Your company information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Company Details</h2>
          <dl className="space-y-3">
            {company.legalName && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Legal Name</dt>
                <dd className="font-medium text-gray-900">{company.legalName}</dd>
              </div>
            )}
            {company.email && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">{company.email}</dd>
              </div>
            )}
            {company.phone && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-900">{company.phone}</dd>
              </div>
            )}
            {company.website && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Website</dt>
                <dd className="font-medium text-gray-900">
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {company.website}
                  </a>
                </dd>
              </div>
            )}
            {company.address && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Address</dt>
                <dd className="font-medium text-gray-900">
                  {company.address}, {company.city} {company.country}
                </dd>
              </div>
            )}
            {company.industry && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Industry</dt>
                <dd className="font-medium text-gray-900">{company.industry}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Account Status</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Lifecycle Stage</dt>
              <dd className="font-medium text-gray-900">{company.lifecycleStage}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Contract Start</dt>
              <dd className="font-medium text-gray-900">{formatDate(company.contractStartDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Contract End</dt>
              <dd className="font-medium text-gray-900">{formatDate(company.contractEndDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Health Score</dt>
              <dd className="font-medium">
                <span className={`${company.healthScore >= 80 ? 'text-green-600' : company.healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {company.healthScore}/100
                </span>
              </dd>
            </div>
            {company.npsScore !== undefined && company.npsScore !== null && (
              <div className="flex justify-between">
                <dt className="text-gray-500">NPS Score</dt>
                <dd className="font-medium text-gray-900">{company.npsScore}</dd>
              </div>
            )}
            {company.aiMaturityLevel && (
              <div className="flex justify-between">
                <dt className="text-gray-500">AI Maturity</dt>
                <dd className="font-medium text-gray-900">{company.aiMaturityLevel}</dd>
              </div>
            )}
            {company.aiReadinessScore !== undefined && company.aiReadinessScore !== null && (
              <div className="flex justify-between">
                <dt className="text-gray-500">AI Readiness</dt>
                <dd className="font-medium text-gray-900">{company.aiReadinessScore}/100</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
