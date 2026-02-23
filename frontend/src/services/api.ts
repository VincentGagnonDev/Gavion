import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gavion_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
};

export const clients = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
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
};

export const leads = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
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
};

export const opportunities = {
  getAll: async (params?: { stage?: string; page?: number; limit?: number }) => {
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
};

export const projects = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
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
  getAll: async (params?: { status?: string; severity?: string; page?: number; limit?: number }) => {
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
  getAll: async (params?: { entityType?: string; entityId?: string; page?: number; limit?: number }) => {
    const res = await api.get('/activities', { params });
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/activities', data);
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

export default api;
