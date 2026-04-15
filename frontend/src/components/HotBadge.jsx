import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Badge flutuante de "Em Alta / Hot" que aparece quando o usuário sobe de posição
 * ou desbloqueia nova conquista
 */
function HotBadge({ isActive = false, type = 'rising' }) {
  const [shouldShow, setShouldShow] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setShouldShow(true);
      const timer = setTimeout(() => setShouldShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const variants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.8,
      rotate: -180,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.8,
      rotate: 180,
      transition: { duration: 0.2 },
    },
    float: {
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  const getConfig = () => {
    switch (type) {
      case 'rising':
        return {
          emoji: '🔥',
          text: 'Em Alta',
          colors: 'from-red-500 to-orange-500 text-white',
        };
      case 'achievement':
        return {
          emoji: '⚡',
          text: 'Desbloqueado',
          colors: 'from-purple-500 to-blue-500 text-white',
        };
      case 'legend':
        return {
          emoji: '👑',
          text: 'Lenda',
          colors: 'from-yellow-500 to-orange-500 text-white',
        };
      default:
        return {
          emoji: '✨',
          text: 'Destaque',
          colors: 'from-cyan-500 to-blue-500 text-white',
        };
    }
  };

  const config = getConfig();

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          variants={variants}
          initial="initial"
          animate={['animate', 'float']}
          exit="exit"
          className={`
            absolute top-2 right-2 z-10
            px-3 py-1.5 rounded-full
            bg-gradient-to-r ${config.colors}
            font-bold text-sm
            flex items-center gap-1.5
            shadow-lg
            border border-white/20
            backdrop-blur-sm
          `}
        >
          <span className="text-lg animate-pulse">{config.emoji}</span>
          <span>{config.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HotBadge;
