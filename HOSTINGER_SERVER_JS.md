# 📋 Guia Hostinger com Server.js

## ✅ Configuração Atual (Atualizada)

Um servidor Express foi criado para servir a aplicação React como um backend Node.js.

---

## 🎯 Configuração na Hostinger

### Campo 1️⃣ - Build Command
```
npm run build
```

### Campo 2️⃣ - Output Directory
```
build
```

### Campo 3️⃣ - Arquivo de entrada (Entry File)
```
server.js
```

---

## 📝 Arquivos Criados/Atualizados

✅ **`frontend/server.js`** - Servidor Express que:
  - Serve arquivos estáticos do `build/`
  - Redireciona todas as rotas para `index.html` (essencial para React Router)
  - Tem CORS habilitado
  - Roda na porta 5000 (ou PORT do ambiente)

✅ **`frontend/package.json`** - Atualizado com:
  - Dependências: `express`, `cors`
  - Scripts novos: `serve` e `prod`

---

## 🚀 Passos Finais na Hostinger

1. Fazer commit e push (GitHub automático faz deploy)
2. Na Hostinger, configure:
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Arquivo de entrada:** `server.js` ← NOVO!
3. Clique **DEPLOY**
4. Aguarde 2-5 minutos
5. Teste seu domínio

---

## 🧪 Testar Localmente

```bash
cd frontend

# Opção 1: Build + Serve
npm run prod

# Opção 2: Apenas rodar servidor (se build já existe)
npm run serve
```

Depois acesse: `http://localhost:5000`

---

## ✨ O que o Server.js faz

```
Requisição → Express recebe
    ↓
Se for arquivo (CSS, JS, PNG...):
    → Serve do pasta `build/`
    ↓
Se for rota desconhecida:
    → Redireciona para `index.html`
    → React Router toma conta
```

---

## ⚠️ Importante

- `server.js` **NÃO roda React localmente**
- Apenas serve os **arquivos compilados** do `build/`
- O React já está compilado pelo `npm run build`
- Funciona perfeitamente como SPA

---

**Status:** ✅ Pronto para deploy na Hostinger!
