# ✅ Checklist - Gerenciador de Tabelas

## 📋 Verificação de Instalação

### Backend ✓
- [ ] Pasta `backend/src/routes/tables.js` existe
- [ ] `backend/src/index.js` importa as rotas de tabelas
- [ ] `backend/src/db.js` cria as tabelas automaticamente
- [ ] `npm start` executa sem erros
- [ ] Endpoint `/api/health` retorna status OK
- [ ] `http://localhost:5000/api/tables` retorna 401 (esperado sem token)

### Frontend ✓
- [ ] Pasta `frontend/src/pages/TableManagement.jsx` existe
- [ ] Arquivo `frontend/src/pages/TableManagement.css` existe
- [ ] `frontend/src/services/tablesApi.js` existe
- [ ] `frontend/src/App.jsx` tem rota `/tabelas`
- [ ] `frontend/src/components/Sidebar.jsx` tem link para tabelas
- [ ] `npm start` executa sem erros
- [ ] `http://localhost:3000` abre sem erros

### Banco de Dados ✓
- [ ] MySQL rodando
- [ ] Database `faturamento_competicaos` existe
- [ ] Tabela `user_tables` criada
- [ ] Tabela `table_users` criada
- [ ] Foreign keys configuradas corretamente

## 🧪 Testes Funcionais

### Autenticação
- [ ] Consegue fazer login
- [ ] Consegue fazer register (novo usuário)
- [ ] Token é armazenado em localStorage
- [ ] Ao logout, token é removido
- [ ] Sem token, é redirecionado para login

### Gerenciar Tabelas
- [ ] Botão "Nova Tabela" funciona
- [ ] Modal aparece ao clicar
- [ ] Consegue criar tabela com nome
- [ ] Tabela aparece na lista
- [ ] Consegue criar múltiplas tabelas
- [ ] Nomes duplicados são permitidos (mesmo que incomum)

### Deletar Tabela
- [ ] Clique em ícone de lixeira
- [ ] Confirmação aparece
- [ ] Ao confirmar, tabela desaparece
- [ ] Ao cancelar, tabela permanece

### Duplicar Tabela
- [ ] Clique em ícone de copiar
- [ ] Nova tabela criada com "(cópia)" no nome
- [ ] Usuários são copiados também
- [ ] Dados mantêm integridade

### Adicionar Usuário
- [ ] Clique em botão + (verde)
- [ ] Modal de adicionar abre
- [ ] Preenche dados obrigatórios (telefone, nome)
- [ ] Consegue adicionar opcional (CPF, Pix, Saldo)
- [ ] Status padrão é "ativa"
- [ ] Tipo padrão é "normal"
- [ ] Usuário aparece na tabela

### Validação de Usuário
- [ ] Telefone obrigatório - sem telefone, aviso aparece
- [ ] Nome obrigatório - sem nome, aviso aparece
- [ ] Saldo vazio = 0.00
- [ ] Saldo negativo é aceito (exibe em vermelho)

### Editar Status
- [ ] Dropdown de status funciona
- [ ] Muda de "ativa" para "inativa"
- [ ] Muda de "inativa" para "ativa"
- [ ] Contador atualiza automaticamente
- [ ] Dados salvos no banco

### Conta Mãe
- [ ] Consegue marcar como "Conta Mãe"
- [ ] Desmarcar anterior automaticamente
- [ ] Apenas 1 por tabela
- [ ] Marcação perdura após reload
- [ ] Destaque visual (laranja) presente
- [ ] Label "★" aparece

### Busca
- [ ] Busca por nome funciona
- [ ] Busca por telefone funciona
- [ ] Busca por CPF funciona
- [ ] Busca não diferencia maiúscula/minúscula (caso insensível)
- [ ] Busca limpa e refiltra corretamente

### Filtros
- [ ] Filtro "Todas" mostra todos
- [ ] Filtro "Ativas" mostra apenas ativas
- [ ] Filtro "Inativas" mostra apenas inativas
- [ ] Filtro "Contas Mãe" mostra apenas mãe
- [ ] Filtros funcionam com busca simultaneamente

### Removedor Usuário
- [ ] Clique em ícone de lixeira na linha
- [ ] Confirmação aparece
- [ ] Ao confirmar, usuário desaparece
- [ ] Contadores atualizam
- [ ] Banco de dados reflete mudança

### Resumo da Tabela
- [ ] "Cadastradas" mostra número correto
- [ ] "Ativas" mostra número correto
- [ ] "Inativas" mostra número correto
- [ ] "Saldo Total" calcula correto
- [ ] Saldo positivo = verde
- [ ] Saldo negativo = vermelho
- [ ] "Conta Mãe" mostra ✓ ou —

### Cores e Visual
- [ ] Saldo positivo exibe em verde
- [ ] Saldo negativo exibe em vermelho
- [ ] Saldo zero exibe em cinza/neutro
- [ ] Conta ativa = status verde
- [ ] Conta inativa = status vermelho
- [ ] Conta mãe = laranja com ★
- [ ] Hover effects funcionam
- [ ] Loading state funciona

### Responsividade
- [ ] Desktop (1920px+) = layout completo
- [ ] Tablet (768px-1024px) = adaptado
- [ ] Mobile (360px-480px) = scroll horizontal da tabela
- [ ] Menu (Sidebar) se adapta
- [ ] Botões são clicáveis em mobile
- [ ] Inputs funcionam em mobile

### Persistência
- [ ] Ao recarregar página, dados persistem
- [ ] Ao fazer logout e login, dados reaparecem
- [ ] Outro usuário não vê tabelas do primeiro
- [ ] Deletar é permanente

### Erros e Tratamento
- [ ] Erro de conexão mostra mensagem
- [ ] Campo obrigatório vazio mostra aviso
- [ ] Token inválido redireciona para login
- [ ] 404 mostra mensagem amigável
- [ ] Timeouts são tratados
- [ ] XSS/SQL Injection não funcionam

## 📊 Verificação de Dados

### No Banco de Dados
```sql
-- Verificar tabelas
SELECT COUNT(*) FROM user_tables;

-- Verificar usuários
SELECT COUNT(*) FROM table_users;

-- Verificar saldo total
SELECT SUM(balance) FROM table_users;

-- Verificar integridade
SELECT u.id, u.name, t.table_name 
FROM table_users u
JOIN user_tables t ON u.table_id = t.id;
```

### No Frontend Console
```javascript
// Verificar token
console.log(localStorage.getItem('token'))

// Verificar user
console.log(localStorage.getItem('user'))

// Fazer requisição teste
fetch('http://localhost:5000/api/tables', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(console.log)
```

## 🚀 Performance

- [ ] Página carrega em < 2 segundos
- [ ] Busca responde em < 500ms
- [ ] Deletar completa em < 1 segundo
- [ ] Criar tabela completa em < 1 segundo
- [ ] Sem memory leaks ao navegar

## 📱 Compatibilidade de Navegadores

- [ ] Chrome/Chromium (v90+)
- [ ] Firefox (v88+)
- [ ] Safari (v14+)
- [ ] Edge (v90+)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## 🔐 Segurança

- [ ] Tokens expiram corretamente
- [ ] JWT_SECRET definido (não vazio)
- [ ] CORS habilitado apenas para localhost
- [ ] Senhas hasheadas no banco
- [ ] SQL Injection prevenido (prepared statements)
- [ ] XSS prevenido (React escapa HTML)
- [ ] CSRF token (se aplicável)

## 📦 Dependências

- [ ] `lucide-react` instalado (para ícones)
- [ ] `axios` instalado (para requisições)
- [ ] `react-router-dom` instalado (para rotas)
- [ ] `express` instalado no backend
- [ ] `mysql2/promise` instalado no backend
- [ ] `bcryptjs` instalado no backend
- [ ] `jsonwebtoken` instalado no backend
- [ ] `cors` instalado no backend
- [ ] `dotenv` instalado no backend

## 🎯 Funcionalidades Opcionais Futuros

- [ ] Exportar para CSV/Excel
- [ ] Importar de arquivo
- [ ] Gráficos de saldo
- [ ] Histórico de movimentações
- [ ] Relatórios
- [ ] Compartilhamento de tabelas
- [ ] Permissões/roles
- [ ] Backup automático
- [ ] Auditoria
- [ ] API documentada (Swagger)

## ✨ Final Checklist

- [ ] Tudo funcionando localmente
- [ ] Sem erros no console
- [ ] Sem warnings importantes
- [ ] Código limpo e documentado
- [ ] README atualizado
- [ ] Pronto para deploy

---

## 📝 Notas

Se algum item falhar:
1. Verifique console do navegador (F12 -> Console)
2. Verifique logs do backend (terminal)
3. Verifique banco de dados
4. Consulte INSTALLATION_GUIDE.md para troubleshooting

**Data de Teste**: _______________  
**Tester**: _______________  
**Status**: ✅ Tudo OK / ⚠️ Com Alertas / ❌ Com Erros
