import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';
import AchievementBadge from './AchievementBadge';
import { getBadgeLevel } from '../utils/gamification';

const formatCurrency = (value) => {
  const numValue = Number(value ?? 0);
  if (isNaN(numValue)) return 'R$ 0,00';
  return `R$ ${numValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const getMedalIcon = (position) => {
  const medals = ['🥇', '🥈', '🥉'];
  return medals[position - 1] || `${position}º`;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
};

function LeaderboardCard({ 
  rank, 
  name, 
  revenue, 
  avatarUrl = null,
  previousRank = null,
  positionChange = 0,
  isNewHighScore = false 
}) {
  const [showBadge, setShowBadge] = useState(false);

  // Mostrar badge dinamicamente
  useEffect(() => {
    if (positionChange !== 0) {
      setShowBadge(true);
      const timeout = setTimeout(() => setShowBadge(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [positionChange]);

  // Determinar animação e cores baseado na mudança
  const getAnimationVariant = () => {
    if (positionChange > 0) {
      return {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { type: 'spring', stiffness: 100, damping: 15 }
      };
    } else if (positionChange < 0) {
      return {
        initial: { y: -20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { type: 'spring', stiffness: 100, damping: 15 }
      };
    }
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    };
  };

  const getBackgroundColor = () => {
    if (rank === 1) return 'bg-gradient-to-r from-orange-900/40 to-orange-800/40 border-orange-600/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-800/40 to-gray-700/40 border-gray-600/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-amber-600/30';
    return 'bg-gradient-to-r from-zinc-800/20 to-zinc-700/20 border-zinc-600/20';
  };

  const getBadgeStyle = () => {
    if (positionChange > 0) {
      return {
        bg: 'bg-green-500/20 text-green-400 border-green-500/50',
        icon: <TrendingUp size={16} />,
        text: `Subiu ${positionChange}º`
      };
    } else if (positionChange < 0) {
      return {
        bg: 'bg-red-500/20 text-red-400 border-red-500/50',
        icon: <TrendingDown size={16} />,
        text: `Caiu ${Math.abs(positionChange)}º`
      };
    }
    return null;
  };

  const badgeStyle = getBadgeStyle();

  // Variáveis para o glow effect
  const glowVariants = {
    animate: {
      boxShadow: isNewHighScore
        ? [
            '0 0 0 0 rgba(234, 88, 12, 0)',
            '0 0 20 8 rgba(234, 88, 12, 0.3)',
            '0 0 0 0 rgba(234, 88, 12, 0)'
          ]
        : 'none'
    }
  };

  const revenueMax = 100000; // Valor máximo para a barra de progresso
  const revenuePercentage = Math.min((Number(revenue) / revenueMax) * 100, 100);

  return (
    <motion.div
      layout
      initial="initial"
      animate="animate"
      variants={getAnimationVariant()}
      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${getBackgroundColor()}`}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glow de vitória */}
      {isNewHighScore && (
        <motion.div
          className="absolute inset-0 opacity-0"
          animate={{
            boxShadow: [
              '0 0 20px rgba(234, 88, 12, 0)',
              '0 0 40px rgba(234, 88, 12, 0.5)',
              '0 0 20px rgba(234, 88, 12, 0)'
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Animated Border para mudanças */}
      {positionChange !== 0 && (
        <motion.div
          className="absolute inset-0 border-2 rounded-xl pointer-events-none"
          animate={{
            borderColor: positionChange > 0 
              ? ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0)']
              : ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0)']
          }}
          transition={{ duration: 1.5 }}
        />
      )}

      <div className="relative z-10 p-4">
        {/* Top Section */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Posição */}
            <div className="flex items-center justify-center w-12 h-12 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
              <span className="text-2xl font-bold">{getMedalIcon(rank)}</span>
            </div>

            {/* Avatar */}
            {avatarUrl && !avatarUrl.startsWith('data:') ? (
              <img
                src={`${avatarUrl}?t=${Date.now()}`}
                alt={name}
                className="w-14 h-14 rounded-full object-cover border-2 border-zinc-600"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-14 h-14 rounded-full object-cover border-2 border-zinc-600"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                avatarUrl ? 'hidden' : ''
              } bg-gradient-to-br from-orange-500 to-orange-600 text-white`}
              style={{ display: avatarUrl ? 'none' : 'flex' }}
            >
              {getInitials(name)}
            </div>

            {/* Nome e Mudança de Posição */}
            <div className="flex flex-col gap-1">
              <h3 className="text-gray-100 font-bold truncate max-w-xs">{name || 'N/A'}</h3>
              <div className="flex items-center gap-2">
                {previousRank && previousRank !== rank && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-400"
                  >
                    Antes: {previousRank}º lugar
                  </motion.p>
                )}
                <AchievementBadge 
                  level={getBadgeLevel(revenue)} 
                  size="sm" 
                  animate={false}
                />
              </div>
            </div>
          </div>

          {/* Badge Dinâmico */}
          {showBadge && badgeStyle && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${badgeStyle.bg}`}
            >
              {badgeStyle.icon}
              <span>{badgeStyle.text}</span>
            </motion.div>
          )}

          {/* Fire Badge para 1º lugar */}
          {rank === 1 && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-2xl"
            >
              👑
            </motion.div>
          )}
        </div>

        {/* Barra de Progresso Animada */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-orange-500">
              {formatCurrency(revenue)}
            </span>
            <span className="text-xs text-gray-500">{revenuePercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/30">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${revenuePercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stats Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-700/30">
          <span className="text-xs text-gray-500">
            {rank === 1 ? '🥇 Liderança' : rank === 2 ? '🥈 Segundo' : rank === 3 ? '🥉 Terceiro' : 'Ranking'}
          </span>
          {positionChange !== 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs font-semibold flex items-center gap-1 ${
                positionChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {positionChange > 0 ? '↑' : '↓'} {Math.abs(positionChange)}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default LeaderboardCard;
