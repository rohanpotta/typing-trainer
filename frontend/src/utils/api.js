import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Exercises
export const getExercises = (difficulty) => {
  const params = difficulty ? { difficulty } : {};
  return api.get('/exercises', { params });
};
export const getExercise = (id) => api.get(`/exercises/${id}`);

// Sessions
export const createSession = (data) => api.post('/sessions', data);
export const getSessions = (limit = 20, offset = 0) =>
  api.get('/sessions', { params: { limit, offset } });
export const getSession = (id) => api.get(`/sessions/${id}`);

export default api;
