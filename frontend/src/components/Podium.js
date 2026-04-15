import React from 'react';
import { Crown, TrendingUp } from 'lucide-react';
import AchievementBadge from './AchievementBadge';
import { getBadgeLevel } from '../utils/gamification';

const formatCurrency = (value) => {
  const numValue = Number(value ?? 0);
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }

  return `R$ ${numValue.toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({ name, avatarUrl, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const getInitialBgColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-green-500',
      'bg-indigo-500',
      'bg-cyan-500',
      'bg-teal-500',
    ];
    const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Avatar base64 é data:uri, não precisa de cache busting
  const hasAvatar = avatarUrl && avatarUrl.startsWith('data:');

  console.log('🖼️ Avatar component:', { name, hasAvatar, avatarUrlLength: avatarUrl?.length });

  return (
    <div
      className={`
        rounded-full overflow-hidden flex items-center justify-center 
        font-bold text-white shadow-md border-2 border-zinc-700
        ${sizeClasses[size]}
        ${getInitialBgColor(name)}
      `}
    >
      {hasAvatar ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('❌ Erro ao carregar avatar');
            e.target.style.display = 'none';
            e.target.parentElement.querySelector('.initials')?.classList.remove('hidden');
          }}
          onLoad={(e) => {
            console.log('✅ Avatar carregado com sucesso');
          }}
        />
      ) : null}
      <span
        className={`initials ${hasAvatar ? 'hidden' : ''}`}
        style={{ display: hasAvatar ? 'none' : 'block' }}
      >
        {getInitials(name)}
      </span>
    </div>
  );
};

const PodiumPlatform = ({ position, name, revenue, avatarUrl, badgeLevel }) => {
  const config = {
    1: {
      platformHeight: 'h-48',
      platformWidth: 'w-36',
      avatarSize: 'xl',
      numSize: 'text-5xl',
      bgGradient: 'bg-gradient-to-b from-orange-400 to-orange-600',
      textColor: 'text-orange-500',
      ring: 'ring-4 ring-orange-500/40 shadow-2xl shadow-orange-500/40',
      nameSize: 'text-sm md:text-base',
    },
    2: {
      platformHeight: 'h-36',
      platformWidth: 'w-32',
      avatarSize: 'md',
      numSize: 'text-4xl',
      bgGradient: 'bg-gradient-to-b from-zinc-700 to-zinc-800',
      textColor: 'text-gray-300',
      ring: 'shadow-lg',
      nameSize: 'text-xs md:text-sm',
    },
    3: {
      platformHeight: 'h-28',
      platformWidth: 'w-32',
      avatarSize: 'md',
      numSize: 'text-3xl',
      bgGradient: 'bg-gradient-to-b from-zinc-700 to-zinc-800',
      textColor: 'text-gray-300',
      ring: 'shadow-lg',
      nameSize: 'text-xs md:text-sm',
    },
  };

  const c = config[position] || config[3];

  return (
    <div className="flex flex-col items-center justify-end gap-3">
      {/* Avatar (no topo) */}
      <Avatar name={name} avatarUrl={avatarUrl} size={c.avatarSize} />

      {/* Nome */}
      <span className={`${c.nameSize} text-white font-medium text-center truncate max-w-32`}>
        {name || 'N/A'}
      </span>

      {/* Badge (se disponível) */}
      {badgeLevel && (
        <AchievementBadge level={badgeLevel} size="sm" animate={false} />
      )}

      {/* Plataforma / Bloco */}
      <div
        className={`
          ${c.platformHeight}
          ${c.platformWidth}
          ${c.bgGradient}
          rounded-2xl
          flex flex-col items-center justify-center gap-2
          shadow-lg
          transition-transform duration-300 hover:scale-105
          cursor-pointer
          ${c.ring}
        `}
      >
        <span className={`${c.numSize} font-bold text-white`}>
          {position}
        </span>
        <span className="text-white font-bold text-xs md:text-sm">
          {formatCurrency(revenue)}
        </span>
      </div>
    </div>
  );
};

function Podium({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  console.log('🎪 Podium recebeu dados:', safeData);
  console.log('✨ Verificando avatarUrl:', {
    first: safeData[0]?.avatarUrl,
    second: safeData[1]?.avatarUrl,
    third: safeData[2]?.avatarUrl,
  });

  if (safeData.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16">
        <TrendingUp size={48} className="text-orange-400 mb-4" />
        <p className="text-gray-400 text-lg">Nenhum dado disponível para o pódio</p>
      </div>
    );
  }

  const first = safeData[0] || null;
  const second = safeData[1] || null;
  const third = safeData[2] || null;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <Crown size={32} className="text-orange-500 drop-shadow-lg" />
        <h2 className="text-3xl md:text-4xl font-black text-gray-100">Top 3 Ranking</h2>
      </div>

      {/* Glassmorphism background */}
      <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-8 md:p-12 backdrop-blur-sm border border-zinc-700/30">
        {/* Podium Container */}
        <div className="flex items-end justify-center gap-10 md:gap-16 mx-auto">
          {/* 2º Lugar - Esquerda */}
          {second ? (
            <PodiumPlatform
              position={2}
              name={second.name || 'N/A'}
              revenue={second.total || second.amount}
              avatarUrl={second.avatarUrl}
              badgeLevel={getBadgeLevel(second.total || second.amount)}
            />
          ) : null}

          {/* 1º Lugar - Centro (Destacado, maior) */}
          {first ? (
            <PodiumPlatform
              position={1}
              name={first.name || 'N/A'}
              revenue={first.total || first.amount}
              avatarUrl={first.avatarUrl}
              badgeLevel={getBadgeLevel(first.total || first.amount)}
            />
          ) : null}

          {/* 3º Lugar - Direita */}
          {third ? (
            <PodiumPlatform
              position={3}
              name={third.name || 'N/A'}
              revenue={third.total || third.amount}
              avatarUrl={third.avatarUrl}
              badgeLevel={getBadgeLevel(third.total || third.amount)}
            />
          ) : null}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-zinc-700/50">
          <div className="text-center">
            <p className="text-gray-400 text-xs md:text-sm font-bold mb-2 uppercase tracking-wide">
              🥇 Primeiro
            </p>
            <p className="text-lg md:text-2xl font-black text-orange-500 truncate">
              {first ? formatCurrency(first.total || first.amount) : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs md:text-sm font-bold mb-2 uppercase tracking-wide">
              🥈 Segundo
            </p>
            <p className="text-lg md:text-2xl font-black text-gray-400 truncate">
              {second ? formatCurrency(second.total || second.amount) : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs md:text-sm font-bold mb-2 uppercase tracking-wide">
              🥉 Terceiro
            </p>
            <p className="text-lg md:text-2xl font-black text-gray-400 truncate">
              {third ? formatCurrency(third.total || third.amount) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Podium;
