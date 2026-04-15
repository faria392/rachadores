# Adicione os seguintes arquivos de áudio em `public/sounds/`:

## Arquivos Necessários:

### 1. `win.mp3` 
- Som de novo líder - celebração
- Duração: ~1.5-2s
- Pitch: Alto e alegre
- Sugestão: Use efeito de vitória/fanfarra

### 2. `achievement.mp3`
- Som de nova conquista desbloqueada
- Duração: ~1-1.5s  
- Pitch: Médio
- Sugestão: Use efeito de desbloqueio/success

### 3. `legendary.mp3`
- Som de COMBO (novo líder + conquista)
- Duração: ~2-2.5s
- Pitch: Muito alto e épico
- Sugestão: Use som épico/Legendary/Ultimate

## Opções para Baixar:

### Freesound.org
- Pesquise por: "victory", "achievement", "legendary"
- Filtro: MP3, libre / Creative Commons

### Zapsplat.com
- Grande biblioteca de efeitos sonoros gratuitos

### Pixabay
- Música e efeitos sonoros grátis

## Alternativa: Gerar com IA
- Utilize Mubert, Suno, ou similares para gerar sons curtos e impactantes

## Após adicionar os sons:
1. Coloque os arquivos `.mp3` na pasta `frontend/public/sounds/`
2. Os nomes devem seguir EXATAMENTE: `win.mp3`, `achievement.mp3`, `legendary.mp3`
3. Teste clicando em um card para verificar se o áudio toca

## Teste Manual:
```javascript
// No console do navegador:
new Audio('/sounds/win.mp3').play();
new Audio('/sounds/achievement.mp3').play();
new Audio('/sounds/legendary.mp3').play();
```

Pronto! Os sons serão tocados automaticamente quando:
- Novo líder: `win.mp3` 👑
- Nova conquista: `achievement.mp3` 🏆
- COMBO: `legendary.mp3` 🔥 (4 segundos)
