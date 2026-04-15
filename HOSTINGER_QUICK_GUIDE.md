# 📋 Guia Rápido - Hostinger (COPIAR E COLAR)

## ⚡ 3 Campos Principais

Ao configurar o deploy na Hostinger, preencha:

### Campo 1️⃣ - Build Command
```
npm run build
```

### Campo 2️⃣ - Output Directory (ou Public Directory)
```
build
```

### Campo 3️⃣ - Entry File
```
⚠️ DEIXE VAZIO (Este é React Frontend, não Node backend)
```

---

## 🎯 Passos Exatos

1. Abra: **Hostinger → Seu Domínio → Deployment/Hosting**

2. Clique em **"Configure Build Settings"** ou similar

3. **Preencha:**
   - **Build Command:** `npm run build` ✅
   - **Output Directory:** `build` ✅
   - **Entry File:** ⚠️ **DEIXE VAZIO** (este é React, não Node backend) ✅

4. Clique **SAVE** → **DEPLOY**

5. Aguarde o build terminar (2-5 minutos)

6. Teste seu site: `seu-dominio.com`

---

## ❌ Se Ainda Receber Erro:

### Erro: "Output Directory não encontrado"
**Solução:** Certifique-se de usar **apenas** `build` (não `build/` ou caminho completo)

### Erro: "Entry File não encontrado" ou "src/index.js não encontrado"
**Solução:** ⚠️ **DEIXE O CAMPO DE ENTRY FILE VAZIO!** Este é um projeto React Frontend, não um backend Node.js. A Hostinger vai servir os arquivos estáticos da pasta `build/` automaticamente.

### Erro: Página em branco ou 404 em rotas
**Solução:** Configure **Fallback Route** para `index.html` (isto faz redirecionar todas as rotas para index.html - necessário para React Router)

---

## 🔧 Alternativa: Upload Manual

Se o deployment automático não funcionar:

1. Gerar build: `npm run build`
2. Compactar: `build.zip`
3. Upload via FTP/cPanel para `public_html/`
4. Extrair arquivos
5. Pronto!

---

## ✔️ Resultado Final

Após sucesso, você verá:
- ✅ Build Status: "Success"
- ✅ Site acessível em seu domínio
- ✅ Todas as páginas carregando
- ✅ API comunicando com backend

---

**Última atualização:** 15/04/2026
