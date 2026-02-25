import { useState, useEffect } from 'react';
import { FileText, Plus, Send, CreditCard, Trash2, Search, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { payments, clients, quotes } from '../services/api';
import type { Invoice, Subscription, Client, Quote } from '../types';
import SearchBar from '../components/SearchBar';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import { PageSkeleton } from '../components/Skeleton';

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled'
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'info';
    case 'SENT': return 'warning';
    case 'PAID': return 'success';
    case 'OVERDUE': return 'danger';
    case 'CANCELLED': return 'default';
    default: return 'default';
  }
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [quotesList, setQuotesList] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'subscriptions'>('invoices');
  const [showModal, setShowModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    quoteId: '',
    description: '',
    amount: '',
    dueDate: ''
  });
  const [subFormData, setSubFormData] = useState({
    clientId: '',
    planName: 'Monthly Service',
    amount: '',
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, subscriptionsData] = await Promise.all([
        payments.getAll({ limit: 100 }),
        payments.getSubscriptions()
      ]);
      setInvoices(invoicesData.invoices || []);
      setSubscriptions(subscriptionsData || []);
      const clientsData = await clients.getAll({ limit: 100 });
      setClientsList(clientsData.clients || []);
      const quotesData = await quotes.getAll({ limit: 100 });
      setQuotesList(quotesData.quotes || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payments.create({
        clientId: formData.clientId || undefined,
        quoteId: formData.quoteId || undefined,
        description: formData.description,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        dueDate: formData.dueDate || undefined
      });
      setShowModal(false);
      setFormData({ clientId: '', quoteId: '', description: '', amount: '', dueDate: '' });
      loadData();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await payments.createSubscription({
        clientId: subFormData.clientId,
        planName: subFormData.planName,
        amount: parseFloat(subFormData.amount),
        billingCycle: subFormData.billingCycle
      });
      setShowSubscriptionModal(false);
      setSubFormData({ clientId: '', planName: 'Monthly Service', amount: '', billingCycle: 'MONTHLY' });
      loadData();
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const handleSendInvoice = async (id: string) => {
    try {
      await payments.send(id);
      loadData();
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await payments.markPaid(id);
      loadData();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (inv: Invoice) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {inv.invoiceNumber}
        </span>
      )
    },
    { key: 'description', header: 'Description', render: (inv: Invoice) => inv.description || '-' },
    { key: 'client', header: 'Client', render: (inv: Invoice) => inv.client?.name || '-' },
    {
      key: 'total',
      header: 'Total',
      render: (inv: Invoice) => `$${inv.total.toLocaleString()}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv: Invoice) => (
        <Badge variant={getStatusBadgeVariant(inv.status)}>
          {statusLabels[inv.status] || inv.status}
        </Badge>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv: Invoice) => inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inv: Invoice) => (
        <div className="flex gap-2">
          {inv.status === 'DRAFT' && (
            <button 
              onClick={() => handleSendInvoice(inv.id)}
              className="btn-icon"
              title="Send Invoice"
            >
              <Send size={16} />
            </button>
          )}
          {inv.status === 'SENT' && (
            <button 
              onClick={() => handleMarkPaid(inv.id)}
              className="btn-icon text-green-600"
              title="Mark as Paid"
            >
              <CreditCard size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const subscriptionColumns = [
    { key: 'planName', header: 'Plan' },
    { key: 'client', header: 'Client', render: (sub: Subscription) => sub.client?.name || '-' },
    {
      key: 'billingCycle',
      header: 'Billing',
      render: (sub: Subscription) => sub.billingCycle
    },
    {
      key: 'total',
      header: 'Amount',
      render: (sub: Subscription) => `$${sub.total.toLocaleString()}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (sub: Subscription) => (
        <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'warning'}>
          {sub.status}
        </Badge>
      )
    },
    {
      key: 'nextBillingDate',
      header: 'Next Billing',
      render: (sub: Subscription) => sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Invoices & Subscriptions</h1>
          <p className="page-subtitle">Manage billing and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            New Invoice
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSubscriptionModal(true)}>
            <RefreshCw size={18} />
            New Subscription
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex gap-2 mb-4">
          <button 
            className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices
          </button>
          <button 
            className={`btn ${activeTab === 'subscriptions' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            Subscriptions
          </button>
        </div>
        {activeTab === 'invoices' && (
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search invoices..." />
        )}
      </div>

      {activeTab === 'invoices' ? (
        <div className="card">
          {filteredInvoices.length > 0 ? (
            <DataTable 
              columns={invoiceColumns}
              data={filteredInvoices}
            />
          ) : (
            <EmptyState 
              icon={<FileText size={48} />}
              title="No invoices found"
              description="Create your first invoice."
              action={<button className="btn btn-primary" onClick={() => setShowModal(true)}>New Invoice</button>}
            />
          )}
        </div>
      ) : (
        <div className="card">
          {subscriptions.length > 0 ? (
            <DataTable 
              columns={subscriptionColumns}
              data={subscriptions}
            />
          ) : (
            <EmptyState 
              icon={<RefreshCw size={48} />}
              title="No subscriptions"
              description="Create your first subscription."
              action={<button className="btn btn-secondary" onClick={() => setShowSubscriptionModal(true)}>New Subscription</button>}
            />
          )}
        </div>
      )}

      {/* Invoice Modal */}
      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Invoice"
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
            <label className="block mb-2">Quote (optional)</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.quoteId}
              onChange={(e) => setFormData({ ...formData, quoteId: e.target.value })}
            >
              <option value="">Select a quote (optional)</option>
              {quotesList.map(quote => (
                <option key={quote.id} value={quote.id}>{quote.quoteNumber} - {quote.solution?.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Description</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Invoice description"
            />
          </div>
          <div className="grid grid-2 gap-4 mb-6">
            <div>
              <label className="block mb-2">Amount ($)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2">Due Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
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
              Create Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Subscription Modal */}
      <Modal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="Create New Subscription"
      >
        <form onSubmit={handleSubscriptionSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Client</label>
            <select
              className="w-full p-2 border rounded"
              value={subFormData.clientId}
              onChange={(e) => setSubFormData({ ...subFormData, clientId: e.target.value })}
              required
            >
              <option value="">Select a client</option>
              {clientsList.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Plan Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={subFormData.planName}
              onChange={(e) => setSubFormData({ ...subFormData, planName: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-2 gap-4 mb-6">
            <div>
              <label className="block mb-2">Amount ($)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={subFormData.amount}
                onChange={(e) => setSubFormData({ ...subFormData, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Billing Cycle</label>
              <select
                className="w-full p-2 border rounded"
                value={subFormData.billingCycle}
                onChange={(e) => setSubFormData({ ...subFormData, billingCycle: e.target.value as any })}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSubscriptionModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Subscription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
