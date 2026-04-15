# 🚀 GUIA RÁPIDO DE EXECUÇÃO

## ✅ Pré-requisitos
- XAMPP instalado com MySQL
- Node.js instalado
- 2 terminais/abas

---

## 1️⃣ INICIE O MYSQL (XAMPP)

1. Abra **XAMPP Control Panel**
2. Clique em **Start** ao lado de MySQL
3. Confirme que MySQL está rodando (verde)

---

## 2️⃣ TERMINAL 1 - BACKEND

```bash
cd c:\rachadores\backend
npm run dev
```

**Esperado:**
```
✓ Banco de dados criado/verificado
✓ Tabela users criada/verificada
✓ Tabela revenue criada/verificada
🚀 Backend rodando na porta 5000
📍 API disponível em http://localhost:5000
```

---

## 3️⃣ TERMINAL 2 - FRONTEND

```bash
cd c:\rachadores\frontend
npm start
```

**Esperado:**
- Navegador abre em `http://localhost:3000`
- Tela de Login aparece

---

## 🎮 TESTANDO A APLICAÇÃO

### Registre-se
1. Clique em "Cadastre-se"
2. Preencha com dados de teste:
   - **Nome:** João Silva
   - **Email:** joao@email.com
   - **Senha:** senha123
3. Clique em "Cadastrar"

### Adicione Faturamento
1. Clique na aba "Adicionar Faturamento"
2. Selecione a data (hoje é recomendado)
3. Insira um valor (ex: 1000)
4. Clique em "Registrar Faturamento"

### Veja o Ranking
1. Clique na aba "Ranking Geral" ou "Ranking do Dia"
2. Você aparecerá na lista

---

## 📱 URLs IMPORTANTES

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Docs**:
  - Health: http://localhost:5000/api/health
  - Ranking: http://localhost:5000/api/revenue/ranking

---

## ❌ RESOLUÇÃO DE PROBLEMAS

### MySQL não conecta
```bash
# Verifique no XAMPP se está verde
# Se não: clique em "Start" novamente
# Espere alguns segundos
```

### Backend diz "Connection refused"
```bash
# XAMPP MySQL não está ativo
# Inicie pelo XAMPP Control Panel
```

### Frontend não carrega dados
```bash
# Verifique no console do navegador (F12)
# Certifique-se que backend está rodando (porta 5000)
```

### Porta já em uso
```bash
# Se a porta 5000 já está usando:
# Backend: mude PORT no arquivo .env
# Se a porta 3000 já está usando:
# Frontend: npm start pedirá outra porta
```

---

## 📊 ESTRUTURA RÁPIDA

```
Backend (Node.js)
├── /api/auth/register - Criar conta
├── /api/auth/login - Fazer login
├── /api/revenue/add - Adicionar faturamento
├── /api/revenue/ranking - Ver ranking geral
└── /api/revenue/ranking/daily - Ver ranking hoje

Frontend (React)
├── /login - Tela de login
├── /register - Tela de cadastro
└── /dashboard - Dashboard principal
    ├── Visão Geral
    ├── Adicionar Faturamento
    ├── Ranking Geral
    └── Ranking do Dia
```

---

## 💡 DICAS

- Para criar vários usuários: em outro navegador abra incógnito
- Para testar diferentes datas: use qualquer data no formulário
- O banco MySQL é criado automaticamente na primeira execução
- Não precisa fazer nada manualmente no MySQL

---

**Pronto! 🎉 Sua aplicação está funcionando!**
