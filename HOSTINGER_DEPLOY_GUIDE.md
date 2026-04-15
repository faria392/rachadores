# 🚀 DEPLOY HOSTINGER - Passo a Passo

## ✅ Pré-requisitos (Completos)

- [x] `postinstall` script adicionado
- [x] `react-scripts` em package.json
- [x] Build testado localmente
- [x] Repositório Git pronto

---

## 📋 Passos para Deploy

### PASSO 1: Fazer Push do Código

```bash
git add .
git commit -m "Fix: Add postinstall for frontend npm dependencies"
git push origin main
```

**Arquivos mudados:**
- `package.json` (raiz) - Novo script `postinstall`

---

### PASSO 2: Conectar Repositório no Hostinger

1. Acesso Hostinger Dashboard
2. Vá para **Hosting → Gerenciar**
3. Clique em **Configurar Deploy**
4. Selecione **GitHub** (ou outro Git provider)
5. Autorize e conecte o repositório

---

### PASSO 3: Configurar Build Settings

No painel de Deploy do Hostinger, configure:

#### Build Command
```
npm run build
```

#### Output Directory
```
build
```

#### Entry File
```
(DEIXE VAZIO - não preencha)
```

#### Fallback Route (se disponível)
```
index.html
```

**Importante:** Não defina um "Entry File" porque este é um projeto SPA React. O Hostinger precisa servir `index.html` para todas as rotas.

---

### PASSO 4: Configuração Adicional

#### Node.js Version (se perguntado)
- Recomendado: **16.x, 18.x ou 20.x**
- Mínimo: **14.x**

#### Environment Variables (se necessário)
```
PORT=5000
NODE_ENV=production
```

---

### PASSO 5: Iniciar Deploy

1. Clique em **Deploy** ou **Trigger Build**
2. Aguarde o processo

**O que o Hostinger fará:**
```
1. Clone do repositório
2. npm install (raiz)
   ↓ Executa postinstall
   ↓ cd frontend && npm install ✓
3. npm run build
   ↓ cd frontend && npm run build
   ↓ Gera frontend/build/* ✓
4. Deploy da pasta build/
```

---

### PASSO 6: Verificar Build no Hostinger

Nos logs de build, você deve ver:

```
✓ npm install (raiz)
✓ Postinstall: cd frontend && npm install
✓ npm run build
✓ Build succeeded
✓ Output: build/
```

**NÃO deve haver:**
- ❌ "react-scripts: command not found"
- ❌ Erro de dependências do frontend

---

### PASSO 7: Testar Site em Produção

1. Acesse o URL do seu site
2. Teste as páginas:
   - [ ] Login / Register
   - [ ] Dashboard
   - [ ] Ranking
   - [ ] Achievements
   - [ ] Add Revenue

3. Verifique:
   - [ ] Nenhum erro 404
   - [ ] CSS carregando corretamente
   - [ ] JavaScript funcionando
   - [ ] Chamadas à API funcionando

---

## 🐛 Se Houver Erro

### Erro: "react-scripts: command not found"

**Solução:** Verificar se `postinstall` está em `package.json` raiz

```json
"scripts": {
  "postinstall": "cd frontend && npm install",
  ...
}
```

### Erro: "npm ERR! code ENOENT"

**Solução:** Garantir que `frontend/package.json` existe

```bash
ls -la frontend/package.json
```

### Erro: Build timeout

**Solução:** Aumentar timeout no Hostinger (se disponível) ou otimizar build

---

## 📊 Estrutura Final no Hostinger

```
/public_html/ (ou pasta configurada)
├── index.html          ← Servido por todas as rotas
├── favicon.ico
├── asset-manifest.json
├── static/
│   ├── css/
│   │   └── main.*.css
│   └── js/
│       ├── main.*.js
│       └── main.*.js.LICENSE.txt
├── badges/
└── sounds/
```

---

## ✅ Checklist Final

- [ ] Código está em repositório Git
- [ ] `postinstall` script em package.json raiz
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`
- [ ] Entry file: (vazio)
- [ ] Fallback route: `index.html`
- [ ] Node.js version: 16.x+
- [ ] Deploy iniciado
- [ ] Build logs sem erros
- [ ] Site funcionando em produção
- [ ] Todas as páginas abrindo
- [ ] API respondendo corretamente

---

## 🎉 Pronto!

Seu deploy está pronto. Execute os passos acima e seu site estará no ar em produção! 🚀
