# 🎮 Sistema de Gamificação - Documentação Completa

## 📋 Visão Geral

Sistema completo de gamificação para o ranking de faturamento com:
- ✅ Plaquinhas de conquista (badges) por nível de faturamento
- ✅ Alertas de novo líder 👑
- ✅ Alertas de conquista desbloqueada 🏆
- ✅ Alertas especiais quando ambos acontecem 🔥
- ✅ Animações suaves com Framer Motion
- ✅ Sons impactantes para cada evento
- ✅ Efeitos visuais (glow, pulsing, animations)

---

## 📂 Estrutura de Arquivos

### Utilitários
```
src/utils/gamification.js
│
├─ getBadgeLevel(total)           → Obtém o nível de badge do usuário
├─ getBadgeConfig(level)           → Configuração visual do badge
├─ getUnlockedAchievements(total)  → Array com todas as conquistas
├─ detectLeaderChange()            → Detecta se mudou o líder
├─ detectLevelChange()             → Detecta se mudou de nível
├─ playAchievementSound(type)      → Toca som apropriado
├─ formatPosition(position)        → Formata posição
└─ calculateLevelProgress(total)   → Calcula progresso até próximo nível
```

### Componentes
```
src/components/
│
├─ AchievementBadge.js      → Plaquinha visual da conquista
├─ LeaderAlert.js            → Alerta fixo animado
├─ AchievementProgress.js    → Barra de progresso + conquistas
└─ HotBadge.js               → Badge "Em Alta / Destaque"
```

### Hooks
```
src/hooks/
│
├─ useAchievementDetection() → Detecta mudanças e mostra alertas
├─ useUserProgress()         → Rastreia progresso individual
└─ useCardAnimation()        → Anima cards que mudaram
```

### Sons
```
public/sounds/
│
├─ win.mp3          → Novo líder (celebração)
├─ achievement.mp3  → Conquista desbloqueada
└─ legendary.mp3    → COMBO (épico)
```

---

## 🎯 Níveis de Conquista

| Nível | Threshold | Ícone | Cor |
|-------|-----------|-------|-----|
| 5K+   | R$ 5.000  | 🔵   | azul |
| 10K+  | R$ 10.000 | 🟣   | roxo |
| 20K+  | R$ 20.000 | 🔴   | rosa |
| 50K+  | R$ 50.000 | 🔶   | laranja |
| 100K+ | R$ 100.000| 👑   | amarelo |

---

## 💻 Uso nos Componentes

### 1. No Podium.js

```jsx
import AchievementBadge from './AchievementBadge';
import { getBadgeLevel } from '../utils/gamification';

function PodiumPlatform({ position, name, revenue, badgeLevel }) {
  return (
    <div>
      <h3>{name}</h3>
      {badgeLevel && (
        <AchievementBadge level={badgeLevel} size="sm" />
      )}
      {/* resto... */}
    </div>
  );
}

// Passar na chamada:
<PodiumPlatform
  position={1}
  name="João"
  revenue={75000}
  badgeLevel={getBadgeLevel(75000)}  // Retorna "50K+"
/>
```

### 2. No LeaderboardCard.js

```jsx
import AchievementBadge from './AchievementBadge';
import { getBadgeLevel } from '../utils/gamification';

function LeaderboardCard({ rank, name, revenue }) {
  return (
    <div>
      <h3>{name}</h3>
      <AchievementBadge 
        level={getBadgeLevel(revenue)} 
        size="sm"
      />
      {/* resto... */}
    </div>
  );
}
```

### 3. No Dashboard.js

```jsx
import LeaderAlert, { ALERT_TYPES } from '../components/LeaderAlert';
import { useAchievementDetection } from '../hooks/useAchievementDetection';

function Dashboard() {
  const { alert, hideAlert } = useAchievementDetection(ranking, totalAmount);

  return (
    <div>
      {/* Renderizar o alerta */}
      <LeaderAlert
        type={
          alert.type === 'combo' ? ALERT_TYPES.COMBO :
          alert.type === 'new_leader' ? ALERT_TYPES.NEW_LEADER :
          ALERT_TYPES.ACHIEVEMENT
        }
        title={alert.title}
        message={alert.message}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        duration={alert.type === 'combo' ? 4000 : 3000}
      />
      
      {/* resto do dashboard... */}
    </div>
  );
}
```

### 4. Mostrar Progresso em Card do Usuário

```jsx
import AchievementProgress from '../components/AchievementProgress';

function UserCard({ userTotal }) {
  return (
    <div>
      {/* dados do usuário */}
      <AchievementProgress total={userTotal} />
    </div>
  );
}
```

---

## 🔊 Sistema de Sons

Os sons são tocados automaticamente quando:

### Novo Líder 👑
```javascript
// Quando o 1º lugar muda
playAchievementSound('new_leader');  // Toca: /sounds/win.mp3
```

### Conquista Desbloqueada 🏆
```javascript
// Quando um usuário sobe de nível
playAchievementSound('achievement');  // Toca: /sounds/achievement.mp3
```

### COMBO 🔥
```javascript
// Quando ambos acontecem ao mesmo tempo
playAchievementSound('combo');  // Toca: /sounds/legendary.mp3
```

### Como Adicionar Sons
1. Vá em `public/sounds/`
2. Adicione os 3 arquivos MP3:
   - `win.mp3` (vitória)
   - `achievement.mp3` (sucesso/desbloqueio)
   - `legendary.mp3` (épico/lenda)
3. Teste no console: `new Audio('/sounds/win.mp3').play()`

---

## 🎨 Animações

### Badge
- Entrada: Fade + Scale + Rotate
- Saída: Fade + Scale inverso
- Duração: ~200ms
- Easing: Spring (stiffness 300, damping 20)

### Alert
- Entrada: Slide down + Scale up
- Saída: Slide up + Fade out
- Duração: 300ms
- Easing: Spring

### Barra de Progresso
- Progressão suave até target
- Duração: 800ms
- Easing: easeOut

### Pulse (Combo)
- Background pulse continuado
- Escala: 1 → 1.2 → 1
- Duração: 2s, repeat infinity

---

## 📊 Lógica de Detecção

### Fluxo de Mudança

```
Ranking atualizado
        ↓
comparar líder anterior vs atual
        ↓
    SE não mudou → sem alerta
    SE mudou → isNewLeader = true
        ↓
comparar total anterior vs atual
        ↓
    SE não mudou → sem alerta
    SE mudou → detectar novo nível → isNewLevel = true
        ↓
COMBO (ambos true)?
        ↓
    SIM → Alerta COMBO 🔥
    NÃO → Alerta Líder 👑 OU Alerta Conquista 🏆
```

---

## 🧪 Testando

### No Console
```javascript
// Simular novo badge
new Audio('/sounds/achievement.mp3').play();

// Verificar níveis
import { getBadgeLevel } from './utils/gamification';
getBadgeLevel(5000);     // "5K+"
getBadgeLevel(25000);    // "20K+"
getBadgeLevel(150000);   // "100K+"

// Verificar progressão
import { calculateLevelProgress } from './utils/gamification';
calculateLevelProgress(7500);
// {
//   currentLevel: "5K+",
//   nextLevel: "10K+",
//   progress: 50  // 50% para o próximo
// }
```

### Manual
1. Abrir Dev Tools (F12)
2. Ir pra aba Console
3. Executar: `new Audio('/sounds/win.mp3').play()`
4. Deve tocar o som

---

## 🚀 Integração Completa

### Checklist de Implementação

- [x] Funções utilitárias (`gamification.js`)
- [x] Componente AchievementBadge
- [x] Componente LeaderAlert
- [x] Componente AchievementProgress
- [x] Componente HotBadge
- [x] Hook useAchievementDetection
- [x] Hook useUserProgress
- [x] Hook useCardAnimation
- [x] Integração no Podium
- [x] Integração no LeaderboardCard
- [x] Integração no Dashboard
- [ ] Adicionar sons (manual - baixar/criar)
- [ ] Testar em ambiente real

---

## 🎯 Próximas Melhorias

1. **História de Conquistas**: Mostrar histórico de quando cada usuário desbloqueou cada nível
2. **Achievements Especiais**: Conquistas raras (ex: "5 dias seguidos no top 1")
3. **Ranking de Conquistas**: Quem tem mais badges
4. **Notificações Push**: Alertar via browser notification
5. **Estatísticas Gráficas**: Gráfico de progressão de conquistas
6. **Sistema de Streaks**: Registrar sequências (ex: "10 dias subindo")

---

## 📞 Suporte

Todas as funções em `utils/gamification.js` possuem:
- JSDoc completo
- Exemplos de uso
- Validação de entrada

Consulte os comentários no código para mais detalhes!

