# 🚨 Resolvendo Erro 503 - Guia Completo

## ❌ Erro 503 no Hostinger

```
503
Service Unavailable
The server is temporarily busy, try again later!
```

---

## 🔍 Causas Possíveis (em ordem de probabilidade)

### 1️⃣ **Build do Frontend NÃO foi gerado**
- ❌ Pasta `frontend/build/` vazia ou não existe
- ❌ Arquivo `frontend/build/index.html` não existe
- **Solução:** Fazer build localmente antes do deploy

### 2️⃣ **Dependências não instaladas**
- ❌ `node_modules` não existe
- ❌ Pacotes `express`, `cors`, `mysql2` faltando
- **Solução:** `npm install` deve rodar no Hostinger automaticamente

### 3️⃣ **Variáveis de Banco Não Configuradas**
- ❌ `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` vazias
- ❌ Banco MySQL não acessível
- **Solução:** Configurar variáveis de ambiente no Hostinger

### 4️⃣ **Entry File Incorreto**
- ❌ Campo "Entry File" apontando para `frontend/server.js` (deletado!)
- ❌ Campo vazio quando deveria ser `server.js`
- **Solução:** Configurar como `server.js` exatamente

### 5️⃣ **Dois server.js em conflito**
- ❌ `server.js` (raiz) e `frontend/server.js` (antigo)
- ✅ RESOLVIDO - Deletamos o antigo
- **Solução:** Apenas `server.js` na raiz deve existir

---

## ✅ Checklist - O Que Fazer Agora

### Passo 1: Fazer Build Localmente
```bash
cd c:\rachadores
npm run build
```

Verifique:
```bash
dir frontend\build\index.html
```

Deve existir! Se não existir, algo está errado.

### Passo 2: Testar Servidor Localmente
```bash
npm start
```

Deve aparecer:
```
✅ SERVIDOR UNIFICADO INICIADO COM SUCESSO!
🚀 Rodando em: http://localhost:5000
```

Se der erro, veja a mensagem de erro - ela vai dizer o que está faltando!

### Passo 3: Verificar Arquivo Procfile
Deve existir um arquivo `Procfile` na raiz com:
```
web: node server.js
```

✓ Confirmado - Procfile foi criado.

### Passo 4: Fazer Commit e Push
```bash
git add -A
git commit -m "fix: Remover conflito de server.js, adicionar Procfile"
git push origin main
```

### Passo 5: No Hostinger
1. Vá para **Deployments**
2. Clique **"Clear Cache"** (importante!)
3. Clique **"Rebuild"** ou **"Redeploy"**
4. Aguarde 5-10 minutos (dessa vez pode demorar mais)
5. Verifique **Build Logs** para erros

---

## 📋 Configuração Final no Hostinger

**EXATAMENTE ASSIM:**

| Campo | Valor |
|-------|-------|
| Build Command | `npm run build` |
| Start Command | `npm start` |
| Entry File | `server.js` |
| Output Directory | `./` |
| Runtime | Node.js 18.x |
| Auto Install Dependencies | ✓ ON |

---

## 🔧 Se Ainda Não Funcionar

### Verificar Logs no Hostinger
1. **Deployments → View Logs**
2. Procure por:
   - ❌ `Cannot find module` - Dependência faltando
   - ❌ `ECONNREFUSED` - Banco não conecta
   - ❌ `Port already in use` - Outra aplicação rodando
   - ✅ `SERVIDOR UNIFICADO INICIADO` - Está funcionando!

### Teste Manual
```bash
# Em outro terminal, enquanto npm start está rodando:
curl http://localhost:5000/api/health
```

Deve retornar:
```json
{"status":"OK","timestamp":"...","service":"unified-server"}
```

### Variáveis de Ambiente
Verifique se estão corretas no Hostinger:
```
DB_HOST=seu-mysql-host.com
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=seu-banco
```

Se não souber, peça essas informações ao suporte Hostinger.

---

## 🚀 Próximos Passos (AGORA)

1. Execute localmente:
   ```bash
   cd c:\rachadores
   npm run build
   npm start
   ```

2. Teste em outro terminal:
   ```bash
   curl http://localhost:5000/api/health
   ```

3. Se funcionar localmente → Fazer commit e push
4. No Hostinger → Clear Cache + Rebuild
5. Aguardar resultado

---

## ⚡ Dica Final

Se o erro 503 persistir após todos esses passos, pode ser **problema do Hostinger com essa conta específica**. Nesse caso:

1. Peça ao suporte Hostinger:
   - "Meu app Node.js com entry file `server.js` não inicia"
   - "Erro 503 ao fazer deploy"
   - "Compartilhe os Build Logs para diagnóstico"

2. Ou considere uma alternativa:
   - Fazer upload manual via FTP
   - Usar outro provedor (Vercel, Render, Railway)

---

**Status:** 🔧 Aguardando você completar os passos acima!
