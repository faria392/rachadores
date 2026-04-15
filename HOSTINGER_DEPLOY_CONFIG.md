# 🚀 Configuração de Deploy - Hostinger

## ✅ Verificação Local (Concluída)

- ✓ Build command: `npm run build`
- ✓ Build Status: **Bem-sucedido**
- ✓ Output Directory: `build/`
- ✓ Entry File: `build/index.html`
- ✓ Arquivo gerado: `c:\rachadores\frontend\build\index.html` (532 bytes)

---

## 📝 Configuração no Hostinger

### 1. **Build Command**
```
npm run build
```

### 2. **Output Directory**
```
build
```

### 3. **Entry File**
```
⚠️ DEIXE VAZIO ou não configure este campo
```

**IMPORTANTE:** Este é um projeto **React Frontend**, não um backend Node.js!
- ❌ NÃO use `src/index.js`
- ❌ NÃO use qualquer caminho de arquivo como entry
- ✅ DEIXE EM BRANCO

---

### 4. **SPA Fallback Route** (Se disponível)
```
index.html
```

Isto redireciona todas as rotas React para `index.html`. Necessário para React Router funcionar.

### 5. **Public Folder** (se perguntado)
```
public
```

---

## 📁 Arquivo de Configuração SPA

Um arquivo `public/_redirects` foi criado:

```
frontend/public/_redirects
```

**Conteúdo:**
```
/* /index.html 200
```

**O que faz:** Redireciona automaticamente todas as rotas para `index.html` - essencial para React Router e SPAs.

---

## 🔍 Estrutura de Arquivos Gerada

```
frontend/build/
├── index.html          ← ENTRY FILE (principal)
├── asset-manifest.json
├── static/
│   ├── css/
│   │   └── main.511d4652.css
│   └── js/
│       └── main.1e8fa263.js
├── badges/
├── sounds/
└── imagens...
```

---

## ✅ Checklist de Deploy

- [ ] Conectar repositório Git ao Hostinger
- [ ] Configurar Build Command: `npm run build` ✅
- [ ] Configurar Output Directory: `build` ✅
- [ ] **Entry File: DEIXE VAZIO** ⚠️
- [ ] Configurar Fallback Route: `index.html` (se disponível) ✅
- [ ] Arquivo `_redirects` está em `frontend/public/` ✅
- [ ] Executar o deploy
- [ ] Verificar se o site abre sem erros 404
- [ ] Testar todas as páginas (Dashboard, Ranking, Achievements, etc.)

---

## 🐛 Se Ainda Houver Erro

### "Output Directory não encontrado"
- Certifique-se de usar **apenas** `build` (não `build/`)

### "Entry File não encontrado" ou "src/index.js não encontrado"
- ⚠️ **DEIXE O CAMPO DE ENTRY FILE VAZIO**
- Este é um projeto React Frontend, não Node backend

### "Página em branco" ou "404 em rotas"
1. Verifique se `_redirects` está em `frontend/public/`
2. Limpar cache: Settings → Deployment → Clear Cache
3. Fazer novo deploy

### Build local falha
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

Verificar se `build/index.html` foi criado.

---

## 📱 Variáveis de Ambiente

Se precisar de variáveis de ambiente, adicione um arquivo `.env.production` na raiz do frontend:

```env
REACT_APP_API_URL=https://seu-backend.com
```

---

## 🔗 Links Úteis

- [Documentação Create React App - Deployment](https://create-react-app.dev/docs/deployment/)
- [Hostinger - Deployment com Node.js](https://support.hostinger.com/)

---

**Data:** 15/04/2026  
**Status:** ✅ Pronto para Deploy
