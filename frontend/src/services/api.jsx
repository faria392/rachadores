import axios from 'axios';

// Em desenvolvimento: usa proxy do Vite (/api) que redireciona para localhost:5000
// Em produção: usa VITE_API_URL (deve apontar para o backend real)
const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔗 API URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor de requisição - adiciona token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta - trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Token inválido ou expirado');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

export const contasChinesesService = {
  getAll: () =>
    api.get('/contas-chinesas'),
  
  getByDominio: (dominio) =>
    api.get(`/contas-chinesas/dominio/${dominio}`),
  
  createTabela: (data) =>
    api.post('/contas-chinesas/tabelas', data),
  
  deleteTabela: (id) =>
    api.delete(`/contas-chinesas/tabelas/${id}`),
  
  addConta: (data) =>
    api.post('/contas-chinesas', data),
  
  updateConta: (id, data) =>
    api.put(`/contas-chinesas/${id}`, data),
  
  deleteConta: (id) =>
    api.delete(`/contas-chinesas/${id}`),
  
  getResumo: () =>
    api.get('/contas-chinesas/resumo/totais'),
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

export const financialService = {
  getSummary: () =>
    api.get('/financial/summary'),
  
  getDayData: (date) =>
    api.get(`/financial/day/${date}`),
  
  addRevenue: (date, amount) =>
    api.post('/financial/revenue', { date, amount }),
  
  addExpense: (date, name, amount) =>
    api.post('/financial/expenses', { date, name, amount }),
  
  updateExpense: (id, name, amount) =>
    api.put(`/financial/expenses/${id}`, { name, amount }),
  
  deleteExpense: (id) =>
    api.delete(`/financial/expenses/${id}`),
};

export default api;
