# 🔧 Correção: Error "react-scripts: command not found"

## Problema
Ao fazer deploy na Hostinger (ou outro servidor Linux), o comando `npm run build` falhava com:
```
sh: react-scripts: command not found
```

## Causa
O script de build na raiz (`npm run build`) chama `cd frontend && npm run build`, mas as dependências do frontend (incluindo `react-scripts`) nunca eram instaladas no servidor.

### Sequência de Deploy Incorreta (Antes)
```
1. npm install (raiz) → instala apenas dependências da raiz
2. npm run build (raiz) → tenta executar frontend/npm run build
3. ❌ react-scripts não existe em node_modules do frontend
```

## Solução Implementada

### 1️⃣ Adicionado `postinstall` no package.json raiz
**Arquivo:** [package.json](package.json)

```json
"postinstall": "cd frontend && npm install"
```

Isto garante que quando `npm install` é executado na raiz, as dependências do frontend são instaladas automaticamente.

### Sequência de Deploy Correta (Depois)
```
1. npm install (raiz)
   ✓ Instala dependências da raiz
   ✓ Executa postinstall → cd frontend && npm install
2. npm run build (raiz)
   ✓ Chama cd frontend && npm run build
   ✓ react-scripts já está instalado ✓
```

### 2️⃣ Verificação: react-scripts no frontend
**Arquivo:** [frontend/package.json](frontend/package.json)

```json
"react-scripts": "5.0.1"  ✓ Presente
```

## Verificação Local

### Teste 1: Build da raiz
```bash
npm run build
```
✅ Resultado: Build completo sem erros (warnings apenas de ESLint)

### Teste 2: Limpar e refazer do zero (simula deploy)
```bash
# Remover node_modules
rm -r node_modules
rm -r frontend/node_modules

# Reinstalar (como faria o Hostinger)
npm install

# Build
npm run build
```

## Estrutura Final do Projeto

```
c:\rachadores\
├── package.json (raiz)
│   ├── scripts.postinstall: "cd frontend && npm install"
│   ├── scripts.build: "cd frontend && npm run build"
│   └── dependencies: [backend deps]
│
├── frontend/
│   ├── package.json
│   │   ├── react-scripts: "5.0.1" ✓
│   │   └── dependencies: [frontend deps]
│   ├── src/
│   │   └── [React components]
│   ├── public/
│   │   ├── index.html
│   │   ├── _redirects ✓
│   │   └── [assets]
│   └── build/
│       └── [Production build]
│
└── backend/
    ├── package.json
    └── src/
```

## 🚀 Deploy no Hostinger

1. **Conectar repositório Git**
   - Push para GitHub
   - Conectar no Hostinger

2. **Configurações de Build**
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Entry File: (deixe vazio)
   - Fallback Route: `index.html`

3. **Resultado Esperado**
   - ✅ `npm install` → instala tudo, incluindo frontend
   - ✅ `npm run build` → build completo sem erro

## 📝 Resumo das Mudanças

### package.json (raiz)
- ✅ Adicionado: `"postinstall": "cd frontend && npm install"`

### frontend/package.json
- ✅ Verificado: `react-scripts` está presente
- ✅ Verificado: Scripts de build estão corretos

## ✅ Checklist

- [x] `react-scripts` presente no frontend
- [x] `postinstall` adicionado na raiz
- [x] Build teste executado com sucesso
- [x] Estrutura de monorepo validada
- [x] Pronto para deploy na Hostinger
