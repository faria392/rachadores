# 🔧 Troubleshooting - Leaderboard Dinâmico

## ❌ O Ranking não está aparecendo?

### ✅ Checklist de Debug:

#### 1. **Verifique o Console (DevTools)**
   - Abra: `F12` → `Console`
   - Procure por:
     - ✅ Logs verdes (`✅ Ranking carregado...`)
     - ❌ Erros vermelhos (`❌ Erro ao carregar ranking...`)
     - ⚠️ Warnings (podem ser ignorados na maioria dos casos)

#### 2. **Confirm Framer Motion foi instalado**
   ```bash
   npm list framer-motion
   ```
   
   Se não estiver:
   ```bash
   npm install framer-motion
   ```

#### 3. **Cheque se os dados estão vindo da API**
   
   No console, procure por:
   ```
   ✅ Ranking carregado: [ { id: ..., name: ..., total: ... }, ... ]
   ```

   Se vir:
   ```
   ✅ Ranking carregado: []
   ```
   
   → O backend não está retornando dados. Verifique:
   - Backend está rodando? `npm start` em `backend/`
   - Rota `/api/ranking` existe?
   - Base de dados tem usuários com faturamento?

#### 4. **Cheque Erros de Componentes**

   Se ver erro como:
   ```
   TypeError: Cannot read property 'map' of undefined
   ```

   →Pode ser que o componente está recebendo dados em formato errado. 
   - Verifique se a API retorna array em `response.data` ou direto em `response`
   - Edite `Ranking.js`:
     ```javascript
     setRanking(response.data || response || []);
     ```

#### 5. **Cache do Navegador**

   Se fez mudanças mas não vê:
   - `Ctrl + Shift + R` (recarregar com cache limpo)
   - Ou: DevTools → `Network` → Desabilitar cache

---

## 🔧 Problema Específico: "AudioContext not allowed"

### Este é o erro:
```
⚠️ AudioContext was not allowed to start. 
   It must be resumed (or created) after a user gesture.
```

### ✅ Solução (já foi implementada):
- AudioContext agora só começa após primeiro clique do usuário
- Som de vitória tocará assim que alguém clicar na página
- Não afeta a renderização do ranking

### Se ainda tiver o erro:
- Recarregue a página
- O erro deve desaparecer após primeiro clique

---

## 🔍 Verificações Importantes

### Backend Verificações:

```bash
# 1. Backend rodando?
curl http://localhost:5000/api/ranking

# Resposta esperada:
[
  { "id": "...", "name": "Gusta123", "total": 2500000 },
  { "id": "...", "name": "Jshow", "total": 2300000 }
]
```

### Frontend Verificações:

Em `src/services/api.js`:
```javascript
// Verificar se tem getRanking():
export const revenueService = {
  getRanking: async () => {
    // Deve fazer GET para http://localhost:5000/api/ranking
  }
}
```

---

## 🚩 Erros Comuns & Soluções

### Erro 1: "ReferenceError: LeaderboardList is not defined"
**Solução:**
```javascript
// Verificar se import está correto no Ranking.js:
import LeaderboardList from '../components/LeaderboardList';

// Verificar se o arquivo existe:
// frontend/src/components/LeaderboardList.js
```

### Erro 2: "Cannot find module 'framer-motion'"
**Solução:**
```bash
npm install framer-motion
npm start
```

### Erro 3: Ranking mostra "Nenhum dado disponível"
**Causas possíveis:**
1. API não está retornando dados
2. Dados vêm em formato diferente (check `response.data` vs `response`)
3. Token expirou (usuário não está autenticado)

**Test:**
```javascript
// Abra o console e rode:
const response = await fetch('http://localhost:5000/api/ranking', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
});
console.log(await response.json());
```

### Erro 4: Animações não funcionam
**Causas:**
1. Framer Motion não instalado
2. CSS do Tailwind não carregado

**Soluções:**
```bash
# Reinstalar
npm install framer-motion
npm install tailwindcss

# Rebuild
npm start
```

---

## 📊 Teste com Dados Mock

Se quiser testar SEM depender da API, edite `Ranking.js`:

```javascript
const mockRanking = [
  { id: '1', name: 'Gusta123', total: 2500000 },
  { id: '2', name: 'Jshow', total: 2300000 },
  { id: '3', name: 'Alice', total: 1800000 },
  { id: '4', name: 'Bob', total: 1200000 },
];

useEffect(() => {
  const loadRanking = async () => {
    setRanking(mockRanking); // Use mock em vez de API
    setLoading(false);
  };

  loadRanking();
}, []);
```

Se o leaderboard aparecer com dados mock, problema está na API.
Se não aparecer, problema está no componente LeaderboardList.

---

## 🐛 Debug Avançado

### Ativar logs detalhados:

Em `LeaderboardList.js`, linha começando com "DEBUG":
```javascript
console.log('LeaderboardList - dados recebidos:', data);
console.warn('LeaderboardList - dados vazios ou inválidos');
```

Ver a saída no console:
```
LeaderboardList - dados recebidos: Array(5) [ {…}, {…}, {…}, {…}, {…} ]
// ou
LeaderboardList - dados vazios ou inválidos
```

### Monitorar mudanças de ranking:

```javascript
// Em Ranking.js, adicione:
useEffect(() => {
  console.log('📊 Ranking atualizado:', ranking);
}, [ranking]);
```

### Verificar se animações estão funcionando:

```javascript
// Em LeaderboardCard.js, console.log ao renderizar:
console.log('🎨 LeaderboardCard renderizado:', name, positionChange);
```

---

## 🆘 Se Nada Funcionar

### Reset Completo:

```bash
# 1. Limpar node_modules e cache
cd frontend
rm -r node_modules package-lock.json
npm cache clean --force

# 2. Reinstalar
npm install

# 3. Start dev server
npm start
```

### Verificar versões:

```bash
npm list react
npm list framer-motion
npm list react-router-dom
```

Garantir que estão em versões compatíveis.

---

## 📞 Informações para Report

Se ainda tiver problema, abra console (F12 → Console) e:

1. **Copie toda a saída do console (errors + logs)**
2. **Execute:**
   ```javascript
   console.log('React:', React.version);
   console.log('Framer motion:', typeof motion);
   console.log('Dados ranking:', ranking);
   ```
3. **Compartilhe os logs comigo**

---

## ✅ Teste Rápido

Para confirmar que tudo está funcionando:

1. Abra http://localhost:3000/ranking
2. Abra DevTools (F12)
3. Você deve ver:
   - ✅ Podium renderizado
   - ✅ Leaderboard cards com animações
   - ✅ Geen erros critical no console
   - ✅ Logs de rankings carregados

---

**Lembre-se:** O sistema está funcionando, apenas falta confirmar que os dados estão vindo corretamente da API! 🚀
