import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('syncspace_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth Endpoints
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Workspace Endpoints
export const workspaceService = {
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  join: (inviteCode) => api.post('/workspaces/join', { inviteCode })
};

// Document Endpoints
export const documentService = {
  getByWorkspace: (workspaceId) => api.get(`/documents/workspace/${workspaceId}`),
  getById: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`)
};

export default api;

