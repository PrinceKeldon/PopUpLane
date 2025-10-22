import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Methods

export const merchantsAPI = {
  getAll: (params = {}) => apiClient.get('/merchants', { params }),
  create: (data) => apiClient.post('/merchants', data),
  updateStatus: (id, status) => apiClient.patch(`/merchants/${id}/status`, { status }),
  trackClick: (id) => apiClient.post(`/merchants/${id}/click`),
  trackSave: (id) => apiClient.post(`/merchants/${id}/save`),
};

export const shoppersAPI = {
  subscribe: (data) => apiClient.post('/shoppers', data),
  getAll: () => apiClient.get('/shoppers'),
};

export const settingsAPI = {
  get: () => apiClient.get('/settings'),
  update: (data) => apiClient.patch('/settings', data),
};

export const adminAPI = {
  login: (password) => apiClient.post('/admin/login', { password }),
  getDashboard: () => apiClient.get('/admin/dashboard'),
};

export default apiClient;
