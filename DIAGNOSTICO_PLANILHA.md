# 🔍 Diagnóstico: Planilha Não Carrega

## ⚠️ Problema
Quando clica em "Planilha" na sidebar, a página fica em loading infinito e não carrega nada.

---

## 🔧 Passos para Diagnosticar

### 1️⃣ Verificar Se Backend Está Rodando
```bash
# Testar conexão com backend
curl http://localhost:5000/api/health
```

**Esperado:**
```json
{ "status": "OK", "timestamp": "..." }
```

**Se não funcionar:**
- Backend não está rodando
- Porta 5000 está em uso por outro processo

### 2️⃣ Abrir Console do Navegador
1. Pressione `F12` (ou `Ctrl+Shift+I`)
2. Vá para a aba **Console**
3. Clique em "Planilha" na sidebar
4. Observe as mensagens de log

**Você verá algo como:**
```
📅 Carregando dados para a data: 2026-04-16
🔄 Requisição: GET /api/financial/day/2026-04-16
❌ Erro ao carregar dados: Error: Network Error
```

---

## 📋 Possíveis Problemas e Soluções

### ❌ Erro: "Network Error" ou "Cannot GET /api/financial/day/..."
**Causa:** Backend não está rodando

**Solução:**
```bash
cd c:\rachadores\backend
npm install
npm start
```

### ❌ Erro: "401 Unauthorized" ou "token inválido"
**Causa:** Token de autenticação expirado/inválido

**Solução:**
1. Faça logout da aplicação
2. Faça login novamente
3. Tente acessar Planilha de novo

### ❌ Erro: "500 Internal Server Error"
**Causa:** Problema no backend (geralmente banco de dados)

**Verifique:**
```bash
# Ver logs do backend
cd c:\rachadores
node backend/src/index.js
```

Se vir erro de banco de dados:
- Verifique credenciais em `.env`
- Verifique se banco de dados está acessível
- Verifique conexão de internet

### ❌ Fica em Loading Infinito (Sem Erro)
**Causa:** Requisição pendente, sem resposta

**Solução:**
1. Abra DevTools (F12)
2. Aba Network
3. Veja qual requisição está pendente
4. Verifique status (geralmente 0 = erro de conexão)
5. Reinicie backend e frontend

---

## 🚀 Para Rodar Localmente

### Backend
```bash
cd c:\rachadores\backend
npm start
# Deve aparecer: 🚀 Backend rodando na porta 5000
```

### Frontend (Desenvolvimento)
```bash
cd c:\rachadores\frontend
npm start
# Deve abrir em: http://localhost:3000
```

### Frontend (Produção)
```bash
cd c:\rachadores\frontend
npm run build
# Gera pasta dist/
```

---

## 📊 Fluxo Esperado

```
1. Clica em "Planilha" na Sidebar
   ↓
2. Navega para /financeiro
   ↓
3. DashboardFinanceiro.jsx monta
   ↓
4. useEffect executa carregarDadosDia()
   ↓
5. Requisição GET /api/financial/day/[data]
   ↓
6. Backend retorna dados
   ↓
7. Estado é atualizado
   ↓
8. Página renderiza com dados
```

---

## 💡 Dicas para Debug

### Ver Logs em Tempo Real
```bash
# Terminal 1 - Backend
cd c:\rachadores
npm run dev:backend

# Terminal 2 - Frontend
cd c:\rachadores\frontend
npm run dev
```

### Testar API Diretamente
```bash
# Com token (pegue o token do localStorage do navegador)
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  http://localhost:5000/api/financial/summary
```

---

## ✅ Checklist

- [ ] Backend está rodando (`npm start` na pasta backend)
- [ ] Port a 5000 está disponível
- [ ] Você fez login com sucesso
- [ ] Token está no localStorage (verificar F12 → Application)
- [ ] Banco de dados está acessível
- [ ] Não há erro de CORS
- [ ] Frontend foi rebuilt (`npm run build`)

---

## 🔗 Relacionado

- [API Service](./frontend/src/services/api.jsx)
- [DashboardFinanceiro Component](./frontend/src/pages/DashboardFinanceiro.jsx)
- [Backend Financial Routes](./backend/src/routes/financeiro.js)
