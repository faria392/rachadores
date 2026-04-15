# Instruções do Copilot para o Projeto

Projeto Full Stack com Backend (Express) e Frontend (React) separados.

## Convenções do Projeto

- **Linguagem**: JavaScript (Node.js + React)
- **Backend Framework**: Express.js
- **Frontend Framework**: React
- **Porta Backend**: 5000
- **Porta Frontend**: 3000

## Estrutura de Pastas

### Backend
- `backend/src/index.js` - Servidor Express
- `backend/package.json` - Dependências do backend

### Frontend
- `frontend/src/` - Componentes React
- `frontend/public/` - Arquivos estáticos HTML

## Comandos Úteis

### Backend
- `cd backend && npm install` - Instalar dependências
- `npm start` - Executar em produção (porta 5000)
- `npm run dev` - Executar em desenvolvimento com auto-reload

### Frontend
- `cd frontend && npm install` - Instalar dependências
- `npm start` - Executar em desenvolvimento (porta 3000)
- `npm run build` - Build para produção

## Comunicação Entre Camadas

- Frontend usa proxy `http://localhost:5000` para requisições à API
- Backend tem CORS habilitado para aceitar requisições do frontend
