import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChartComponent from '../components/ChartComponent';
import RankingTable from '../components/RankingTable';
import LeaderAlert, { ALERT_TYPES } from '../components/LeaderAlert';
import { revenueService } from '../services/api';
import { useAchievementDetection } from '../hooks/useAchievementDetection';
import { TrendingUp, Calendar, BarChart3, RefreshCw } from 'lucide-react';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [todayAmount, setTodayAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [userPosition, setUserPosition] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [dailyRanking, setDailyRanking] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Estado do alerta de conquista
  const { alert, hideAlert } = useAchievementDetection(ranking, totalAmount);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    loadData();

    const interval = setInterval(loadData, 30000);

    // Listener para quando o perfil é atualizado
    const handleProfileUpdate = (event) => {
      console.log('Perfil atualizado, recarregando dados...', event.detail);
      setUser(event.detail);
      loadData();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [navigate]);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [dayRes, totalRes, rankRes, dailyRes, historyRes] = await Promise.all([
        revenueService.getDayRevenue(today),
        revenueService.getTotal(),
        revenueService.getRanking(),
        revenueService.getTodayRanking(),
        revenueService.getHistory(),
      ]);

      setTodayAmount(Number(dayRes.data?.amount) || 0);
      setTotalAmount(Number(totalRes.data?.total) || 0);

      setRanking(rankRes.data || []);
      setDailyRanking(dailyRes.data || []);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userRank = rankRes.data?.findIndex((r) => r.id === storedUser.id) + 1 || 0;
      setUserPosition(userRank);

      const history = historyRes.data || [];
      const last30Days = history.slice(0, 30).reverse();
      setChartData(
        last30Days.map((record) => ({
          date: record.date,
          amount: Number(record.amount) || 0,
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-center">
          <RefreshCw size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Alerta de Conquista */}
      <LeaderAlert
        type={
          alert.type === 'combo'
            ? ALERT_TYPES.COMBO
            : alert.type === 'new_leader'
            ? ALERT_TYPES.NEW_LEADER
            : ALERT_TYPES.ACHIEVEMENT
        }
        title={alert.title}
        message={alert.message}
        badgeLevel={alert.badgeLevel}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        duration={alert.type === 'combo' ? 4000 : 3000}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">
              Bem-vindo, <span className="text-orange-500">{user.name}!</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Rico não é quem ganha muito, é quem sabe multiplicar o que tem.
            </p>
          </div>

          { }
          <button
            onClick={loadData}
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

        { }
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block p-3 mb-4 bg-zinc-800 rounded-full">
                <RefreshCw size={32} className="text-orange-500 animate-spin" />
              </div>
              <p className="text-gray-400 text-lg">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {}
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-semibold">Faturamento Hoje</p>
                  <Calendar size={20} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500">
                  R$ {todayAmount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {today === new Date().toISOString().split('T')[0]
                    ? 'Hoje'
                    : 'Dia selecionado'}
                </p>
              </div>

              { }
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-semibold">Faturamento Total</p>
                  <BarChart3 size={20} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500">
                  R$ {totalAmount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                </p>
                <p className="text-xs text-gray-500 mt-2">Acumulado</p>
              </div>

              { }
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-semibold">Posição (Geral)</p>
                  <TrendingUp size={20} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500">
                  {userPosition ? `${userPosition}º` : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {ranking.length > 0 ? `de ${ranking.length}` : 'sem dados'}
                </p>
              </div>

              { }
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm font-semibold">Posição (Hoje)</p>
                  <Calendar size={20} className="text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-orange-500">
                  {dailyRanking && dailyRanking.length > 0
                    ? `${
                        dailyRanking.findIndex((r) => r.id === user.id) + 1 || '—'
                      }º`
                    : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {dailyRanking.length > 0 ? `de ${dailyRanking.length}` : 'sem dados'}
                </p>
              </div>
            </div>

            { }
            <div className="mb-8">
              <ChartComponent
                data={chartData}
                type="line"
                title="Evolução do Faturamento (Últimos 30 dias)"
              />
            </div>

            { }
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              { }
              <RankingTable data={ranking.slice(0, 5)} title="Top 5 - Ranking Geral" />

              { }
              <RankingTable data={dailyRanking.slice(0, 5)} title="Top 5 - Ranking de Hoje" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
