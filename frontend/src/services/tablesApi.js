import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Adicionar token em cada requisição
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ TABELAS
export const tablesApi = {
  // Obter todas as tabelas
  getAll: async () => {
    const { data } = await API.get('/tables');
    return data;
  },

  // Obter uma tabela específica
  getById: async (tableId) => {
    const { data } = await API.get(`/tables/${tableId}`);
    return data;
  },

  // Criar nova tabela
  create: async (name) => {
    const { data } = await API.post('/tables/create', { name });
    return data;
  },

  // Deletar tabela
  delete: async (tableId) => {
    const { data } = await API.delete(`/tables/${tableId}`);
    return data;
  },

  // Duplicar tabela
  duplicate: async (tableId) => {
    const { data } = await API.post(`/tables/${tableId}/duplicate`);
    return data;
  },

  // ✅ USUÁRIOS DA TABELA
  // Adicionar usuário
  addUser: async (tableId, userData) => {
    const { data } = await API.post(`/tables/${tableId}/users`, userData);
    return data;
  },

  // Atualizar usuário
  updateUser: async (tableId, userId, userData) => {
    const { data } = await API.put(`/tables/${tableId}/users/${userId}`, userData);
    return data;
  },

  // Deletar usuário
  deleteUser: async (tableId, userId) => {
    const { data } = await API.delete(`/tables/${tableId}/users/${userId}`);
    return data;
  },
};

export default API;
