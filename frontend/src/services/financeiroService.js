import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class FinanceiroService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/financial`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token JWT
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Busca todos os dados financeiros do usuário
   * @returns {Promise<Array>} Array de registros com dados do dia
   */
  async getDados() {
    try {
      const response = await this.api.get('/summary');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      throw error;
    }
  }

  /**
   * Salva ou atualiza faturamento para uma data
   * @param {string} data - Data no formato YYYY-MM-DD
   * @param {number} faturamento - Valor do faturamento
   * @returns {Promise<Object>} Registro atualizado
   */
  async salvarFaturamento(data, faturamento) {
    try {
      const response = await this.api.post('/revenue', {
        data,
        faturamento: parseFloat(faturamento),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar faturamento:', error);
      throw error;
    }
  }

  /**
   * Edita faturamento de uma data específica
   * @param {string} data - Data no formato YYYY-MM-DD
   * @param {number} faturamento - Novo valor do faturamento
   * @returns {Promise<Object>} Dados atualizados
   */
  async editarFaturamento(data, faturamento) {
    try {
      const response = await this.api.put(`/revenue/${data}`, {
        faturamento: parseFloat(faturamento),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao editar faturamento:', error);
      throw error;
    }
  }

  /**
   * Adiciona um novo gasto
   * @param {string} data - Data no formato YYYY-MM-DD
   * @param {string} nome - Nome do gasto
   * @param {number} valor - Valor do gasto
   * @returns {Promise<Object>} Gasto criado
   */
  async adicionarGasto(data, nome, valor) {
    try {
      const response = await this.api.post('/expenses', {
        data,
        nome,
        valor: parseFloat(valor),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
      throw error;
    }
  }

  /**
   * Edita um gasto existente
   * @param {number} id - ID do gasto
   * @param {string} nome - Novo nome
   * @param {number} valor - Novo valor
   * @returns {Promise<Object>} Gasto atualizado
   */
  async editarGasto(id, nome, valor) {
    try {
      const response = await this.api.put(`/expenses/${id}`, {
        nome,
        valor: parseFloat(valor),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao editar gasto:', error);
      throw error;
    }
  }

  /**
   * Deleta um gasto
   * @param {number} id - ID do gasto
   * @returns {Promise<Object>} Resposta do servidor
   */
  async deletarGasto(id) {
    try {
      const response = await this.api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar gasto:', error);
      throw error;
    }
  }
}

export default new FinanceiroService();
