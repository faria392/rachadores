# 💰 Competição de Faturamento - Full Stack

Sistema web completo para competição de faturamento entre amigos com rankings em tempo real.

## 📋 Funcionalidades

✅ Cadastro e autenticação com JWT  
✅ Registro diário de faturamento  
✅ Ranking geral (acumulado)  
✅ Ranking do dia  
✅ Dashboard com resumo de ganhos  
✅ Interface moderna e responsiva  
✅ Backend com MySQL + Node.js  
✅ Frontend com React  

## 🛠️ Tecnologias

### Backend
- Node.js + Express.js
- MySQL (com XAMPP)
- JWT para autenticação
- bcryptjs para hash de senhas

### Frontend
- React 18.2
- React Router para navegação
- Axios para requisições HTTP
- CSS3 com design responsivo

## ⚙️ Pré-requisitos

- Node.js instalado
- XAMPP com MySQL rodando
- npm ou yarn

## 🚀 Como executar

### 1️⃣ Configure o MySQL (XAMPP)

1. Abra o XAMPP Control Panel
2. Clique em "Start" ao lado de **MySQL**
3. MySQL estará rodando em `localhost:3306`

### 2️⃣ Backend (Express + MySQL)

```bash
cd backend

# Instale dependências
npm install

# Configure o ambiente (.env já vem pronto)
# Se precisar, edite o arquivo .env

# Execute em desenvolvimento
npm run dev
```

O backend estará em: **http://localhost:5000**

### 3️⃣ Frontend (React)

Em outro terminal:

```bash
cd frontend

# Instale dependências
npm install

# Execute
npm start
```

O frontend abrirá em: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
.
├── backend/              # API Express + MySQL
│   ├── src/
│   │   ├── index.js             # Servidor principal
│   │   ├── db.js                # Configuração MySQL
│   │   ├── middleware/
│   │   │   └── auth.js          # Proteção de rotas
│   │   └── routes/
│   │       ├── auth.js          # Autenticação
│   │       └── revenue.js       # Faturamento e ranking
│   ├── .env                     # Credenciais MySQL
│   ├── package.json
│   └── README.md
│
├── frontend/             # Interface React
│   ├── src/
│   │   ├── pages/              # Login, Register, Dashboard
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── services/           # Requisições HTTP
│   │   ├── App.js              # Componente principal
│   │   └── index.js            # Entrada
│   ├── public/
│   │   └── index.html
│   ├── .env
│   ├── package.json
│   └── README.md
│
└── README.md
```

## 📖 Como usar a aplicação

### 1️⃣ Registre-se
- Clique em "Cadastre-se"
- Preenchao com: Nome, Email e Senha
- Você será redirecionado para o Dashboard

### 2️⃣ Registre seu faturamento
- Na aba "Adicionar Faturamento"
- Selecione a data e o valor ganho
- Clique em "Registrar Faturamento"

### 3️⃣ Veja seu ranking
- **Visão Geral**: Top 5 do dia atual
- **Ranking Geral**: Faturamento total acumulado
- **Ranking do Dia**: Quem ganhou mais hoje

## 📊 Banco de Dados (MySQL)

O banco é criado automaticamente ao iniciar o backend.

**Tabelas:**

- **users**: Armazena usuários
  - id, name, email, password, created_at

- **revenue**: Histórico de faturamento
  - id, user_id, amount, date, created_at
  - Garante um registro por usuário por dia

## 🔐 Segurança

- Senhas armazenadas com bcryptjs (hash)
- Autenticação JWT com token
- Proteção de rotas no backend
- CORS habilitado para frontend
- Validação de entrada em todas as rotas

## 🌐 Fluxo de Autenticação

1. Usuário se registra → Cria novo usuário no banco
2. Backend retorna JWT token
3. Frontend armazena token no localStorage
4. Requisições incluem token no header Authorization
5. Backend valida token em cada requisição protegida

## 🚀 Próximos passos (Extras)

- [ ] WebSocket para atualização em tempo real
- [ ] Gráficos de evolução de faturamento
- [ ] Filtros por período (semana, mês)
- [ ] Exportar dados em CSV
- [ ] Deploy no Vercel (frontend) e Render (backend)

## 📝 Troubleshooting

### Backend não conecta ao MySQL
- Verifique se MySQL está rodando no XAMPP
- Veja credenciais em `backend/.env`
- Certifique-se de que a porta 3306 está aberta

### Frontend não carrega dados
- Certifique-se de que o backend está rodando (porta 5000)
- Verifique o `.env` do frontend
- Abra DevTools (F12) para ver erros em Console

### Erro "Database already exists"
- Isso é normal! Significa que o banco já foi criado
- O backend continua funcionando normalmente

## 📞 Suporte

Para dúvidas, verifique os README.md de cada pasta:
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## 📝 Rotas do Backend

- `GET /api` - Mensagem de boas-vindas
- `GET /api/health` - Status da API

## 💡 Próximos Passos

1. Expanda as rotas da API em `backend/src/index.js`
2. Crie componentes React em `frontend/src/`
3. Configure banco de dados no backend
4. Implemente autenticação
