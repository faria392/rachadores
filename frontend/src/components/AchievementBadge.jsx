import React from 'react';
import { motion } from 'framer-motion';
import { getBadgeImage } from '../utils/gamification';

/**
 * Componente de Plaquinha de Conquista (Badge)
 * Exibe a imagem real da badge com animação
 * 
 * @param {string} level - Nível da conquista (ex: '5K+', '10K+')
 * @param {boolean} animate - Se deve animar na entrada
 * @param {string} size - Tamanho: 'sm' (h-8) | 'md' (h-10) | 'lg' (h-12)
 * @param {boolean} showLabel - Se deve mostrar o rótulo ao lado da imagem
 */
function AchievementBadge({
  level,
  animate = false,
  size = 'md',
  showLabel = false,
}) {
  if (!level) return null;

  const badgeImage = getBadgeImage(level);
  if (!badgeImage) return null;

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const variants = {
    initial: {
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
    },
  };

  return (
    <motion.div
      initial={animate ? 'initial' : 'animate'}
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className="inline-flex items-center gap-2"
    >
      {/* Imagem da badge */}
      <img
        src={badgeImage}
        alt={`Badge ${level}`}
        className={`${sizeClasses[size]} w-auto object-contain drop-shadow-lg`}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
        title={`Conquista: ${level}`}
      />

      {/* Rótulo opcional */}
      {showLabel && (
        <span className="text-xs md:text-sm font-bold text-gray-200">
          {level}
        </span>
      )}
    </motion.div>
  );
}

export default AchievementBadge;
