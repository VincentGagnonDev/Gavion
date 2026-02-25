import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClientDashboard } from '../services/client-api';
import { useAuth } from '../App';

export default function ClientPortalDashboard() {
  const [data, setData] = useState<ClientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch('/api/client/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to load dashboard');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [token]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);

  const formatDate = (date?: string | null) => 
    date ? new Date(date).toLocaleDateString('en-CA') : '-';

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      SENT: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      NEW: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {data.client.name}</h1>
        <p className="text-gray-600">Here's an overview of your account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Amount Due</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.totalDue)}</p>
          <p className="text-sm text-gray-500 mt-1">{data.summary.unpaidCount} unpaid invoice(s)</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.activeSubscriptions}</p>
          <p className="text-sm text-gray-500 mt-1">recurring services</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Open Tickets</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.openTickets}</p>
          <Link to="/portal/tickets" className="text-sm text-blue-600 hover:underline mt-1 block">
            View support
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Active Products</p>
          <p className="text-2xl font-bold text-gray-900">{data.summary.activeSolutions}</p>
          <Link to="/portal/solutions" className="text-sm text-blue-600 hover:underline mt-1 block">
            View products
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <Link to="/portal/invoices" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {data.recentInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No invoices yet</p>
            ) : (
              <div className="space-y-4">
                {data.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(invoice.total)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">My Products</h2>
            <Link to="/portal/solutions" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {data.solutions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No products yet</p>
            ) : (
              <div className="space-y-4">
                {data.solutions.map((sol) => (
                  <div key={sol.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{sol.solution.name}</p>
                      <p className="text-sm text-gray-500">{sol.solution.tagline || sol.solution.category}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(sol.status)}`}>
                      {sol.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Support Tickets</h2>
            <Link to="/portal/tickets" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {data.recentTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tickets yet</p>
            ) : (
              <div className="space-y-4">
                {data.recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{ticket.title}</p>
                      <p className="text-sm text-gray-500">{ticket.ticketNumber} • {formatDate(ticket.createdAt)}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
