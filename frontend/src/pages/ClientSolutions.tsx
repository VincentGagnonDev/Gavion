import { useState, useEffect } from 'react';
import { useAuth } from '../App';

interface Solution {
  id: string;
  status: string;
  deployedAt?: string;
  solution: {
    id: string;
    name: string;
    category: string;
    description?: string;
    tagline?: string;
    longDescription?: string;
    useCases: string[];
  };
}

export default function ClientSolutions() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchSolutions() {
      try {
        const response = await fetch('/api/client/solutions', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to load solutions');
        const data = await response.json();
        setSolutions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchSolutions();
  }, [token]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'AI Receptionist': '📞',
      'AI Chatbot': '💬',
      'AI Website': '🌐',
      'Patient Engagement': '❤️',
    };
    return icons[category] || '🤖';
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <p className="text-gray-600">Your AI solutions from Gavion</p>
      </div>

      {solutions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No products yet</p>
          <p className="text-sm text-gray-400 mt-2">Contact us to learn about our AI solutions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map((sol) => (
            <div key={sol.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-4xl mr-3">{getCategoryIcon(sol.solution.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{sol.solution.name}</h3>
                      <p className="text-sm text-gray-500">{sol.solution.category}</p>
                    </div>
                  </div>
                  <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(sol.status)}`}>
                    {sol.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">
                  {sol.solution.tagline || sol.solution.description}
                </p>

                {sol.solution.longDescription && (
                  <p className="text-sm text-gray-500 mb-4">{sol.solution.longDescription}</p>
                )}

                {sol.solution.useCases && sol.solution.useCases.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Use Cases</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {sol.solution.useCases.map((useCase, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {sol.deployedAt && (
                  <p className="text-sm text-gray-500">
                    Deployed: {new Date(sol.deployedAt).toLocaleDateString('en-CA')}
                  </p>
                )}
              </div>

              {sol.status === 'ACTIVE' && (
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Configure →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
