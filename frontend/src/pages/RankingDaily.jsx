import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RankingTable from '../components/RankingTable';
import { revenueService } from '../services/api';
import { RefreshCw, Calendar } from 'lucide-react';


function RankingDaily() {
  const [ranking, setRanking] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadRankingDaily();

    // Listener para quando o perfil é atualizado
    const handleProfileUpdate = () => {
      console.log('Perfil atualizado, recarregando ranking diário...');
      loadRankingDaily();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [selectedDate, navigate]);

  const loadRankingDaily = async () => {
    try {
      setRefreshing(true);
      const response = await revenueService.getDailyRanking(selectedDate);
      console.log('✅ Ranking diário carregado:', response.data);
      console.log('🖼️ Primeiro usuário:', response.data?.[0]);
      console.log('✅ avatarUrl presente?', response.data?.[0]?.avatarUrl ? 'SIM' : 'NÃO');
      setRanking(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar ranking do dia:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setLoading(true);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar size={32} className="text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Ranking Diário</h1>
              <p className="text-gray-400 text-sm mt-1">
                Faturamento de {formatDate(selectedDate)}
              </p>
            </div>
          </div>

          {/* Botão de Refresh */}
          <button
            onClick={loadRankingDaily}
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

        {/* Seletor de Data */}
        <div className="card mb-6">
          <label htmlFor="date" className="block text-sm font-semibold text-gray-300 mb-2">
            Selecionar Data
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="input-field"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block p-3 mb-4 bg-zinc-800 rounded-full">
                <RefreshCw size={32} className="text-orange-500 animate-spin" />
              </div>
              <p className="text-gray-400 text-lg">Carregando dados...</p>
            </div>
          </div>
        )}

        {/* Ranking Table */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6">
            <RankingTable data={ranking} title={`Ranking de ${formatDate(selectedDate)}`} />

            {/* Resumo */}
            {ranking.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-bold mb-4 text-gray-100">Resumo do Dia</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat-card">
                    <p className="text-gray-400 text-sm">Participantes com Faturamento</p>
                    <p className="text-3xl font-bold text-orange-500">
                      {ranking.filter((r) => Number(r.amount) > 0).length}
                    </p>
                  </div>
                  <div className="stat-card">
                    <p className="text-gray-400 text-sm">Líder do Dia</p>
                    <p className="text-lg font-bold text-gray-300">{ranking[0]?.name || 'N/A'}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-gray-400 text-sm">Maior Faturamento</p>
                    <p className="text-2xl font-bold text-orange-500">
                      R$ {Number(ranking[0]?.amount || 0).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="stat-card">
                    <p className="text-gray-400 text-sm">Total do Dia</p>
                    <p className="text-2xl font-bold text-orange-500">
                      R${' '}
                      {ranking
                        .reduce((sum, user) => sum + Number(user.amount || 0), 0)
                        .toFixed(2)
                        .replace('.', ',')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default RankingDaily;
