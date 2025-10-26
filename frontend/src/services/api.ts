// FILE: frontend/src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email: string) => 
    api.post('/auth/resend-verification', { email }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.put('/users/me', data),
};

// Idea APIs
export const ideaAPI = {
  create: (data: any) => api.post('/ideas', data),
  update: (id: string, data: any) => api.put(`/ideas/${id}`, data),
  getMyIdeas: () => api.get('/ideas/my'),
  getById: (id: string) => api.get(`/ideas/${id}`),
  submit: (id: string) => api.post(`/ideas/${id}/submit`),
  delete: (id: string) => api.delete(`/ideas/${id}`),
  uploadPitchDeck: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('pitchDeck', file);
    return api.post(`/ideas/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Evaluation APIs
export const evaluationAPI = {
  getAssigned: (status?: string) => 
    api.get('/evaluations/assigned', { params: { status } }),
  submit: (data: any) => api.post('/evaluations', data),
  getById: (id: string) => api.get(`/evaluations/${id}`),
  update: (id: string, data: any) => api.put(`/evaluations/${id}`, data),
  getForIdea: (ideaId: string) => api.get(`/evaluations/idea/${ideaId}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUserRoles: (id: string, roles: string[]) => 
    api.put(`/admin/users/${id}/roles`, { roles }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getIdeas: (params?: any) => api.get('/admin/ideas', { params }),
  updateIdeaStatus: (id: string, status: string) => 
    api.put(`/admin/ideas/${id}/status`, { status }),
  assignEvaluators: (id: string, evaluatorIds: string[]) => 
    api.post(`/admin/ideas/${id}/assign`, { evaluatorIds }),
  exportIdeas: () => api.get('/admin/export/ideas'),
  exportEvaluations: () => api.get('/admin/export/evaluations'),
};

export default api;