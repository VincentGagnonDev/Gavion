import { useState, useEffect } from 'react';
import { FileText, Plus, Send, Check, X, Trash2 } from 'lucide-react';
import { quotes, clients, solutions } from '../services/api';
import type { Quote, Client, AISolution } from '../types';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { PageSkeleton } from '../components/Skeleton';

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ACCEPTED: 'Accepted',
  EXPIRED: 'Expired'
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'info';
    case 'SENT':
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
    case 'EXPIRED':
      return 'danger';
    case 'ACCEPTED':
      return 'success';
    default:
      return 'default';
  }
};

export default function Quotes() {
  const [quotesList, setQuotesList] = useState<Quote[]>([]);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [solutionsList, setSolutionsList] = useState<AISolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    solutionId: '',
    clientId: '',
    scope: '',
    timelineWeeks: '',
    totalPrice: '',
    validUntil: ''
  });

  useEffect(() => {
    loadQuotes();
    loadClients();
    loadSolutions();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await quotes.getAll({ limit: 100 });
      setQuotesList(data.quotes || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await clients.getAll({ limit: 100 });
      setClientsList(data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadSolutions = async () => {
    try {
      const data = await solutions.getAll();
      setSolutionsList(data || []);
    } catch (error) {
      console.error('Error loading solutions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await quotes.create({
        solutionId: formData.solutionId || undefined,
        clientId: formData.clientId,
        scope: formData.scope || undefined,
        timelineWeeks: formData.timelineWeeks ? parseInt(formData.timelineWeeks) : undefined,
        totalPrice: formData.totalPrice ? parseFloat(formData.totalPrice) : undefined,
        validUntil: formData.validUntil || undefined
      });
      setShowModal(false);
      setFormData({ solutionId: '', clientId: '', scope: '', timelineWeeks: '', totalPrice: '', validUntil: '' });
      loadQuotes();
    } catch (error) {
      console.error('Error creating quote:', error);
    }
  };

  const handleSend = async (id: string) => {
    try {
      await quotes.send(id);
      loadQuotes();
    } catch (error) {
      console.error('Error sending quote:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await quotes.approve(id);
      loadQuotes();
    } catch (error) {
      console.error('Error approving quote:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      await quotes.delete(id);
      loadQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const filteredQuotes = quotesList.filter(q => 
    q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.solution?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'quoteNumber',
      header: 'Quote #',
      render: (quote: Quote) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {quote.quoteNumber}
        </span>
      )
    },
    { key: 'client', header: 'Client', render: (quote: Quote) => quote.client?.name || '-' },
    { key: 'solution', header: 'Solution', render: (quote: Quote) => quote.solution?.name || '-' },
    {
      key: 'totalPrice',
      header: 'Amount',
      render: (quote: Quote) => `$${quote.totalPrice.toLocaleString()}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (quote: Quote) => (
        <Badge variant={getStatusBadgeVariant(quote.status)}>
          {statusLabels[quote.status] || quote.status}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (quote: Quote) => new Date(quote.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (quote: Quote) => (
        <div className="flex gap-2">
          {quote.status === 'DRAFT' && (
            <>
              <button 
                onClick={() => handleSend(quote.id)}
                className="btn-icon"
                title="Send Quote"
              >
                <Send size={16} />
              </button>
              <button 
                onClick={() => handleDelete(quote.id)}
                className="btn-icon text-red-600"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {quote.status === 'SENT' && (
            <button 
              onClick={() => handleApprove(quote.id)}
              className="btn-icon text-green-600"
              title="Approve"
            >
              <Check size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Quotes & Invoices</h1>
          <p className="page-subtitle">Create and manage quotes for clients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Quote
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search quotes..." 
        />
      </div>

      <div className="card">
        {filteredQuotes.length > 0 ? (
          <DataTable 
            columns={columns}
            data={filteredQuotes}
          />
        ) : (
          <EmptyState 
            icon={<FileText size={48} />}
            title="No quotes yet"
            description="Create your first quote to get started."
            action={<button className="btn btn-primary" onClick={() => setShowModal(true)}>New Quote</button>}
          />
        )}
      </div>

      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Quote"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Client</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Select a client</option>
              {clientsList.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Solution</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.solutionId}
              onChange={(e) => setFormData({ ...formData, solutionId: e.target.value })}
            >
              <option value="">Select a solution (optional)</option>
              {solutionsList.map(solution => (
                <option key={solution.id} value={solution.id}>{solution.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Scope</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.scope}
              onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-2 gap-4 mb-4">
            <div>
              <label className="block mb-2">Timeline (weeks)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.timelineWeeks}
                onChange={(e) => setFormData({ ...formData, timelineWeeks: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2">Total Price ($)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block mb-2">Valid Until</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Quote
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
