# 🚀 Guia de Inicialização - Dashboard Financeiro Refatorado

## ✅ Pré-requisitos

- ✅ Node.js (v16+)
- ✅ MySQL (v5.7+)
- ✅ Git
- ✅ npm ou yarn

---

## 🔧 Configuração Inicial

### 1️⃣ Configurar Backend

```bash
# Navegar para backend
cd backend

# Instalar dependências
npm install

# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais MySQL
# DB_HOST=localhost
# DB_USERNAME=root
# DB_PASSWORD=sua_senha_mysql
# DB_NAME=faturamento_competicaos
# JWT_SECRET=sua_chave_secreta_aqui

# Iniciar servidor
npm start

# Deve aparecer:
# ✅ Banco de dados inicializado com sucesso
# 🚀 Backend rodando na porta 5000
```

### 2️⃣ Configurar Frontend

```bash
# Em outra aba do terminal
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# Deve abrir automaticamente:
# http://localhost:3000
```

---

## 🧪 Teste Rápido (5 minutos)

### 1. Criar Conta de Teste

1. Abra http://localhost:3000
2. Clique em "Register"
3. Preencha:
   - Nome: `João da Silva`
   - Email: `joao@test.com`
   - Senha: `senha123`
4. Clique em "Registrar"

### 2. Acessar Dashboard Financeiro

1. Após login, você será redirecionado
2. Clique em "Planilha" ou acesse `/dashboard-financeiro`
3. Deve carregar com spinner

### 3. Testar Funcionalidades

#### ✅ Adicionar Faturamento
```
1. Veja o valor atual: R$ 0,00
2. No formulário "Registrar Faturamento"
3. Digite: 1500
4. Clique "Salvar"
5. Deve mostrar: ✅ Faturamento registrado com sucesso!
6. Valor deve atualizar para: R$ 1.500,00
```

#### ✅ Adicionar Gasto
```
1. No formulário "Adicionar Gasto"
2. Nome: Anúncio
3. Valor: 250
4. Clique "Adicionar Gasto"
5. Deve aparecer na lista "Gastos do Dia"
6. GASTOS deve atualizar para: R$ 250,00
7. LUCRO deve ser: R$ 1.250,00
```

#### ✅ Adicionar Mais Gastos
```
1. Nome: Combustível
2. Valor: 120
3. Clicar "Adicionar Gasto"
4. Nome: Fumo
5. Valor: 75
6. Clicar "Adicionar Gasto"
7. Verificar totais:
   - GASTOS: R$ 445,00
   - LUCRO: R$ 1.055,00
```

#### ✅ Editar Gasto
```
1. Clique no ícone de edição (lápis) de um gasto
2. Modal abre com valores atuais
3. Altere "Anúncio" para "Anúncio Pago"
4. Altere valor de 250 para 300
5. Clique "Salvar"
6. Deve mostrar: ✅ Gasto atualizado!
7. Lista deve atualizar
```

#### ✅ Deletar Gasto
```
1. Clique no ícone de lixeira de um gasto
2. Gasto deve desaparecer
3. Deve mostrar: ✅ Gasto removido!
4. Totais devem recalcular
```

#### ✅ Trocar Data
```
1. Clique no seletor de data
2. Selecione amanhã
3. Deve limpar todos os dados
4. Deve mostrar: "Nenhum gasto registrado para este dia"
5. FATURAMENTO: R$ 0,00
6. GASTOS: R$ 0,00
7. LUCRO: R$ 0,00
8. Adicione alguns dados para essa data
9. Volte para a data anterior
10. Dados originais devem aparecer (persistência!)
```

#### ✅ Visualizar Gráficos
```
1. Após adicionar dados em 2-3 datas diferentes
2. Role para baixo
3. Veja os dois gráficos preenchidos:
   - Faturamento vs Gastos vs Lucro (BarChart)
   - Evolução do Lucro (AreaChart)
4. Hover sobre barras deve mostrar valores
```

---

## 🧑‍💻 Teste Multi-tenant

### Objetivo
Verificar que cada usuário vê APENAS seus dados

### Passo a Passo

```bash
# Terminal 1: Backend rodando
npm start

# Terminal 2: Frontend rodando
npm start
```

### 1. Login com Usuário A

```
1. http://localhost:3000
2. Login com: joao@test.com / senha123
3. Ir para Dashboard Financeiro
4. Adicionar:
   - Faturamento: 1500
   - Gasto: "Anúncio" 250
   - Gasto: "Combustível" 120
5. Anotar os valores
```

### 2. Logout

```
1. Clique em perfil (canto superior)
2. Clique "Logout"
3. Será redirecionado para /login
```

### 3. Criar Novo Usuário (B)

```
1. Clique "Não tem conta? Registre-se"
2. Registre com:
   - Nome: Maria Silva
   - Email: maria@test.com
   - Senha: senha456
3. Será logado automaticamente
```

### 4. Adicionar Dados Diferentes para Usuário B

```
1. Ir para Dashboard Financeiro
2. Adicionar:
   - Faturamento: 2000 (DIFERENTE!)
   - Gasto: "Uber" 50 (DIFERENTE!)
   - Gasto: "Café" 25 (DIFERENTE!)
3. Anotar os valores
```

### 5. Verificar Isolamento

```
1. Logout (Usuário B)
2. Login com Usuário A (joao@test.com)
3. Ir para Dashboard Financeiro
4. Verificar:
   - FATURAMENTO: R$ 1.500,00 ✅ (Seus dados!)
   - GASTOS: R$ 370,00 ✅ (Anúncio + Combustível)
   - Não vê: Uber, Café ✅ (Dados de Maria)
5. Logout
6. Login com Usuário B (maria@test.com)
7. Ir para Dashboard Financeiro
8. Verificar:
   - FATURAMENTO: R$ 2.000,00 ✅ (Seus dados!)
   - GASTOS: R$ 75,00 ✅ (Uber + Café)
   - Não vê: Anúncio, Combustível ✅ (Dados de João)
```

### ✅ Resultado Esperado
Se tudo funcionou, cada usuário vê APENAS seus próprios dados!

---

## 🐛 Verificar Banco de Dados

### Via MySQL CLI

```bash
# Conectar ao MySQL
mysql -u root -p

# Usar banco
USE faturamento_competicaos;

# Ver usuários
SELECT id, name, email FROM users;

# Ver registros financeiros (User 1)
SELECT * FROM registros_financeiros WHERE user_id = 1;

# Ver gastos do User 1
SELECT g.* FROM gastos g
JOIN registros_financeiros rf ON g.registro_id = rf.id
WHERE rf.user_id = 1;

# Ver registros financeiros (User 2)
SELECT * FROM registros_financeiros WHERE user_id = 2;

# Ver gastos do User 2
SELECT g.* FROM gastos g
JOIN registros_financeiros rf ON g.registro_id = rf.id
WHERE rf.user_id = 2;
```

---

## 📊 Verificar Console de Desenvolvimento

### Browser DevTools (F12)

#### Network Tab
```
✅ POST /api/financeiro/faturamento - Status 200
✅ POST /api/financeiro/gasto - Status 200
✅ PUT /api/financeiro/gasto/:id - Status 200
✅ DELETE /api/financeiro/gasto/:id - Status 200
❌ Status 403 = Unauthorized (esperado se trocar user_id)
```

#### Console Tab
```
✅ Nenhum erro vermelho durante operações
✅ Logs mostram operações async completas
❌ Se houver erro, anota a mensagem
```

### Backend Console (Terminal)

```
✅ GET /api/financeiro - user_id: 1
✅ POST /api/financeiro/faturamento - Salvo
✅ DELETE /api/financeiro/gasto/:id - Deletado
❌ Erro 403 ao tentar acessar dados de outro user
```

---

## 🚨 Troubleshooting

### Problema: "Cannot connect to backend"

```bash
# Verificar se backend está rodando
lsof -i :5000

# Se não estiver, iniciar:
cd backend
npm start

# Se der erro de porta, mudar em .env
PORT=5001
```

### Problema: "Database connection failed"

```bash
# Verificar MySQL
mysql -u root -p -e "SELECT 1"

# Se falhar, iniciar MySQL (Windows):
net start MySQL80

# Se falhar, iniciar MySQL (Mac):
brew services start mysql

# Se falhar, iniciar MySQL (Linux):
sudo service mysql start
```

### Problema: "Token not found"

```bash
# Limpar localStorage
# Abrir DevTools (F12)
# Application > Local Storage > http://localhost:3000
# Deletar "token"
# Fazer novo login
```

### Problema: "CORS error"

```bash
# Backend precisa de CORS
# Verificar backend/src/index.js:
app.use(cors());

# Se problema persistir, adicionar:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 📈 Monitore Performance

### Queries Lentas (MySQL)

```sql
-- Ver queries executadas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Ver log
SHOW VARIABLES LIKE 'slow_query_log_file';
```

### Response Times (Frontend)

```javascript
// No console do browser
performance.mark('api-call-start');
await financeiroService.getDados();
performance.mark('api-call-end');
performance.measure('api-call', 'api-call-start', 'api-call-end');
```

---

## ✨ Próximos Passos

1. **Deploy em produção**
   ```bash
   # Frontend
   cd frontend
   npm run build
   # Upload dist/ para servidor web
   
   # Backend
   # Deploy em servidor Node (Heroku, DigitalOcean, etc)
   ```

2. **Configurar HTTPS**
   ```
   Necessário para produção
   Use Let's Encrypt grátis
   ```

3. **Adicionar novos recursos**
   - Paginação
   - Filtros avançados
   - Exportar para CSV
   - Relatórios

---

## 📞 Suporte

Se encontrar problemas:

1. **Verificar logs**
   - Backend console
   - Browser DevTools (F12)
   - MySQL logs

2. **Ler documentação**
   - `FINANCEIRO_REFACTORING.md` - Arquitetura
   - `REFACTORING_SUMMARY.md` - Sumário de mudanças

3. **Limpar e recomeçar**
   ```bash
   # Limpar banco
   DROP DATABASE faturamento_competicaos;
   
   # Limpar cache frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

---

**Bom teste! 🎉**

Qualquer dúvida, consulte a documentação técnica completa em `FINANCEIRO_REFACTORING.md`
