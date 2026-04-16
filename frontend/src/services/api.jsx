import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () =>
    api.get('/auth/me'),
};

export const revenueService = {
  addRevenue: (amount, date) =>
    api.post('/revenue/add', { amount, date }),
  
  editRevenue: (amount, date) =>
    api.put(`/revenue/edit/${date}`, { amount }),
  
  deleteRevenue: (date) =>
    api.delete(`/revenue/delete/${date}`),
  
  getDayRevenue: (date) =>
    api.get(`/revenue/day/${date}`),
  
  getHistory: () =>
    api.get('/revenue/history'),
  
  getTotal: () =>
    api.get('/revenue/total'),
  
  getRanking: () =>
    api.get('/revenue/ranking'),
  
  getDailyRanking: (date) =>
    api.get(`/revenue/ranking/daily/${date}`),
  
  getTodayRanking: () =>
    api.get('/revenue/ranking/daily'),
};

export const userService = {
  updateProfile: (name, avatar) => {
    const formData = new FormData();

    if (name) {
      formData.append('name', name);
    }

    if (avatar instanceof File) {
      formData.append('avatar', avatar);
    }

    return api.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getProfile: () => api.get('/user/profile'),
};

export default api;
