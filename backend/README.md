# Backend - Competição de Faturamento

API REST em Node.js + Express com MySQL e autenticação JWT.

## ⚙️ Pré-requisitos

- Node.js instalado
- MySQL rodando (XAMPP ou outro servidor MySQL)

## 🚀 Como configurar e executar

1. **Configure o MySQL no XAMPP:**
   - Abra o XAMPP e inicie o MySQL
   - MySQL deve estar rodando em `localhost:3306`
   - Usuário padrão: `root`
   - Sem senha (ou coloque a sua no `.env`)

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o ambiente:**
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais MySQL:
```
JWT_SECRET=sua_chave_secreta_super_segura
NODE_ENV=development
PORT=5000

# MySQL Configuration (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=faturamento_competicao
```

4. **Execute em desenvolvimento:**
```bash
npm run dev
```

Ou em produção:
```bash
npm start
```

O backend estará disponível em `http://localhost:5000`

O banco de dados e tabelas serão criados automaticamente na primeira execução.

## 📡 Rotas da API

### Autenticação

- **POST** `/api/auth/register` - Registrar novo usuário
  ```json
  {
    "name": "João",
    "email": "joao@email.com",
    "password": "senha123"
  }
  ```

- **POST** `/api/auth/login` - Fazer login
  ```json
  {
    "email": "joao@email.com",
    "password": "senha123"
  }
  ```

- **GET** `/api/auth/me` - Obter dados do usuário (requer token)

### Faturamento

- **POST** `/api/revenue/add` - Adicionar/atualizar faturamento (requer token)
  ```json
  {
    "amount": 1500.50,
    "date": "2024-04-15"
  }
  ```

- **GET** `/api/revenue/day/:date` - Faturamento de um dia específico (requer token)

- **GET** `/api/revenue/history` - Histórico de faturamento do usuário (requer token)

- **GET** `/api/revenue/total` - Faturamento total acumulado (requer token)

- **GET** `/api/revenue/ranking` - Ranking geral (todos os usuários)

- **GET** `/api/revenue/ranking/daily` - Ranking do dia atual

- **GET** `/api/revenue/ranking/daily/:date` - Ranking de um dia específico

## 🔐 Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <token_jwt>
```

O token é retornado nas respostas de login e register.

## 🗄️ Banco de Dados

MySQL com as seguintes tabelas (criadas automaticamente):

- **users**: Dados dos usuários
  - id (INT, PK, auto-increment)
  - name (VARCHAR)
  - email (VARCHAR, UNIQUE)
  - password (VARCHAR)
  - created_at (TIMESTAMP)

- **revenue**: Histórico de faturamento
  - id (INT, PK, auto-increment)
  - user_id (INT, FK)
  - amount (DECIMAL)
  - date (DATE)
  - created_at (TIMESTAMP)
  - UNIQUE: user_id + date (um registro por usuário por dia)

## 📝 Variáveis de Ambiente

```
JWT_SECRET=sua_chave_secreta_super_segura
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=faturamento_competicao
```

## 🛠️ Tecnologias

- Express.js - Framework web
- MySQL2 - Driver MySQL
- JWT - Autenticação
- bcryptjs - Hash de senhas
- dotenv - Variáveis de ambiente
