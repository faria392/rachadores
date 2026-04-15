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
index.html
```

### 4. **Public Folder** (se perguntado)
```
public
```

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
- [ ] Configurar Build Command: `npm run build`
- [ ] Configurar Output Directory: `build`
- [ ] Configurar Entry File: `index.html`
- [ ] Executar o deploy
- [ ] Verificar se o site abre sem erros 404
- [ ] Testar todas as páginas (Dashboard, Ranking, Achievements, etc.)

---

## 🐛 Se Ainda Houver Erro "Output Directory ou Entry File incorreto"

1. **Limpar cache do Hostinger:**
   - Ir para Settings → Deployment → Clear Cache

2. **Recriar o build localmente:**
   ```bash
   rm -rf frontend/build
   npm run build
   ```

3. **Verificar permissões:**
   - O arquivo `build/index.html` deve estar acessível
   - Verificar se não há `.gitignore` bloqueando o build

4. **Configuração de Fallback (se disponível):**
   - Alguns hosts pedem um "Fallback Route"
   - Configure para: `index.html` (para Single Page Applications)

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
