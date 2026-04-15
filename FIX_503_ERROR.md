# 🔧 Corrigindo Erro 503 no Hostinger

## ❌ O Que Causou o Erro 503

O servidor Node.js não conseguiu iniciar corretamente. Causas comuns:
1. ❌ Arquivo `build/` não foi gerado
2. ❌ Dependências não foram instaladas
3. ❌ `server.js` tinha erros silenciosos
4. ❌ Porta ou interface incorretas

---

## ✅ Passos Para Corrigir

### 1️⃣ Atualizar `server.js` (✅ FEITO)
✓ Arquivo corrigido e testado localmente:
- ✅ Corrigido erro de wildcard route
- ✅ Verificação do diretório `build/`
- ✅ Melhor tratamento de erros
- ✅ Logging detalhado
- ✅ Escuta em `0.0.0.0` (aceita todas as interfaces)
- ✅ **TESTADO LOCALMENTE - FUNCIONANDO!**

### 2️⃣ Garantir que as Dependências Existem
Verifique `frontend/package.json`:

```json
{
  "dependencies": {
    "express": "^5.2.1",
    "cors": "^2.8.6",
    ...
  }
}
```

✓ `express` e `cors` devem estar presentes.

### 3️⃣ Testar Localmente
Execute no seu terminal:

```bash
cd frontend

# Build da aplicação React
npm run build

# Servir localmente (deve rodar sem erros)
npm run serve
```

Acesse: `http://localhost:3000`

Se funcionar, o build está correto.

---

## 🚀 Deploy no Hostinger

### Configurar no Hostinger:

**Build Command:**
```
npm run build
```

**Output Directory:**
```
build
```

**Entry File / Start File:**
```
server.js
```

**Environment Variables** (se necessário):
```
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

---

## 📋 Checklist Antes de Deploy

- [ ] Executou `npm run build` localmente sem erros
- [ ] Arquivo `build/index.html` existe
- [ ] Arquivo `frontend/server.js` existe e tem conteúdo correto
- [ ] Arquivo `frontend/package.json` tem `express` e `cors`
- [ ] Commitou e fez push para GitHub
- [ ] Hostinger fez rebuild automático
- [ ] Aguardou 2-5 minutos para o build completar

---

## 🔍 Verificar Logs no Hostinger

1. Abra o painel Hostinger
2. Vá para: **Domains → Seu Domínio → Deployments**
3. Clique em **"View Logs"** ou **"Application Logs"**
4. Procure por:
   - ✅ `Servidor iniciado com sucesso`
   - ❌ Erros de porta, arquivos ou dependências

---

## ⚡ Se Ainda Houver Erro 503

### Problema: Build não foi gerado
**Solução:**
```bash
cd frontend
rm -rf build node_modules
npm install
npm run build
```

Depois faça commit e push.

### Problema: Dependências faltando
**Solução:**
Hostinger roda `npm install` automaticamente. Se não rodar:

1. Limpe o cache do build no Hostinger
2. Clique em **"Rebuild"**
3. Aguarde 5 minutos

### Problema: Porta bloqueada
**Solução:**
Hostinger designa uma porta automaticamente. O novo `server.js` usa `PORT` do ambiente:

```bash
PORT=3000 npm run serve  # Local
# No Hostinger, vai usar a porta que Hostinger designar via $PORT
```

### Problema: `index.html` não encontrado
**Solução:**
Verifique se o build foi gerado:

```bash
cd frontend
ls -la build/index.html  # Linux/Mac
dir build\index.html     # Windows
```

Se não existir: `npm run build`

---

## 📞 Suporte Hostinger

Se ainda não funcionar, entre em contato com Hostinger com:

1. **Logs da aplicação** (veja "Verificar Logs no Hostinger")
2. **Build Command:** `npm run build`
3. **Output Directory:** `build`
4. **Entry File:** `server.js`

---

## ✨ Alternativa: Deploy Manual

Se o deployment automático falhar:

1. Gere o build: `npm run build`
2. Compacte: `frontend/build.zip`
3. Faça upload via FTP/cPanel para `public_html/`
4. Pronto!

---

**Última atualização:** 15/04/2026
