import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Trophy, Lock, Check, Zap, RefreshCw } from 'lucide-react';
import { revenueService } from '../services/api';

function Achievements() {
  const [user, setUser] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lista de conquistas
  const achievements = [
    { level: '5K+', value: 5000, image: '/badges/5k.png' },
    { level: '10K+', value: 10000, image: '/badges/10k.png' },
    { level: '20K+', value: 20000, image: '/badges/20k.png' },
    { level: '50K+', value: 50000, image: '/badges/50k.png' },
    { level: '100K+', value: 100000, image: '/badges/100k.png', isSpecial: true },
  ];

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

    // Listener para quando o perfil é atualizado
    const handleProfileUpdate = (event) => {
      console.log('Perfil atualizado em Achievements:', event.detail);
      setUser(event.detail);
      loadData();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const totalRes = await revenueService.getTotal();
      setTotalRevenue(Number(totalRes.data?.total) || 0);
    } catch (error) {
      console.error('Erro ao carregar faturamento:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular se conquista foi desbloqueada
  const isUnlocked = (value) => totalRevenue >= value;

  // Função para calcular percentual de progresso
  const getProgressPercent = (value) => {
    return Math.min((totalRevenue / value) * 100, 100);
  };

  // Função para calcular quanto falta
  const getRemainingAmount = (value) => {
    const remaining = value - totalRevenue;
    return remaining > 0 ? remaining : 0;
  };

  // Função para formatar valores em moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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

  const unlockedCount = achievements.filter((a) => isUnlocked(a.value)).length;
  const totalCount = achievements.length;

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      <main className="flex-1 p-8" data-sidebar-layout>
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={36} className="text-orange-500" />
            <h1 className="text-4xl font-black text-white">PLAQUINHAS</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Desbloqueie plaquinhas épicas ao atingir seus objetivos de faturamento
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Faturamento Total</div>
            <div className="text-3xl font-black text-orange-500">
              {formatCurrency(totalRevenue)}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">Plaquinhas Desbloqueadas</div>
            <div className="text-3xl font-black text-green-500">
              {unlockedCount}/{totalCount}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm mb-2">
              {unlockedCount === totalCount ? '🎉 COMPLETO!' : 'Próxima Meta'}
            </div>
            <div className="text-3xl font-black text-orange-400">
              {unlockedCount === totalCount
                ? '100%'
                : formatCurrency(
                    achievements.find((a) => !isUnlocked(a.value))?.value - totalRevenue || 0
                  )}
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {achievements.map((achievement, index) => {
            const unlocked = isUnlocked(achievement.value);
            const progress = getProgressPercent(achievement.value);
            const remaining = getRemainingAmount(achievement.value);

            return (
              <div
                key={index}
                className={`group relative transition-all duration-300 ${
                  achievement.isSpecial ? 'lg:col-span-1 md:col-span-2' : ''
                }`}
              >
                {/* Card Principal */}
                <div
                  className={`rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer h-full ${
                    unlocked
                      ? 'border-orange-500/50 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:border-orange-500'
                      : 'border-zinc-700 bg-zinc-900/50'
                  }`}
                >
                  {/* Badge/Image Container */}
                  <div className="relative p-8 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center min-h-56">
                    <div
                      className={`flex items-center justify-center transition-all duration-300 ${
                        unlocked
                          ? 'scale-100 opacity-100'
                          : 'scale-75 opacity-40 filter grayscale'
                      } ${achievement.isSpecial ? 'animate-bounce' : ''}`}
                      style={{
                        animation: unlocked
                          ? achievement.isSpecial
                            ? 'bounce 2s infinite'
                            : 'none'
                          : 'none',
                      }}
                    >
                      <img
                        src={achievement.image}
                        alt={achievement.level}
                        className="w-40 h-40 object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* Lock Icon (se bloqueado) */}
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={48} className="text-gray-600" />
                      </div>
                    )}

                    {/* Check Icon (se desbloqueado) - REMOVIDO PARA MAIS ESPAÇO */}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className={`text-lg font-black mb-2 ${
                        unlocked ? 'text-orange-400' : 'text-gray-500'
                      }`}
                    >
                      {achievement.level}
                    </h3>

                    {/* Status */}
                    <div
                      className={`text-xs font-bold mb-3 flex items-center gap-1 ${
                        unlocked ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {unlocked ? (
                        <>
                          <Check size={14} />
                          DESBLOQUEADO
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          BLOQUEADO
                        </>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          unlocked ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Valor */}
                    <div className="text-xs text-gray-400 mb-2">
                      {formatCurrency(achievement.value)}
                    </div>

                    {/* Falta */}
                    {!unlocked && (
                      <div className="text-xs text-orange-400 font-semibold">
                        Faltam {formatCurrency(remaining)}
                      </div>
                    )}

                    {unlocked && (
                      <div className="text-xs text-green-400 font-semibold">✅ Concluído</div>
                    )}
                  </div>
                </div>

                {/* Efeito de Glow (desbloqueado) */}
                {unlocked && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Motivacional */}
        <div className="mt-16 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap size={24} className="text-orange-500" />
            <h2 className="text-2xl font-black text-orange-400">CONTINUE FATURANDO!</h2>
            <Zap size={24} className="text-orange-500" />
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {unlockedCount === totalCount
              ? '🎊 Você desbloqueou TODAS as plaquinhas! Você é uma lenda! 🎊'
              : `Você está a apenas ${formatCurrency(
                  achievements
                    .filter((a) => !isUnlocked(a.value))
                    .reduce((min, a) => Math.min(min, getRemainingAmount(a.value)), Infinity)
                )} de desbloquear a próxima plaquinha!`}
          </p>
        </div>
      </main>
    </div>
  );
}

export default Achievements;
