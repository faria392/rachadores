import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeaderboardCard from './LeaderboardCard';
import useVictorySound from '../hooks/useVictorySound';
import { Medal, Zap } from 'lucide-react';

function LeaderboardList({ data = [], title = 'Leaderboard Dinâmico' }) {
  const [rankedData, setRankedData] = useState([]);
  const [previousRanking, setPreviousRanking] = useState([]);
  const [newLeader, setNewLeader] = useState(null);
  const prevLeaderRef = useRef(null);
  const { play: playVictorySound } = useVictorySound();

  useEffect(() => {
    console.log('✅ LeaderboardList - dados recebidos:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ LeaderboardList - dados vazios ou inválidos', data);
      setRankedData([]);
      return;
    }

    // Se já temos dados anteriores, detectar mudanças
    const previousRankMap = {};
    previousRanking.forEach((item, idx) => {
      previousRankMap[item.id || item.name] = idx + 1;
    });

    // Enriquecer dados com posição
    const enrichedData = data.map((item, idx) => {
      const currentRank = idx + 1;
      const previousRank = previousRankMap[item.id || item.name];
      const positionChange = previousRank ? previousRank - currentRank : 0;

      return {
        ...item,
        rank: currentRank,
        previousRank: previousRank || null,
        positionChange,
        isNewHighScore: currentRank === 1 && previousRank !== 1 && previousRank !== null
      };
    });

    // Atualizar dados renderizados
    console.log('📊 Dados enriquecidos:', enrichedData);
    setRankedData(enrichedData);

    // Verificar se há novo líder
    const currentLeader = enrichedData[0];
    if (currentLeader && prevLeaderRef.current?.id !== currentLeader.id && prevLeaderRef.current !== null) {
      console.log('🏆 Novo líder detectado:', currentLeader.name);
      setNewLeader(currentLeader.name);
      playVictorySound();

      const timeout = setTimeout(() => setNewLeader(null), 3000);
      return () => clearTimeout(timeout);
    }

    prevLeaderRef.current = currentLeader || null;
    // Guardar ranking anterior para próxima comparação
    setPreviousRanking(data);
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  if (rankedData.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16">
        <Medal size={48} className="text-orange-400 mb-4" />
        <p className="text-gray-400 text-lg">Carregando leaderboard...</p>
        <p className="text-gray-500 text-sm mt-2">Os dados aparecem aqui após carregamento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card de Novo Líder */}
      <AnimatePresence>
        {newLeader && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl p-4 flex items-center gap-3 border-2 border-orange-400"
          >
            <Zap className="text-white" size={24} />
            <div>
              <p className="text-white font-bold text-lg">🔥 Novo Líder! 🔥</p>
              <p className="text-orange-100 text-sm">{newLeader} agora está em primeiro lugar!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header do Leaderboard */}
      <div className="card">
        <div className="flex items-center gap-3 mb-0">
          <Medal size={28} className="text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
        </div>
      </div>

      {/* Lista com Animações */}
      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {rankedData.map((item) => (
            <motion.div
              key={item.id || item.name}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, y: -10 }}
            >
              <LeaderboardCard
                rank={item.rank}
                name={item.name}
                revenue={item.total || item.amount}
                avatarUrl={item.avatarUrl}
                previousRank={item.previousRank}
                positionChange={item.positionChange}
                isNewHighScore={item.isNewHighScore}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Stats Footer */}
      <motion.div
        className="card grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="stat-card">
          <p className="text-gray-400 text-sm">Total de Participantes</p>
          <motion.p
            className="text-3xl font-bold text-orange-500"
            key={rankedData.length}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {rankedData.length}
          </motion.p>
        </div>

        <div className="stat-card">
          <p className="text-gray-400 text-sm">Maior Faturamento</p>
          <motion.p
            className="text-2xl font-bold text-orange-500"
            key={rankedData[0]?.id}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            R$ {(Number(rankedData[0]?.total || 0) / 1000).toFixed(1)}k
          </motion.p>
        </div>

        <div className="stat-card">
          <p className="text-gray-400 text-sm">Faturamento Total</p>
          <motion.p
            className="text-2xl font-bold text-orange-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            R$ {(rankedData.reduce((sum, item) => sum + Number(item.total || 0), 0) / 1000).toFixed(1)}k
          </motion.p>
        </div>

        <div className="stat-card">
          <p className="text-gray-400 text-sm">Média por Participante</p>
          <motion.p
            className="text-2xl font-bold text-orange-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            R$ {(rankedData.reduce((sum, item) => sum + Number(item.total || 0), 0) / Math.max(rankedData.length, 1) / 1000).toFixed(1)}k
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export default LeaderboardList;
