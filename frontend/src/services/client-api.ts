import { useAuth } from '../App';
import { Invoice, Subscription, Ticket } from '../types';

const API_URL = '/api/client';

async function fetchClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const { token } = useAuth();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export interface ClientDashboard {
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    website?: string;
    lifecycleStage: string;
    contractStartDate?: string;
    contractEndDate?: string;
    healthScore: number;
    npsScore?: number;
  };
  summary: {
    totalDue: number;
    unpaidCount: number;
    activeSubscriptions: number;
    openTickets: number;
    activeSolutions: number;
  };
  recentInvoices: Invoice[];
  subscriptions: Subscription[];
  recentTickets: Ticket[];
  solutions: Array<{
    id: string;
    status: string;
    solution: {
      id: string;
      name: string;
      category: string;
      description?: string;
      tagline?: string;
    };
  }>;
}

export async function getClientDashboard(): Promise<ClientDashboard> {
  return fetchClient<ClientDashboard>('/dashboard');
}

export async function getClientInvoices(params?: { status?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return fetchClient<{ invoices: Invoice[]; pagination: any }>(`/invoices?${query}`);
}

export async function getClientInvoice(id: string): Promise<Invoice> {
  return fetchClient<Invoice>(`/invoices/${id}`);
}

export async function payClientInvoice(id: string): Promise<{ paymentLink: string; sessionId: string }> {
  return fetchClient(`/invoices/${id}/pay`, { method: 'POST' });
}

export async function getClientSubscriptions(): Promise<Subscription[]> {
  return fetchClient<Subscription[]>('/subscriptions');
}

export async function getClientSolutions() {
  return fetchClient<Array<{
    id: string;
    status: string;
    solution: {
      id: string;
      name: string;
      category: string;
      description?: string;
      tagline?: string;
      longDescription?: string;
      useCases: string[];
    };
  }>>('/solutions');
}

export async function getClientTickets(params?: { status?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return fetchClient<{ tickets: Ticket[]; pagination: any }>(`/tickets?${query}`);
}

export async function getClientTicket(id: string): Promise<Ticket> {
  return fetchClient<Ticket>(`/tickets/${id}`);
}

export async function createClientTicket(data: { title: string; description: string; type?: string; severity?: string }) {
  return fetchClient('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addClientTicketComment(ticketId: string, content: string) {
  return fetchClient(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getClientCompany() {
  return fetchClient<{
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
  }>('/company');
}

export async function getClientContacts() {
  return fetchClient<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    isDecisionMaker: boolean;
    preferredChannel?: string;
  }>>('/contacts');
}
