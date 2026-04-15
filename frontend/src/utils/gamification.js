// Mapeamento de imagens das plaquinhas
export const BADGE_IMAGES = {
  '5K+': '/badges/5k.png',
  '10K+': '/badges/10k.png',
  '20K+': '/badges/20k.png',
  '50K+': '/badges/50k.png',
  '100K+': '/badges/100k.png',
};

export const ACHIEVEMENT_LEVELS = {
  '5K+': {
    threshold: 5000,
    label: '5K+',
    color: 'blue',
    icon: '🔵',
    order: 1,
  },
  '10K+': {
    threshold: 10000,
    label: '10K+',
    color: 'purple',
    icon: '🟣',
    order: 2,
  },
  '20K+': {
    threshold: 20000,
    label: '20K+',
    color: 'pink',
    icon: '🔴',
    order: 3,
  },
  '50K+': {
    threshold: 50000,
    label: '50K+',
    color: 'red',
    icon: '🔶',
    order: 4,
  },
  '100K+': {
    threshold: 100000,
    label: '100K+',
    color: 'yellow',
    icon: '👑',
    order: 5,
  },
};

/**
 * Obtém o nível de badge do usuário baseado no total de faturamento
 * @param {number} total - Total de faturamento
 * @returns {string|null} - Rótulo do nível ou null
 */
export function getBadgeLevel(total) {
  const numTotal = Number(total) || 0;

  if (numTotal >= 100000) return '100K+';
  if (numTotal >= 50000) return '50K+';
  if (numTotal >= 20000) return '20K+';
  if (numTotal >= 10000) return '10K+';
  if (numTotal >= 5000) return '5K+';

  return null;
}

/**
 * Obtém configuração do badge
 * @param {string} level - Nível do badge
 * @returns {object} - Configuração do badge
 */
export function getBadgeConfig(level) {
  return ACHIEVEMENT_LEVELS[level] || null;
}

/**
 * Obtém a URL da imagem do badge
 * @param {string} level - Nível do badge
 * @returns {string|null} - URL da imagem ou null
 */
export function getBadgeImage(level) {
  return BADGE_IMAGES[level] || null;
}

/**
 * Retorna todas as conquistas desbloqueadas até um nível
 * @param {number} total - Total de faturamento
 * @returns {array} - Array com todos os níveis desbloqueados
 */
export function getUnlockedAchievements(total) {
  const numTotal = Number(total) || 0;
  const unlocked = [];

  Object.values(ACHIEVEMENT_LEVELS).forEach((level) => {
    if (numTotal >= level.threshold) {
      unlocked.push(level.label);
    }
  });

  return unlocked.sort(
    (a, b) => ACHIEVEMENT_LEVELS[a].order - ACHIEVEMENT_LEVELS[b].order
  );
}

/**
 * Detecta se houve mudança de líder
 * @param {array} previousRanking - Ranking anterior
 * @param {array} currentRanking - Ranking atual
 * @returns {object} - { isNewLeader, previousLeader, currentLeader }
 */
export function detectLeaderChange(previousRanking, currentRanking) {
  if (!previousRanking || !currentRanking || previousRanking.length === 0) {
    return {
      isNewLeader: false,
      previousLeader: null,
      currentLeader: currentRanking?.[0] || null,
    };
  }

  const previousLeader = previousRanking[0];
  const currentLeader = currentRanking[0];

  const isNewLeader =
    previousLeader?.id !== currentLeader?.id;

  return {
    isNewLeader,
    previousLeader,
    currentLeader,
  };
}

/**
 * Detecta se houve mudança de nível para um usuário
 * @param {number} previousTotal - Total anterior
 * @param {number} currentTotal - Total atual
 * @returns {object} - { isNewLevel, previousLevel, currentLevel }
 */
export function detectLevelChange(previousTotal, currentTotal) {
  const previousLevel = getBadgeLevel(previousTotal);
  const currentLevel = getBadgeLevel(currentTotal);

  const isNewLevel =
    previousLevel !== currentLevel && currentLevel !== null;

  return {
    isNewLevel,
    previousLevel,
    currentLevel,
  };
}

/**
 * Detecta quem atingiu um novo nível no ranking
 * @param {array} previousRanking 
 * @param {array} currentRanking 
 * @returns {object}
 */
export function detectRankingLevelChange(previousRanking, currentRanking) {
  if (!previousRanking || !currentRanking || currentRanking.length === 0) {
    return {
      isNewLevel: false,
      personName: null,
      levelAchieved: null,
    };
  }

  const previousMap = {};
  previousRanking.forEach((item) => {
    previousMap[item.id] = item;
  });

  for (const currentPerson of currentRanking) {
    const previousPerson = previousMap[currentPerson.id];
    
    if (!previousPerson) {
      continue;
    }

    const previousLevel = getBadgeLevel(previousPerson.total);
    const currentLevel = getBadgeLevel(currentPerson.total);

    if (previousLevel !== currentLevel && currentLevel !== null) {
      return {
        isNewLevel: true,
        personName: currentPerson.name,
        levelAchieved: currentLevel,
      };
    }
  }

  return {
    isNewLevel: false,
    personName: null,
    levelAchieved: null,
  };
}

/**
 * Toca som de alerta
 * @param {string} type
 */
export function playAchievementSound(type = 'achievement') {
  try {
    let sound = '/sounds/achievement.mp3';

    if (type === 'new_leader') {
      sound = '/sounds/win.mp3';
    } else if (type === 'combo') {
      sound = '/sounds/legendary.mp3';
    }

    const audio = new Audio(sound);
    audio.volume = 0.7;
    audio.play().catch(() => {
    });
  } catch (e) {
    console.error('Erro ao tocar som:', e);
  }
}

/**
 * Formata a posição para exibição
 * @param {number} position - Número da posição
 * @returns {string} - Posição formatada
 */
export function formatPosition(position) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return medals[position] || `${position}º`;
}

/**
 * Calcula o progresso até o próximo nível
 * @param {number} total
 * @returns {object}
 */
export function calculateLevelProgress(total) {
  const numTotal = Number(total) || 0;
  const currentLevel = getBadgeLevel(numTotal);

  const levels = Object.values(ACHIEVEMENT_LEVELS)
    .sort((a, b) => a.threshold - b.threshold);

  const currentIndex = levels.findIndex(
    (l) => l.label === currentLevel
  );

  const nextIndex = currentIndex + 1;
  const nextLevel = levels[nextIndex] || null;

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      currentThreshold: currentIndex >= 0 ? levels[currentIndex].threshold : 0,
      nextThreshold: null,
      progress: 100,
    };
  }

  const currentThreshold = currentIndex >= 0 ? levels[currentIndex].threshold : 0;
  const nextThreshold = nextLevel.threshold;
  const rangeSize = nextThreshold - currentThreshold;
  const currentProgress = numTotal - currentThreshold;
  const progress = Math.round((currentProgress / rangeSize) * 100);

  return {
    currentLevel,
    nextLevel: nextLevel.label,
    currentThreshold,
    nextThreshold,
    progress: Math.min(progress, 100),
  };
}
