import React, { useState, useEffect } from 'react';
import LeaderboardList from '../components/LeaderboardList';
import { revenueService } from '../services/api';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      const response = await revenueService.getRanking();
      setRanking(response.data || []);
      setLoading(false);
    };

    loadRanking();

    const interval = setInterval(loadRanking, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Carregando ranking...</div>;

  return (
    <div className="p-8">
      <LeaderboardList 
        data={ranking} 
        title="🚀 Leaderboard Em Tempo Real"
      />
    </div>
  );
}

const exampleRankingData = [
  {
    id: 'user_1',
    name: 'Gusta123',
    total: 2500000,
    amount: 2500000  // Alternativo ao 'total'
  },
  {
    id: 'user_2',
    name: 'Jshow',
    total: 2300000
  },
  {
    id: 'user_3',
    name: 'Alice',
    total: 1800000
  },
  {
    id: 'user_4',
    name: 'Bob',
    total: 1200000
  },
  {
    id: 'user_5',
    name: 'Carol',
    total: 950000
  }
];

// ========================================
// 3. USANDO COM MOCK DATA PARA TESTES
// ========================================

import { ComponentStory } from '@storybook/react';

export default {
  title: 'Components/LeaderboardList',
  component: LeaderboardList,
};

const Template = (args) => <LeaderboardList {...args} />;

export const Default = Template.bind({});
Default.args = {
  data: exampleRankingData,
  title: '🚀 Leaderboard Dinâmico'
};

export const Empty = Template.bind({});
Empty.args = {
  data: [],
  title: 'Leaderboard Vazio'
};

export const LargeFeed = Template.bind({});
LargeFeed.args = {
  data: Array.from({ length: 20 }, (_, i) => ({
    id: `user_${i}`,
    name: `Usuário ${i + 1}`,
    total: Math.random() * 3000000
  })),
  title: '🚀 Grande Leaderboard'
};

// ========================================
// 4. INTEGRANDO COM WEBSOCKET PARA TEMPO REAL
// ========================================

function RankingWithWebSocket() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    // Conectar ao WebSocket
    const ws = new WebSocket('ws://localhost:5000/ranking');

    ws.onmessage = (event) => {
      const newRanking = JSON.parse(event.data);
      setRanking(newRanking); // Atualiza automaticamente com animações
    };

    return () => ws.close();
  }, []);

  return <LeaderboardList data={ranking} title="📡 Ranking em Tempo Real" />;
}

// ========================================
// 5. DETECTANDO MUDANÇA NA API
// ========================================

async function getRankingWithChangeDetection() {
  const response = await fetch('http://localhost:5000/api/ranking');
  const newRanking = await response.json();

  // O LeaderboardList detecta automaticamente:
  // - Quem subiu (badges e animação para cima)
  // - Quem caiu (badges e animação para baixo)
  // - Novo líder (som de vitória)

  return newRanking;
}

// ========================================
// 6. CUSTOMIZANDO O HOOK DE SOM
// ========================================

import useVictorySound from '../hooks/useVictorySound';

function CustomSoundExample() {
  const { play } = useVictorySound();

  // Tocar som em eventos customizados
  const handleUserWon = (username) => {
    console.log(`${username} ganhou!`);
    play(); // Toca melodia de vitória
  };

  return (
    <button onClick={() => handleUserWon('Gusta123')}>
      Testar Som de Vitória
    </button>
  );
}

// ========================================
// 7. OBSERVANDO MUDANÇAS DE POSIÇÃO (DEBUG)
// ========================================

function RankingWithDebug() {
  const [ranking, setRanking] = useState([]);
  const [changes, setChanges] = useState({});

  useEffect(() => {
    const loadRanking = async () => {
      const response = await revenueService.getRanking();
      const data = response.data || [];
      
      // Registrar mudanças
      const changeLog = {};
      data.forEach((user, idx) => {
        changeLog[user.name] = `Posição: ${idx + 1}`;
      });
      
      console.log('DEBUG - Mudanças:', changeLog);
      setChanges(changeLog);
      setRanking(data);
    };

    loadRanking();
  }, []);

  return (
    <>
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3>Debug - Mudanças Detectadas:</h3>
        <pre>{JSON.stringify(changes, null, 2)}</pre>
      </div>
      <LeaderboardList data={ranking} />
    </>
  );
}

// ========================================
// 8. FORMATAÇÃO ALTERNATIVA DE DADOS
// ========================================

// Se sua API retorna 'amount' em vez de 'total'
const processApiData = (apiResponse) => {
  return apiResponse.map(user => ({
    ...user,
    total: user.amount || user.total // Normaliza para 'total'
  }));
};

// Uso:
useEffect(() => {
  const loadRanking = async () => {
    const response = await revenueService.getRanking();
    const normalizedData = processApiData(response.data);
    setRanking(normalizedData);
  };

  loadRanking();
}, []);

// ========================================
// 9. STYLES CUSTOMIZADOS (TAILWIND)
// ========================================

// Para customizar cores, edite em LeaderboardCard.js:

// Posição 1º lugar (ouro)
const firstPlaceGradient = 'bg-gradient-to-r from-orange-900/40 to-orange-800/40 border-orange-600/50';

// Posição 2º lugar (prata)
const secondPlaceGradient = 'bg-gradient-to-r from-gray-800/40 to-gray-700/40 border-gray-600/30';

// Posição 3º lugar (bronze)
const thirdPlaceGradient = 'bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-amber-600/30';

// ========================================
// 10. MONITORAR PERFORMANCE
// ========================================

function RankingWithPerformanceMonitoring() {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const loadRanking = async () => {
      const startTime = performance.now();
      
      const response = await revenueService.getRanking();
      setRanking(response.data || []);
      
      const endTime = performance.now();
      console.log(`⏱️ Tempo de renderização: ${(endTime - startTime).toFixed(2)}ms`);
    };

    loadRanking();
  }, []);

  return <LeaderboardList data={ranking} />;
}

// ========================================
// RESULTADO ESPERADO:
// ========================================

/*
✅ Animações suaves ao atualizar ranking
✅ Badges dinâmicas (🔥 Em alta, ⬇️ Caiu)
✅ Glow ao novo líder
✅ Som de vitória quando alguém assume 1º lugar
✅ Barra de progresso animada
✅ Transições de layout suave
✅ Stats footer com animações
✅ Performance otimizada
✅ Sem lag ou stuttering

COMO TESTAR:
1. Abra http://localhost:3000/ranking
2. Verifique se as animações funcionam
3. Atualize manualmente ou aguarde 5s para atualizações
4. Simule mudanças de posição no backend para confirmar animações
5. Verifique o som de vitória (volume do navegador ativo)
*/
