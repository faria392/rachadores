# 🔧 Guia de Implementação - Dashboard Financeiro API

## 🎯 Objetivo Alcançado

Refatoração completa da Dashboard Financeira:
- ❌ **REMOVIDO**: localStorage com chave fixa "dashboardFinanceiro" (compartilhado)
- ✅ **IMPLEMENTADO**: API + JWT para isolamento por usuário

---

## 📊 Estrutura do Banco de Dados

### Tabela: `revenue`
```sql
CREATE TABLE revenue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATETIME NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, DATE(date))
);
```

### Tabela: `expenses`
```sql
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATETIME NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, DATE(date))
);
```

---

## 🛠️ Backend - Rotas API

### Base URL
```
http://localhost:5000/api/financial
```

### Rotas Implementadas

#### 1️⃣ GET `/financial/summary`
**Busca todos os dados financeiros do usuário**

```
Headers:
  Authorization: Bearer {JWT_TOKEN}

Response:
[
  {
    "data": "2026-04-16",
    "faturamento": 1500,
    "gastos": [
      { "id": 1, "nome": "Anúncio", "valor": 250 },
      { "id": 2, "nome": "Fumo", "valor": 75 }
    ]
  },
  ...
]
```

#### 2️⃣ GET `/financial/day/:date`
**Busca dados de um dia específico**

```
Parameters:
  date: "2026-04-16"

Response:
{
  "data": "2026-04-16",
  "faturamento": 1500,
  "gastos": [...]
}
```

#### 3️⃣ POST `/financial/revenue`
**Adiciona ou atualiza faturamento**

```
Body:
{
  "date": "2026-04-16",
  "amount": 1500
}

Response:
{
  "success": true,
  "message": "Faturamento salvo com sucesso"
}
```

#### 4️⃣ POST `/financial/expenses`
**Adiciona nova despesa**

```
Body:
{
  "date": "2026-04-16",
  "name": "Anúncio",
  "amount": 250
}

Response:
{
  "success": true,
  "id": 123,
  "message": "Despesa adicionada com sucesso"
}
```

#### 5️⃣ PUT `/financial/expenses/:id`
**Edita despesa existente**

```
Parameters:
  id: 123

Body:
{
  "name": "Anúncio Google",
  "amount": 300
}

Response:
{
  "success": true,
  "message": "Despesa atualizada com sucesso"
}
```

#### 6️⃣ DELETE `/financial/expenses/:id`
**Remove despesa**

```
Parameters:
  id: 123

Response:
{
  "success": true,
  "message": "Despesa removida com sucesso"
}
```

---

## 🎨 Frontend - React Component

### Localização
```
frontend/src/pages/DashboardFinanceiro.jsx
```

### Features Implementadas

#### ✅ Autenticação
- Verifica token JWT no localStorage
- Redireciona para /login se não autenticado

#### ✅ Carregamento de Dados
```javascript
useEffect(() => {
  const fetchDados = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/financial/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dados = await response.json();
    setDados(dados);
  };
  fetchDados();
}, []);
```

#### ✅ Operações
- **Salvar Faturamento**: POST via API
- **Adicionar Gasto**: POST via API
- **Editar Gasto**: PUT via API
- **Remover Gasto**: DELETE via API

#### ✅ Estado Local
- Dados são atualizados localmente após sucesso da API
- Feedback visual com mensagens de sucesso/erro
- Loading state enquanto carrega dados

---

## 🔐 Segurança

### Como Funciona

1. **Frontend envia JWT token:**
   ```javascript
   headers: { 'Authorization': `Bearer ${token}` }
   ```

2. **Backend valida token:**
   ```javascript
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.userId = decoded.id;
   ```

3. **Todas as queries filtram por userId:**
   ```sql
   WHERE user_id = ?
   ```

### Resultado
- ✅ Cada usuário vê APENAS seus dados
- ✅ Impossível acessar dados de outro usuário
- ✅ Sem compartilhamento de dados

---

## 🚀 Como Usar

### 1. Executar Backend
```bash
cd backend
npm install
npm start
```

### 2. Configurar Frontend
```bash
cd frontend
npm install
```

**Criar arquivo `.env`:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Executar Frontend
```bash
npm start
```

### 4. Testar
1. Fazer login
2. Ir para "Planilha"
3. Adicionar faturamento/despesas
4. Verificar que os dados são salvos no banco
5. Logout e login com outro usuário
6. Verificar que vê apenas seus dados

---

## 📝 Checklist de Verificação

- [ ] Tabelas `revenue` e `expenses` criadas
- [ ] Backend rodando na porta 5000
- [ ] Frontend rodando na porta 3000
- [ ] `.env` configurado corretamente
- [ ] Usuário consegue fazer login
- [ ] Dados são salvos no banco de dados
- [ ] Cada usuário vê apenas seus dados
- [ ] Faturamento pode ser editado
- [ ] Despesas podem ser adicionadas/editadas/removidas
- [ ] Gráficos aparecem com os dados corretos

---

## 🔍 Troubleshooting

### Erro: "401 Token inválido"
- Verificar se o token está sendo enviado corretamente
- Verificar se JWT_SECRET está configurado no .env

### Erro: "500 Erro ao buscar dados"
- Verificar se as tabelas existem no banco
- Verificar logs do backend

### Dados não aparecem
- Verificar se o usuário tem dados registrados
- Verificar se está autenticado com JWT válido
- Verificar REACT_APP_API_URL no .env

---

## 📚 Arquivos Modificados

1. **Backend**
   - ✅ `backend/src/routes/financial.js` (NOVO)
   - ✅ `backend/src/index.js` (ATUALIZADO)

2. **Frontend**
   - ✅ `frontend/src/pages/DashboardFinanceiro.jsx` (REFATORADO)

---

## 🎉 Resultado Final

```
ANTES (❌ Errado):
- localStorage.getItem('dashboardFinanceiro')
- Todos os usuários compartilhavam dados
- Sem persistência em banco

DEPOIS (✅ Correto):
- API + JWT
- Cada usuário isolado
- Dados persistidos no banco
- Seguro e escalável
```
