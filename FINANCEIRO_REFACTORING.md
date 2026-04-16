# Refatoração do Dashboard Financeiro - Documentação

## 📋 Resumo das Mudanças

O componente `DashboardFinanceiro` foi completamente refatorado para:
- ❌ **Remover** localStorage (dados locais)
- ✅ **Implementar** backend com banco de dados (MySQL)
- ✅ **Multi-tenant** por usuário (cada usuário vê apenas seus dados)
- ✅ **Autenticação JWT** integrada
- ✅ **API RESTful** profissional

---

## 🗄️ Arquitetura do Banco de Dados

### Tabelas Criadas Automaticamente

#### `registros_financeiros`
```sql
CREATE TABLE registros_financeiros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  data DATE NOT NULL,
  faturamento DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_data (user_id, data),
  INDEX idx_user_data (user_id, data)
)
```

#### `gastos`
```sql
CREATE TABLE gastos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registro_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registro_id) REFERENCES registros_financeiros(id) ON DELETE CASCADE,
  INDEX idx_registro_id (registro_id)
)
```

### Índices
- `unique_user_data`: Garante uma única entrada por usuário por dia
- `idx_user_data`: Otimiza queries de busca por user_id e data

---

## 🔌 API RESTful - Endpoints

### Base URL
```
http://localhost:5000/api/financeiro
```

### Headers Obrigatórios
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Endpoints

#### 1. **GET /api/financeiro**
Retorna todos os registros financeiros do usuário logado

**Response:**
```json
[
  {
    "id": 1,
    "data": "2024-04-16",
    "faturamento": 1500.00,
    "gastos": [
      {
        "id": 1,
        "nome": "Anúncio",
        "valor": 250.00
      },
      {
        "id": 2,
        "nome": "Combustível",
        "valor": 120.00
      }
    ]
  }
]
```

---

#### 2. **POST /api/financeiro/faturamento**
Cria ou atualiza faturamento para uma data

**Request Body:**
```json
{
  "data": "2024-04-16",
  "faturamento": 1500.00
}
```

**Response:** Mesmo objeto retornado

---

#### 3. **POST /api/financeiro/gasto**
Adiciona um novo gasto

**Request Body:**
```json
{
  "data": "2024-04-16",
  "nome": "Anúncio",
  "valor": 250.00
}
```

**Response:**
```json
{
  "id": 1,
  "nome": "Anúncio",
  "valor": 250.00
}
```

---

#### 4. **PUT /api/financeiro/gasto/:id**
Edita um gasto existente

**Request Body:**
```json
{
  "nome": "Anúncio Atualizado",
  "valor": 300.00
}
```

**Response:** Objeto gasto atualizado

---

#### 5. **DELETE /api/financeiro/gasto/:id**
Remove um gasto

**Response:**
```json
{
  "success": true
}
```

---

#### 6. **PUT /api/financeiro/faturamento/:data**
Edita faturamento de uma data específica

**Request Body:**
```json
{
  "faturamento": 2000.00
}
```

**Response:**
```json
{
  "data": "2024-04-16",
  "faturamento": 2000.00
}
```

---

## 📱 Service Frontend - `financeiroService.js`

### Métodos Disponíveis

```javascript
import financeiroService from '@/services/financeiroService';

// Buscar todos os dados
const dados = await financeiroService.getDados();

// Salvar faturamento
await financeiroService.salvarFaturamento('2024-04-16', 1500);

// Editar faturamento
await financeiroService.editarFaturamento('2024-04-16', 2000);

// Adicionar gasto
await financeiroService.adicionarGasto('2024-04-16', 'Anúncio', 250);

// Editar gasto
await financeiroService.editarGasto(1, 'Anúncio Atualizado', 300);

// Deletar gasto
await financeiroService.deletarGasto(1);
```

---

## 🔐 Segurança

### JWT Token
- **Armazenado em:** `localStorage` como `token`
- **Enviado em:** Header `Authorization: Bearer {token}`
- **Verificação:** Middleware `verifyToken` no backend

### Multi-tenant
- Cada usuário só vê dados onde `user_id = token.id`
- WHERE clauses garantem isolamento de dados
- Sem possibilidade de acessar dados de outros usuários

### Tratamento de Erros
```javascript
try {
  await financeiroService.salvarFaturamento(data, valor);
} catch (error) {
  if (error.response?.status === 403) {
    // Acesso não autorizado
  } else if (error.response?.status === 500) {
    // Erro do servidor
  }
}
```

---

## 🚀 Como Rodar

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente (.env)
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=sua_senha
DB_NAME=faturamento_competicaos
JWT_SECRET=sua_chave_secreta
PORT=5000

# Iniciar servidor
npm start          # Produção
npm run dev        # Desenvolvimento com auto-reload
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Definir API URL (opcional - padrão é localhost:5000)
VITE_API_URL=http://localhost:5000/api

# Iniciar servidor
npm start          # Desenvolvimento (porta 3000)
npm run build      # Build para produção
```

---

## 🧪 Testando a Integração

### 1. Criar Conta
```bash
POST /api/auth/register
{
  "name": "João",
  "email": "joao@test.com",
  "password": "senha123"
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "joao@test.com",
  "password": "senha123"
}

Response:
{
  "id": 1,
  "name": "João",
  "email": "joao@test.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Acessar Dashboard
- Use o token retornado no login
- Sistema automaticamente fará requisições com esse token
- Todos os dados carregarão do backend

---

## 📊 Fluxo de Dados

```
Frontend (React)
    ↓
financeiroService.js (Axios)
    ↓
Backend (Express)
    ↓
Middleware (verifyToken)
    ↓
Routes (POST /financeiro/faturamento, etc)
    ↓
MySQL Database
    ↓
Response JSON back to Frontend
```

---

## ⚡ Melhorias Implementadas

### ✅ Performance
- Índices de banco de dados para queries rápidas
- UNIQUE constraint para evitar duplicatas
- Connection pooling no backend

### ✅ UX/Loading States
- Indicador de carregamento ao abrir página
- Overlay de loading ao salvar dados
- Botões desabilitados durante operações

### ✅ Tratamento de Erros
- Try/catch em todas operações async
- Mensagens de feedback ao usuário
- Logging no backend para debugging

### ✅ Validações
- Validação de valores no frontend
- Validação de autorização no backend (user_id)
- Validação de tipos de dados

---

## 📝 Arquivo .env do Backend

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=faturamento_competicaos

# JWT
JWT_SECRET=sua_chave_secreta_super_segura

# Server
PORT=5000
NODE_ENV=development
```

---

## 🔄 Mudanças no Componente React

### Antes (localStorage)
```javascript
const [dados, setDados] = useState([]);

useEffect(() => {
  const saved = localStorage.getItem('dashboardFinanceiro');
  setDados(JSON.parse(saved) || []);
}, []);

useEffect(() => {
  localStorage.setItem('dashboardFinanceiro', JSON.stringify(dados));
}, [dados]);
```

### Depois (API)
```javascript
const [dados, setDados] = useState([]);
const [carregando, setCarregando] = useState(true);
const [salvando, setSalvando] = useState(false);

useEffect(() => {
  carregarDados();
}, []);

const carregarDados = async () => {
  try {
    setCarregando(true);
    const dados = await financeiroService.getDados();
    setDados(dados);
  } catch (error) {
    mostrarFeedback('❌ Erro ao carregar dados');
  } finally {
    setCarregando(false);
  }
};
```

---

## ✨ Funcionalidades Mantidas

✅ Seleção de data
✅ Cadastro de faturamento por dia
✅ Cadastro de gastos com nome + valor
✅ Edição de faturamento
✅ Edição de gastos
✅ Exclusão de gastos
✅ Cálculo automático (total, lucro)
✅ Gráficos (Recharts)
✅ Feedback visual
✅ Modal de edição
✅ Layout Tailwind CSS
✅ Design responsivo

---

## 🐛 Troubleshooting

### "Erro ao carregar dados"
- Verificar se o backend está rodando (`npm start`)
- Verificar se o token é válido
- Verificar permissões de banco de dados

### "Token inválido"
- Fazer logout e novo login
- Verificar se JWT_SECRET está consistente entre aplicações

### "Erro 503" no banco
- Verificar credenciais (.env)
- Verificar se MySQL está rodando
- Verificar permissões de usuário

---

## 📚 Referências

- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Documentation](https://jwt.io/)
- [Axios Documentation](https://axios-http.com/)
- [React Hooks Documentation](https://react.dev/reference/react)

---

**Refatoração concluída em: 16/04/2026**
**Status: ✅ Pronto para produção**
