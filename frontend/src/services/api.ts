import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the access token using refresh token cookie
        const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = refreshRes.data.token;
        
        // Store the new token in localStorage (temporary until full session management)
        localStorage.setItem('gavion_token', newToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};

export const clients = {
  getAll: async (params?: { search?: string; industry?: string; lifecycleStage?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const res = await api.get('/clients', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/clients/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/clients', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/clients/${id}`, data);
    return res.data;
  },
  getHealth: async (id: string) => {
    const res = await api.get(`/clients/${id}/health`);
    return res.data;
  },
};

export const leads = {
  getAll: async (params?: { status?: string; source?: string; search?: string; page?: number; limit?: number }) => {
    const res = await api.get('/leads', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/leads/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/leads', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/leads/${id}`, data);
    return res.data;
  },
  convert: async (id: string, data: { name?: string; estimatedValue?: number; expectedCloseDate?: string; solutionType?: string }) => {
    const res = await api.post(`/leads/${id}/convert`, data);
    return res.data;
  },
  markLost: async (id: string, data: { lossReason?: string }) => {
    const res = await api.post(`/leads/${id}/lost`, data);
    return res.data;
  },
};

export const opportunities = {
  getAll: async (params?: { stage?: string; search?: string; page?: number; limit?: number }) => {
    const res = await api.get('/opportunities', { params });
    return res.data;
  },
  getPipeline: async () => {
    const res = await api.get('/opportunities/pipeline');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/opportunities/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/opportunities', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/opportunities/${id}`, data);
    return res.data;
  },
  closeWon: async (id: string, createProject: boolean) => {
    const res = await api.post(`/opportunities/${id}/close-won`, { createProject });
    return res.data;
  },
  closeLost: async (id: string, data: { lostReason?: string }) => {
    const res = await api.post(`/opportunities/${id}/close-lost`, data);
    return res.data;
  },
};

export const projects = {
  getAll: async (params?: { status?: string; clientId?: string; search?: string; page?: number; limit?: number }) => {
    const res = await api.get('/projects', { params });
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get('/projects/dashboard');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },
  addMilestone: async (projectId: string, data: any) => {
    const res = await api.post(`/projects/${projectId}/milestones`, data);
    return res.data;
  },
  addTask: async (projectId: string, data: any) => {
    const res = await api.post(`/projects/${projectId}/tasks`, data);
    return res.data;
  },
  addMetric: async (projectId: string, data: any) => {
    const res = await api.post(`/projects/${projectId}/metrics`, data);
    return res.data;
  },
};

export const solutions = {
  getAll: async () => {
    const res = await api.get('/solutions');
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/solutions/categories');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/solutions/${id}`);
    return res.data;
  },
};

export const tickets = {
  getAll: async (params?: { status?: string; severity?: string; clientId?: string; page?: number; limit?: number }) => {
    const res = await api.get('/tickets', { params });
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/tickets/stats');
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/tickets/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/tickets', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/tickets/${id}`, data);
    return res.data;
  },
  addComment: async (ticketId: string, data: { content: string; isInternal?: boolean }) => {
    const res = await api.post(`/tickets/${ticketId}/comments`, data);
    return res.data;
  },
};

export const activities = {
  getAll: async (params?: { entityType?: string; entityId?: string; ownerId?: string; type?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const res = await api.get('/activities', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/activities/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/activities', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/activities/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/activities/${id}`);
    return res.data;
  },
};

export const analytics = {
  getSales: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await api.get('/analytics/sales', { params });
    return res.data;
  },
  getProjects: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await api.get('/analytics/projects', { params });
    return res.data;
  },
  getClients: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await api.get('/analytics/clients', { params });
    return res.data;
  },
  getDashboard: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data;
  },
};

export const quotes = {
  getAll: async (params?: { clientId?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get('/quotes', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/quotes/${id}`);
    return res.data;
  },
  create: async (data: { solutionId?: string; clientId: string; scope?: string; timelineWeeks?: number; totalPrice?: number; validUntil?: string }) => {
    const res = await api.post('/quotes', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/quotes/${id}`, data);
    return res.data;
  },
  send: async (id: string) => {
    const res = await api.post(`/quotes/${id}/send`);
    return res.data;
  },
  approve: async (id: string) => {
    const res = await api.post(`/quotes/${id}/approve`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/quotes/${id}`);
    return res.data;
  },
};

export const payments = {
  getAll: async (params?: { clientId?: string; status?: string; page?: number; limit?: number }) => {
    const res = await api.get('/payments', { params });
    return res.data;
  },
  getSubscriptions: async (params?: { clientId?: string; status?: string }) => {
    const res = await api.get('/payments/subscriptions', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/payments/${id}`);
    return res.data;
  },
  create: async (data: { clientId?: string; quoteId?: string; description?: string; amount?: number; dueDate?: string; lineItems?: any[] }) => {
    const res = await api.post('/payments', data);
    return res.data;
  },
  send: async (id: string) => {
    const res = await api.post(`/payments/${id}/send`);
    return res.data;
  },
  createPaymentLink: async (id: string) => {
    const res = await api.post(`/payments/${id}/pay`);
    return res.data;
  },
  createSubscription: async (data: { clientId: string; planName: string; amount: number; billingCycle?: string }) => {
    const res = await api.post('/payments/subscriptions', data);
    return res.data;
  },
  markPaid: async (id: string) => {
    const res = await api.post(`/payments/${id}/mark-paid`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/payments/${id}`);
    return res.data;
  },
};

export default api;
