import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const ingestAPI = {
  upload: (formData) => api.post('/ingest', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  listJobs: () => api.get('/ingest'),
  getJob: (id) => api.get(`/ingest/${id}`),
};

export const recordsAPI = {
  list: (params) => api.get('/records', { params }),
  getOne: (id) => api.get(`/records/${id}`),
  updateStatus: (id, data) => api.patch(`/records/${id}/status`, data),
};

export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
};

export default api;
