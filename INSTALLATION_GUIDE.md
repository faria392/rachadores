# 🔧 Guia de Instalação e Troubleshooting - Gerenciador de Tabelas

## ✅ Pré-requisitos

- Node.js v14+ instalado
- MySQL 5.7+ instalado e rodando
- Git (opcional)
- Variáveis de ambiente configuradas

## 📦 Instalação Completa

### 1. Backend

```bash
# Navegar para pasta do backend
cd backend

# Instalar dependências
npm install

# Verificar se tem .env configurado
# Se não tiver, crie um com:
cat > .env << EOF
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=faturamento_competicaos
DB_PORT=3306
JWT_SECRET=sua_chave_secreta_aqui
PORT=5000
EOF

# Iniciar o servidor
npm start
# Ou em desenvolvimento (com auto-reload)
npm run dev
```

### 2. Frontend

```bash
# Navegar para pasta do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm start
# Ou fazer build para produção
npm run build
```

## 🐛 Troubleshooting

### Problema: "Erro ao conectar ao banco de dados"

**Solução:**
1. Verifique se MySQL está rodando
2. Verifique credenciais em `.env`
3. Verifique porta (padrão 3306)

```bash
# Linux/Mac
sudo service mysql status
sudo service mysql start

# Windows
# Abra Services (services.msc) e procure "MySQL"
# Ou use: net start MySQL80
```

### Problema: "Tabelas não criadas"

**Solução:**
1. As tabelas são criadas automaticamente na primeira execução
2. Se não forem criadas, verifique erros no console
3. Tente criar manualmente:

```sql
USE faturamento_competicaos;

CREATE TABLE IF NOT EXISTS user_tables (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  UNIQUE KEY unique_user_table (user_id, table_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS table_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  table_id INT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  pix_key VARCHAR(255),
  cpf VARCHAR(14),
  name VARCHAR(100) NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ativa',
  account_type VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES user_tables(id) ON DELETE CASCADE,
  INDEX idx_table_id (table_id),
  INDEX idx_status (status),
  INDEX idx_account_type (account_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Problema: "401 Unauthorized ao chamar API"

**Solução:**
1. Faça login primeiro
2. Token é armazenado em localStorage
3. Verifique se token está sendo enviado:

```javascript
// Abra o Console do Navegador (F12)
// E verifique:
console.log(localStorage.getItem('token'))
```

### Problema: "Página em branco / não carrega"

**Solução:**
1. Abra DevTools (F12)
2. Verifique a aba "Console" para erros
3. Verifique a aba "Network" para requisições falhando
4. Se houver erro CORS, verifique se backend está na porta 5000

### Problema: "Página mostra 'Nenhuma tabela criada'"

**Solução:**
1. Clique em "Nova Tabela"
2. Digite um nome (ex: "69B.com")
3. Clique em "Criar"

### Problema: "Erros de tipo nos campos do usuário"

**Solução:**
Verifique que:
- **Telefone**: texto (ex: "(11) 99999-0001")
- **Nome**: texto
- **CPF**: texto formatado (ex: "123.456.789-00")
- **Saldo**: número com até 2 casas decimais

### Problema: "Não consegue adicionar usuário - campos obrigatórios"

**Solução:**
Preencha sempre:
- ✓ **Telefone** (obrigatório)
- ✓ **Nome** (obrigatório)

Os outros campos são opcionais

### Problema: "Múltiplas contas mãe na tabela"

**Solução:**
Isso não deveria acontecer. Se acontecer:
1. Edite a tabela no banco:

```sql
UPDATE table_users 
SET account_type = 'normal' 
WHERE table_id = 1 AND id NOT IN (
  SELECT id FROM table_users WHERE table_id = 1 AND account_type = 'mae' LIMIT 1
);
```

## 📱 Testando no Mobile

### Android
1. Abra um terminal na pasta do frontend
2. Localize o IP do seu computador: `ipconfig` (Windows) ou `ifconfig` (Linux/Mac)
3. No navegador do celular, acesse: `http://SEU_IP:3000`

### iOS
Mesmo processo do Android

## 🔍 Verificação Rápida

### Verificar Backend
```bash
# Terminal
curl -X GET http://localhost:5000/api/health

# Esperado: {"status":"OK","timestamp":"..."}
```

### Verificar Frontend
1. Abra http://localhost:3000
2. Você deve ver a página de login

### Verificar Banco de Dados
```bash
# Terminal MySQL
mysql -u root -p
use faturamento_competicaos;
SHOW TABLES;
# Deve aparecer: user_tables, table_users
```

## 🚀 Deploy (Produção)

### Backend (Heroku, AWS, DigitalOcean)

```bash
# Build
npm run build

# Ou usar docker
docker build -t tabelas-backend .
docker run -p 5000:5000 -e DB_HOST=... tabelas-backend
```

### Frontend (Vercel, Netlify, AWS S3)

```bash
# Build
npm run build

# O arquivo pronto fica em dist/
# Suba isso para seu hosting
```

## 📊 Verificar Dados no Banco

```sql
-- Ver todas as tabelas
SELECT * FROM user_tables;

-- Ver usuários de uma tabela
SELECT * FROM table_users WHERE table_id = 1;

-- Ver saldo total de uma tabela
SELECT SUM(balance) as total FROM table_users WHERE table_id = 1;

-- Ver contas ativas/inativas
SELECT status, COUNT(*) as qtd FROM table_users WHERE table_id = 1 GROUP BY status;

-- Ver contas mãe
SELECT * FROM table_users WHERE table_id = 1 AND account_type = 'mae';
```

## 🔒 Segurança

### Variáveis de Ambiente Recomendadas
```
DB_HOST=localhost
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha_forte
DB_NAME=faturamento_competicaos
DB_PORT=3306
JWT_SECRET=sua_chave_secreta_muito_longa_e_complexa_aqui
PORT=5000
NODE_ENV=production
```

### Backup do Banco

```bash
# Backup completo
mysqldump -u root -p faturamento_competicaos > backup.sql

# Restaurar
mysql -u root -p faturamento_competicaos < backup.sql
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do backend (terminal onde rodou npm start)
3. Verifique se todas as dependências estão instaladas
4. Tente limpar node_modules e npm install novamente

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm start
```

---

**Tudo funcionando? Parabéns! 🎉 Comece a usar!**
