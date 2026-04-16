import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { revenueService } from '../services/api';
import { formatDateBrasil, getTodayBrasil } from '../utils/dateFormatter';
import { RefreshCw, History, Edit2, Trash2 } from 'lucide-react';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadHistory();

    const interval = setInterval(loadHistory, 30000);

    const handleProfileUpdate = () => {
      console.log('Perfil atualizado, recarregando histórico...');
      loadHistory();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [navigate]);

  const loadHistory = async () => {
    try {
      setRefreshing(true);
      const response = await revenueService.getHistory();
      const sortedHistory = (response.data || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setHistory(sortedHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateStr) => {
    return formatDateBrasil(dateStr);
  };

  const formatCurrency = (value) => {
    const numValue = Number(value ?? 0);
    if (isNaN(numValue)) return 'R$ 0,00';
    return `R$ ${numValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  };

  const handleDelete = async (date) => {
    if (!window.confirm('Tem certeza que deseja deletar este faturamento?')) {
      return;
    }

    try {
      await revenueService.deleteRevenue(date);
      loadHistory();
    } catch (error) {
      console.error('Erro ao deletar faturamento:', error);
      alert('Erro ao deletar faturamento');
    }
  };

  const handleEdit = (record) => {
    // Armazenar o registro a editar no localStorage
    localStorage.setItem('editingRevenue', JSON.stringify(record));
    navigate('/add-revenue', { state: { editing: record } });
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {}
      <Sidebar />

      {}
      <main className="flex-1 p-8" data-sidebar-layout>
        {}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History size={32} className="text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Histórico de Faturamentos</h1>
              <p className="text-gray-400 text-sm mt-1">
                Todos os seus registros de faturamento
              </p>
            </div>
          </div>

          {}
          <button
            onClick={loadHistory}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              refreshing
                ? 'bg-zinc-700 cursor-not-allowed text-gray-500'
                : 'btn-primary hover:bg-orange-600'
            }`}
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block p-3 mb-4 bg-zinc-800 rounded-full">
                <RefreshCw size={32} className="text-orange-500 animate-spin" />
              </div>
              <p className="text-gray-400 text-lg">Carregando histórico...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {history.length === 0 ? (
              <div className="card text-center py-12">
                <History size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">Nenhum faturamento registrado ainda</p>
                <p className="text-gray-500 text-sm mt-2">
                  Comece registrando seu primeiro faturamento
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resumo */}
                <div className="card">
                  <h3 className="text-lg font-bold mb-4 text-gray-100">Resumo</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="stat-card">
                      <p className="text-gray-400 text-sm">Total de Registros</p>
                      <p className="text-3xl font-bold text-orange-500">{history.length}</p>
                    </div>
                    <div className="stat-card">
                      <p className="text-gray-400 text-sm">Faturamento Total</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {formatCurrency(
                          history.reduce((sum, record) => sum + Number(record.amount || 0), 0)
                        )}
                      </p>
                    </div>
                    <div className="stat-card">
                      <p className="text-gray-400 text-sm">Maior Registro</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {formatCurrency(
                          Math.max(...history.map((r) => Number(r.amount || 0)))
                        )}
                      </p>
                    </div>
                    <div className="stat-card">
                      <p className="text-gray-400 text-sm">Média por Registro</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {formatCurrency(
                          history.reduce((sum, record) => sum + Number(record.amount || 0), 0) /
                            history.length
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabela de Histórico */}
                <div className="card">
                  <h3 className="text-lg font-bold mb-4 text-gray-100">Registros</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-zinc-700">
                          <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                            Data
                          </th>
                          <th className="px-4 py-3 text-left text-gray-400 font-semibold">
                            Dia da Semana
                          </th>
                          <th className="px-4 py-3 text-right text-gray-400 font-semibold">
                            Faturamento
                          </th>
                          <th className="px-4 py-3 text-center text-gray-400 font-semibold">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((record, index) => {
                          const isToday =
                            record.date === new Date().toISOString().split('T')[0];
                          return (
                            <tr
                              key={`${record.date}-${index}`}
                              className={`border-b border-zinc-800 transition-all ${
                                isToday ? 'bg-orange-500/10' : 'hover:bg-zinc-800/50'
                              }`}
                            >
                              <td className="px-4 py-3 text-gray-300 font-medium">
                                {record.date}
                              </td>
                              <td className="px-4 py-3 text-gray-400">
                                {formatDate(record.date)}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-orange-500">
                                {formatCurrency(record.amount)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEdit(record)}
                                    className="p-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-400 transition-all"
                                    title="Editar"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(record.date)}
                                    className="p-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 transition-all"
                                    title="Deletar"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HistoryPage;
