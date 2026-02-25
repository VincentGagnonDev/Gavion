import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../App';

interface Invoice {
  id: string;
  invoiceNumber: string;
  description?: string;
  total: number;
  status: string;
  issueDate?: string;
  dueDate?: string;
  paidDate?: string;
  stripePaymentLink?: string;
  lineItems: string;
}

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const status = searchParams.get('status');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const url = status ? `/api/client/invoices?status=${status}` : '/api/client/invoices';
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to load invoices');
        const data = await response.json();
        setInvoices(data.invoices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [token, status]);

  const handlePay = async (invoiceId: string) => {
    setPaying(invoiceId);
    try {
      const response = await fetch(`/api/client/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.paymentLink) {
        window.open(data.paymentLink, '_blank');
      }
    } catch (err) {
      alert('Failed to create payment');
    } finally {
      setPaying(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);

  const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('en-CA') : '-');

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: 'bg-green-100 text-green-800',
      SENT: 'bg-blue-100 text-blue-800',
      OVERDUE: 'bg-red-100 text-red-800',
      DRAFT: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">View and pay your invoices</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Link to="/portal/invoices" className={`px-3 py-1 rounded text-sm ${!status ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
          All
        </Link>
        <Link to="/portal/invoices?status=SENT" className={`px-3 py-1 rounded text-sm ${status === 'SENT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
          Pending
        </Link>
        <Link to="/portal/invoices?status=PAID" className={`px-3 py-1 rounded text-sm ${status === 'PAID' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
          Paid
        </Link>
        <Link to="/portal/invoices?status=OVERDUE" className={`px-3 py-1 rounded text-sm ${status === 'OVERDUE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
          Overdue
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {formatDate(invoice.issueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {formatCurrency(invoice.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {invoice.status !== 'PAID' && invoice.stripePaymentLink && (
                      <button
                        onClick={() => handlePay(invoice.id)}
                        disabled={paying === invoice.id}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {paying === invoice.id ? 'Processing...' : 'Pay Now'}
                      </button>
                    )}
                    {invoice.status === 'PAID' && (
                      <span className="text-green-600 text-sm">Paid</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
