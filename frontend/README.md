# Frontend - Competição de Faturamento

Interface React para a competição de faturamento.

## 🚀 Como executar

1. Instale as dependências:
```bash
npm install
```

2. Configure o ambiente:
```bash
cp .env.example .env
```

3. Execute em desenvolvimento:
```bash
npm start
```

O frontend estará disponível em `http://localhost:3000`

## 📁 Estrutura

```
src/
├── pages/           # Páginas (Login, Register, Dashboard)
├── components/      # Componentes reutilizáveis
├── services/        # Serviços de API
├── App.js          # Componente principal com rotas
└── index.js        # Entrada da aplicação
```

## 🛠️ Configuração

O frontend faz requisições para o backend através do arquivo `.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📄 Páginas

### Login
- Autenticação com email e senha
- Redirecionamento para registro
- Armazenamento de token no localStorage

### Registro
- Criação de nova conta
- Validação de senha confirmada
- Verificação de email duplicado

### Dashboard
- Resumo de faturamento (hoje e total)
- Posição no ranking
- 4 abas principais:
  1. **Visão Geral**: Top 5 do dia
  2. **Adicionar Faturamento**: Formulário para registrar ganho
  3. **Ranking Geral**: Ranking acumulado de todos os usuários
  4. **Ranking do Dia**: Ranking apenas do dia atual
- Logout

## 🎨 Design

Interface moderna e responsiva com:
- Gradiente roxo/azul no header
- Cards com sombras para melhor contraste
- Tabelas com ranking e posições (🥇 🥈 🥉)
- Responsivo para dispositivos móveis

## 🔐 Autenticação

- Login com armazenamento de token no localStorage
- Interceptor axios para adicionar token em todas as requisições
- Redirecionamento automático para login se não autenticado
