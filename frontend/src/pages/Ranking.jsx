import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LeaderboardList from '../components/LeaderboardList';
import SimpleLeaderboard from '../components/SimpleLeaderboard';
import LeaderboardErrorBoundary from '../components/LeaderboardErrorBoundary';
import RankingTable from '../components/RankingTable';
import Podium from '../components/Podium';
import { revenueService } from '../services/api';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('animated');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadRanking();

    const interval = setInterval(loadRanking, 30000);

    // Listener para quando o perfil é atualizado
    const handleProfileUpdate = () => {
      console.log('👤 Perfil atualizado, recarregando ranking e pódio...');
      loadRanking();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [navigate]);

  const loadRanking = async () => {
    try {
      setRefreshing(true);
      const response = await revenueService.getRanking();
      console.log('✅ Ranking carregado:', response.data);
      console.log('🖼️ Primeiro usuário:', response.data?.[0]);
      console.log('✅ avatarUrl presente?', response.data?.[0]?.avatarUrl ? 'SIM' : 'NÃO');
      
      // Debug dos top 3
      if (response.data && response.data.length >= 3) {
        console.log('🏅 TOP 3 AVATARS:');
        console.log('  1º:', { name: response.data[0].name, avatarUrl: response.data[0].avatarUrl });
        console.log('  2º:', { name: response.data[1].name, avatarUrl: response.data[1].avatarUrl });
        console.log('  3º:', { name: response.data[2].name, avatarUrl: response.data[2].avatarUrl });
      }
      
      setRanking(response.data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      alert('Erro ao carregar ranking. Verifique o console.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8" data-sidebar-layout>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp size={32} className="text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Ranking Geral</h1>
              <p className="text-gray-400 text-sm mt-1">
                Veja o faturamento total de todos os participantes
              </p>
            </div>
          </div>

          {/* Botão de Refresh */}
          <div className="flex items-center gap-2">
            {/* Toggle de Modo de Visualização */}
            <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('animated')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  viewMode === 'animated'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Leaderboard com animações"
              >
                Animado
              </button>
              <button
                onClick={() => setViewMode('simple')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  viewMode === 'simple'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Leaderboard simples (teste)"
              >
                Simples
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  viewMode === 'table'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Tabela retrô"
              >
                Tabela
              </button>
            </div>

            {/* Botão de Refresh */}
            <button
              onClick={loadRanking}
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
            {/* Podium - Top 3 */}
            <Podium data={ranking} />

            {/* MODO ANIMADO - LeaderboardList com animações */}
            {viewMode === 'animated' && (
              <LeaderboardErrorBoundary>
                <LeaderboardList data={ranking} title="RANKING RACHADORES" />
              </LeaderboardErrorBoundary>
            )}

            {/* MODO SIMPLES - Leaderboard sem animações (para teste) */}
            {viewMode === 'simple' && (
              <SimpleLeaderboard data={ranking} />
            )}

            {/* MODO TABELA - RankingTable retrô */}
            {viewMode === 'table' && (
              <RankingTable data={ranking} title="Ranking Geral" />
            )}

            {/* Fallback - Mostrar mensagem se ranking vazio */}
            {ranking.length === 0 && (
              <div className="card bg-amber-900/20 border-2 border-amber-600/50 p-6 rounded-xl">
                <p className="text-amber-300 text-center">
                  ℹ️ Nenhum participante encontrado no ranking ainda. 
                  <br />
                  Clique em "Atualizar" ou retorne mais tarde.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Ranking;
