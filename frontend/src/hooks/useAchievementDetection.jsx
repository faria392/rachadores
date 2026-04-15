import { useState, useEffect, useRef } from 'react';
import {
  detectLeaderChange,
  detectLevelChange,
  detectRankingLevelChange,
  getBadgeLevel,
} from '../utils/gamification';

/**
 * Hook para detectar mudanças de líder, nível e gerar alertas
 *
 * Retorna:
 * - alert: { type, title, message, isVisible }
 * - hideAlert: função para fechar o alerta
 */
export function useAchievementDetection(ranking, userTotal) {
  const [alert, setAlert] = useState({
    type: null,
    title: '',
    message: '',
    badgeLevel: null,
    isVisible: false,
  });

  const previousRankingRef = useRef(null);
  const previousTotalRef = useRef(userTotal);

  useEffect(() => {
    if (!ranking || ranking.length === 0) {
      return;
    }

    const { isNewLeader, previousLeader, currentLeader } = detectLeaderChange(
      previousRankingRef.current,
      ranking
    );

    const { isNewLevel, previousLevel, currentLevel } = detectLevelChange(
      previousTotalRef.current,
      userTotal
    );

    const { isNewLevel: isRankingNewLevel, personName, levelAchieved } = detectRankingLevelChange(
      previousRankingRef.current,
      ranking
    );

    // Atualizar referências
    previousRankingRef.current = ranking;
    previousTotalRef.current = userTotal;

    // Não mostrar alertas na primeira carga
    if (previousRankingRef.current === null) {
      return;
    }

    // COMBO: Novo líder + nova conquista do usuário
    if (isNewLeader && isNewLevel) {
      setAlert({
        type: 'combo',
        title: '🔥 NOVO LÍDER + CONQUISTA DESBLOQUEADA 🔥',
        message: `${currentLeader?.name} conquistou 👑 + ${currentLevel}! 🏆`,
        badgeLevel: currentLevel,
        isVisible: true,
      });
    }
    // Novo líder
    else if (isNewLeader) {
      setAlert({
        type: 'new_leader',
        title: '👑 NOVO LÍDER',
        message: `${currentLeader?.name} agora lidera o ranking!`,
        badgeLevel: null,
        isVisible: true,
      });
    }
    // Nova conquista do usuário
    else if (isNewLevel) {
      setAlert({
        type: 'achievement',
        title: '🏆 NOVA CONQUISTA DESBLOQUEADA',
        message: `Parabéns! Você atingiu ${currentLevel}!`,
        badgeLevel: currentLevel,
        isVisible: true,
      });
    }
    // Alguém no ranking atingiu um novo nível
    else if (isRankingNewLevel && personName && levelAchieved) {
      setAlert({
        type: 'achievement',
        title: '🏆 NOVA CONQUISTA DESBLOQUEADA',
        message: `${personName} atingiu ${levelAchieved}!`,
        badgeLevel: levelAchieved,
        isVisible: true,
      });
    }
  }, [ranking, userTotal]);

  const hideAlert = () => {
    setAlert((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  return {
    alert,
    hideAlert,
  };
}

/**
 * Hook para rastrear progresso de um usuário específico
 */
export function useUserProgress(userId, ranking) {
  const [userProgress, setUserProgress] = useState({
    position: null,
    previousPosition: null,
    total: 0,
    previousTotal: 0,
    badge: null,
    previousBadge: null,
  });

  const previousRankingRef = useRef(null);

  useEffect(() => {
    if (!ranking || !userId) return;

    const currentPosition =
      ranking.findIndex((r) => r.user_id === userId || r.id === userId) + 1 ||
      null;
    const currentUser = ranking.find(
      (r) => r.user_id === userId || r.id === userId
    );
    const currentTotal = Number(currentUser?.total) || 0;
    const currentBadge = getBadgeLevel(currentTotal);

    const previousPosition = userProgress.position;
    const previousBadge = userProgress.badge;

    setUserProgress({
      position: currentPosition,
      previousPosition,
      total: currentTotal,
      previousTotal: userProgress.total,
      badge: currentBadge,
      previousBadge,
    });

    previousRankingRef.current = ranking;
  }, [ranking, userId]);

  return userProgress;
}

/**
 * Hook para animar cards que tiveram mudança
 */
export function useCardAnimation(hasChanged) {
  const [shouldGlow, setShouldGlow] = useState(false);

  useEffect(() => {
    if (hasChanged) {
      setShouldGlow(true);
      const timer = setTimeout(() => setShouldGlow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasChanged]);

  return shouldGlow;
}
