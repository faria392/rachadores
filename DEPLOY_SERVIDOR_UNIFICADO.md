# 🚀 Deploy - Servidor Unificado (Backend + Frontend)

## ✅ O que foi corrigido

O erro **503** acontecia porque:
- ❌ Frontend rodava sozinho (porta 3000)
- ❌ Backend não estava inicializado
- ❌ Frontend tentava conectar em `http://localhost:5000/api` e não encontrava

## ✨ Solução: Servidor Unificado

Agora o projeto roda **em um único servidor Node.js**:
- ✅ **Backend Express** na porta 5000 (APIs)
- ✅ **Frontend React** na porta 5000 (arquivos estáticos)
- ✅ **Banco de Dados** inicializa automaticamente

---

## 📋 Configuração no Hostinger

### ⚠️ IMPORTANTE - Caminho Completo do Entry File

No Hostinger, use **EXATAMENTE** este caminho:

```
server.js
```

**OU** (caminho completo):
```
./server.js
```

### 1️⃣ Build Command
```
npm run build
```

### 2️⃣ Output Directory
```
./
```
(deixe vazio ou use `.` - o servidor.js controla tudo)

### 3️⃣ Entry File / Start File
```
server.js
```

⚠️ **NÃO USE:**
- ❌ `src/server.js`
- ❌ `frontend/server.js`
- ❌ `./server.js` (geralmente Hostinger interpreta como pasta)
- ✅ **APENAS:** `server.js`

### 4️⃣ Environment Variables
```
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
DB_HOST=seu-host-mysql
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=seu-banco
```

---

## 🎯 Scripts Disponíveis

### Local
```bash
# Instalar dependências (backend + frontend)
npm run setup

# Rodar em desenvolvimento (modo watch)
npm run dev

# Rodar em produção (roda direto)
npm start
```

### Build para Deploy
```bash
# Fazer build do React
npm run build

# Build + Rodar servidor
npm run prod
```

---

## 📦 Estrutura do Projeto

```
rachadores/
├── server.js              ← Servidor unificado (PRINCIPAL)
├── package.json           ← Scripts e dependências
├── backend/
│   ├── src/
│   │   ├── index.js       ← Backup do servidor antigo
│   │   ├── db.js          ← Banco de dados
│   │   └── routes/        ← APIs
│   └── package.json
├── frontend/
│   ├── src/
│   ├── build/             ← React compilado (gerado por `npm run build`)
│   ├── server.js          ← Backup (não usado no unificado)
│   └── package.json
```

---

## 🔍 Verificar Status

### Localmente
```bash
# Testar servidor
npm start

# Em outro terminal, testar API
curl http://localhost:5000/api/health

# Ou abra no navegador
http://localhost:5000
```

### No Hostinger
1. Vá para: **Domains → Seu Domínio → Deployments**
2. Clique em **"View Logs"**
3. Procure por:
   ```
   ✅ SERVIDOR UNIFICADO INICIADO COM SUCESSO!
   🚀 Rodando em: http://localhost:5000
   ```

---

## ✅ Checklist de Deploy

- [x] Servidor unificado testado localmente
- [ ] `npm run build` executa sem erros
- [ ] `server.js` existe na raiz
- [ ] Backend `package.json` tem todas as dependências
- [ ] Arquivo `.env` tem variáveis de banco
- [ ] Fazer commit e push
- [ ] Hostinger faz rebuild automático
- [ ] Aguardar 2-5 minutos
- [ ] Acessar seu domínio

---

## 🚀 Próximos Passos

1. **Commit e Push:**
```bash
git add -A
git commit -m "feat: Servidor unificado - backend + frontend em uma aplicação"
git push origin main
```

2. **No Hostinger:**
   - Rebuild automático deve iniciar
   - Aguarde 2-5 minutos
   - Teste seu domínio

3. **Se funcionar:**
   - Frontend acessível: ✓
   - API funcionando: ✓
   - Banco de dados conectado: ✓
   - **Erro 503 resolvido!** ✅

---

## 🔧 Troubleshooting

### Erro: "Cannot find module './backend/src/db'"
**Solução:** Backend não está instalado
```bash
cd backend && npm install
cd ..
```

### Erro: "listen EADDRINUSE: address already in use :::5000"
**Solução:** Porta 5000 já está em uso
```bash
# Matar processo Node.js
taskkill /F /IM node.exe

# Ou usar porta diferente
PORT=8080 npm start
```

### Frontend carrega mas API não responde
**Solução:** Verifique `/api/health`
```bash
curl http://localhost:5000/api/health
```

Se retorna `{"status":"OK"...}` - Backend está OK
Se retorna erro - Banco de dados não conectou

---

**Status:** ✅ Pronto para deploy!
