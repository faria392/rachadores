import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAchievementSound, getBadgeImage } from '../utils/gamification';

/**
 * Tipos de alertas disponíveis
 */
export const ALERT_TYPES = {
  NEW_LEADER: 'new_leader',
  ACHIEVEMENT: 'achievement',
  COMBO: 'combo',
};

/**
 * Alerta fixo de novo líder, conquista ou combo
 * @param {string} type - Tipo de alerta (NEW_LEADER, ACHIEVEMENT, COMBO)
 * @param {string} title - Título do alerta
 * @param {string} message - Mensagem do alerta
 * @param {string} badgeLevel
 * @param {boolean} isVisible 
 * @param {function} onClose
 * @param {number} duration 
 */
function LeaderAlert({
  type = ALERT_TYPES.ACHIEVEMENT,
  title = 'Nova Conquista',
  message = '',
  badgeLevel = null,
  isVisible = false,
  onClose = () => {},
  duration = 3000,
}) {
  useEffect(() => {
    if (isVisible) {
      // Tocar som apropriado
      if (type === ALERT_TYPES.NEW_LEADER) {
        playAchievementSound('new_leader');
      } else if (type === ALERT_TYPES.COMBO) {
        playAchievementSound('combo');
      } else {
        playAchievementSound('achievement');
      }

      // Auto-fechar após duration
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, type, duration, onClose]);

  const getAlertConfig = () => {
    switch (type) {
      case ALERT_TYPES.NEW_LEADER:
        return {
          gradient: 'from-amber-500 to-orange-600',
          icon: '👑',
          shadow: 'shadow-orange-500/50',
          glow: 'drop-shadow-[0_0_20px_rgba(234,88,12,0.6)]',
        };

      case ALERT_TYPES.ACHIEVEMENT:
        return {
          gradient: 'from-blue-500 to-purple-600',
          icon: '🏆',
          shadow: 'shadow-blue-500/50',
          glow: 'drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]',
        };

      case ALERT_TYPES.COMBO:
        return {
          gradient: 'from-red-500 via-orange-500 to-yellow-500',
          icon: '🔥',
          shadow: 'shadow-red-500/70',
          glow: 'drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]',
        };

      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          icon: '✨',
          shadow: 'shadow-gray-500/30',
          glow: 'drop-shadow-[0_0_15px_rgba(107,114,128,0.5)]',
        };
    }
  };

  const config = getAlertConfig();

  const containerVariants = {
    initial: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-10 left-1/2 z-50 -translate-x-1/2 pointer-events-auto"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Pulse Background */}
          {type === ALERT_TYPES.COMBO && (
            <motion.div
              className={`
                absolute inset-0 -z-10
                bg-gradient-to-r ${config.gradient}
                rounded-full blur-3xl opacity-30
              `}
              variants={pulseVariants}
              initial="initial"
              animate="animate"
            />
          )}

          {/* Alert Box */}
          <motion.div
            className={`
              relative
              bg-gradient-to-r ${config.gradient}
              text-white font-bold
              px-8 py-4 rounded-2xl
              shadow-2xl ${config.shadow}
              ${config.glow}
              border border-white/20
              flex items-center gap-4
              backdrop-blur-sm
            `}
            onClick={onClose}
          >
            {/* Icon + Badge */}
            <motion.div
              variants={iconVariants}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-3xl">{config.icon}</span>
              
              {/* Badge Image (para achievements) */}
              {badgeLevel && (type === ALERT_TYPES.ACHIEVEMENT || type === ALERT_TYPES.COMBO) && (
                <img
                  src={getBadgeImage(badgeLevel)}
                  alt={`Badge ${badgeLevel}`}
                  className="h-12 w-auto object-contain drop-shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </motion.div>

            {/* Content */}
            <div className="flex flex-col">
              <div className="text-sm opacity-90">{title}</div>
              <div className="text-lg">{message}</div>
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="
                ml-4 px-2 py-1
                hover:bg-white/20
                rounded transition
                text-sm font-semibold
              "
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LeaderAlert;
