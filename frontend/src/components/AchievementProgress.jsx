import React from 'react';
import { motion } from 'framer-motion';
import { getUnlockedAchievements, calculateLevelProgress, ACHIEVEMENT_LEVELS } from '../utils/gamification';
import AchievementBadge from './AchievementBadge';

function AchievementProgress({ total = 0 }) {
  const progress = calculateLevelProgress(total);
  const unlocked = getUnlockedAchievements(total);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  const itemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="card"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🏆</span>
        <div>
          <h3 className="text-xl font-bold text-gray-100">Conquistas</h3>
          <p className="text-sm text-gray-400">{unlocked.length} desbloqueada(s)</p>
        </div>
      </div>

      {/* Conquistas Desbloqueadas */}
      {unlocked.length > 0 && (
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide font-bold text-gray-400 mb-3">
            Desbloqueadas
          </p>
          <motion.div
            className="flex flex-wrap gap-2"
            variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
            initial="initial"
            animate="animate"
          >
            {unlocked.map((badge, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <AchievementBadge
                  level={badge}
                  size="md"
                  animate={false}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Próximo Nível */}
      {progress.nextLevel && (
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-sm font-semibold text-gray-400">
              Próxima meta: <span className="text-orange-400">{progress.nextLevel}</span>
            </p>
            <p className="text-xs text-gray-500">
              {progress.progress}%
            </p>
          </div>

          {/* Barra de Progresso */}
          <div className="relative w-full h-3 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/30">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ boxShadow: '0 0 10px rgba(234, 88, 12, 0.5)' }}
            />
          </div>

          {/* Valores Atuais */}
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              {progress.currentThreshold.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500">
              {progress.nextThreshold.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      )}

      {/* Máximo Desbloqueado */}
      {!progress.nextLevel && progress.currentLevel && (
        <div className="text-center py-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30">
          <p className="text-sm font-bold text-yellow-400 mb-2">🌟 MÁXIMO DESBLOQUEADO!</p>
          <p className="text-xs text-gray-400">
            Você conquistou o nível <span className="text-yellow-400 font-bold">{progress.currentLevel}</span>
          </p>
        </div>
      )}

      {/* Sem Conquistas */}
      {unlocked.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-sm mb-2">Comece a faturar para desbloquear conquistas!</p>
          <p className="text-xs">Primeira meta: R$ 5.000</p>
        </div>
      )}
    </motion.div>
  );
}

export default AchievementProgress;
