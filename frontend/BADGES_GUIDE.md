# 🏆 Integração de Imagens de Badges - Guia

## 📋 Status

✅ **Implementação Completa** - Sistema pronto para usar imagens reais das badges

---

## 📁 Estrutura de Pastas

```
frontend/
└── public/
    └── badges/
        ├── 5k.png      ← Imagem do badge 5K+
        ├── 10k.png     ← Imagem do badge 10K+
        ├── 20k.png     ← Imagem do badge 20K+
        ├── 50k.png     ← Imagem do badge 50K+
        └── 100k.png    ← Imagem do badge 100K+
```

---

## 🖼️ Especificações da Imagem

### Recomendações Técnicas:

- **Formato**: PNG (com transparência) ou SVG
- **Tamanho Mínimo**: 512x512 pixels
- **Índice de Cores**: RGB com alpha (RGBA) para SVG
- **Compressão**: Otimizada (use TinyPNG ou similar)
- **Proporção**: Quadrada ou retangular horizontal

### Tamanhos de Exibição:

| Local | Altura | Classe CSS |
|-------|--------|-----------|
| Ranking (LeaderboardCard) | 32px | `h-8` |
| Pódio (Top 3) | 40px | `h-10` |
| Alerta (Achievement/Combo) | 48px | `h-12` |

---

## ⚙️ Onde as Imagens são Usadas

### 1. **Ranking (LeaderboardCard)**
```
[Posição] [Avatar] Nome | Badge 8px
```
- Dimensão: `h-8` (32px)
- Localização: Ao lado do nome do usuário

### 2. **Pódio (Podium)**
```
[Avatar]
[Nome] [Badge 10px]
[Plataforma]
```
- Dimensão: `h-10` (40px)
- Localização: Abaixo do nome

### 3. **Alerta (LeaderAlert)**
```
🏆 [Badge 12px] 100K+
Texto do alerta
```
- Dimensão: `h-12` (48px)
- Localização: Dentro do alerta ao lado do ícone

### 4. **Card de Progresso (AchievementProgress)**
```
Conquistas Desbloqueadas:
[Badge 10px] [Badge 10px] [Badge 10px]
```
- Dimensão: `h-10` (40px)

---

## 🎨 Mapeamento de Cores Sugeridas

| Nível | Cor | Exemplo |
|-------|-----|---------|
| 5K+ | Azul | RGB(59, 130, 246) |
| 10K+ | Roxo | RGB(147, 51, 234) |
| 20K+ | Rosa | RGB(236, 72, 153) |
| 50K+ | Laranja | RGB(249, 115, 22) |
| 100K+ | Amarelo/Dourado | RGB(234, 179, 8) |

---

## 📦 Como Adicionar as Imagens

### Passo 1: Criar a Pasta
```bash
mkdir -p frontend/public/badges
```

### Passo 2: Adicionar as Imagens
1. Coloque os 5 arquivos PNG/SVG na pasta `frontend/public/badges/`
2. Nomeie EXATAMENTE como:
   - `5k.png`
   - `10k.png`
   - `20k.png`
   - `50k.png`
   - `100k.png`

### Passo 3: Testar
1. Inicie o servidor: `npm start`
2. Verifique se as imagens aparecem no ranking
3. Simule uma mudança para ver no alerta

---

## 🔄 Mapeamento de Imagens (Código)

### Em `src/utils/gamification.js`:
```javascript
export const BADGE_IMAGES = {
  '5K+': '/badges/5k.png',
  '10K+': '/badges/10k.png',
  '20K+': '/badges/20k.png',
  '50K+': '/badges/50k.png',
  '100K+': '/badges/100k.png',
};

export function getBadgeImage(level) {
  return BADGE_IMAGES[level] || null;
}
```

---

## ✨ Recursos Implementados

✅ Componente `AchievementBadge` - Exibe imagem com animação
✅ `getBadgeImage()` - Retorna URL da imagem
✅ Fallback automático - Se imagem não carregar, desaparece graciosamente
✅ Animação de entrada - Scale 0.8→1 com fade in
✅ Responsivo - Diferentes tamanhos conforme necessário
✅ Drop shadow - Efeito de profundidade nas badges
✅ Integração em LeaderAlert - Mostra badge no alerta de conquista

---

## 🧪 Testando

### No Navegador
1. Abra DevTools (F12)
2. Console → Network
3. Procure por `5k.png`, `10k.png`, etc
4. Verifique se estão carregando (Status 200)

### Teste Manual
```javascript
// No console do navegador:
fetch('/badges/5k.png').then(r => console.log(r.status))
// Deve retornar: 200
```

---

## 🐛 Troubleshooting

### "Badge não aparecer"
❌ Arquivo não existe em `/public/badges/`
❌ Nome do arquivo incorreto (atenção a maiúsculas/minúsculas em Windows)
❌ Erro CORS (se servindo de outro domínio)

**Solução**: Verificar console (F12) para erro 404

### "Imagem carrega mas está muito pequena/grande"
**Solução**: A imagem redimensiona automaticamente. Ajuste o SVG ou PNG origem

### "Imagem com fundo branco aparecendo"
**Solução**: Use PNG com transparência (RGBA) ou SVG

---

## 📚 Referências de Onde as Badges Aparecem

| Arquivo | Componente | Uso |
|---------|-----------|-----|
| `src/components/Podium.js` | PodiumPlatform | Top 3 |
| `src/components/LeaderboardCard.js` | LeaderboardCard | Ranking completo |
| `src/components/LeaderAlert.js` | LeaderAlert | Alerta de conquista |
| `src/components/AchievementProgress.js` | AchievementProgress | Card de progresso |
| `src/pages/Dashboard.js` | Dashboard | Alerta exibido |

---

## 🚀 Próximos Passos

1. **Adicionar imagens em `/public/badges/`** ← IMEDIATO
2. Testar carregamento (F12 > Network)
3. Verificar tamanhos e proporções
4. Ajustar cores se necessário
5. Deploy em produção

---

## 📞 Suporte

Se as imagens não carregarem:

1. Verifique o caminho: `/public/badges/5k.png`
2. Verifique nomes exatos (sem espaços, correspondência de caso)
3. Verifique se estão em PNG/SVG válido
4. Teste no console: `new Image().src = '/badges/5k.png'`

