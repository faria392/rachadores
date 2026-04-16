require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const revenueRoutes = require('./routes/revenue');
const userRoutes = require('./routes/user');
const contasChinesesRoutes = require('./routes/contasChinesas');
const tablesRoutes = require('./routes/tables');
const financialRoutes = require('./routes/financial');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contas-chinesas', contasChinesesRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/financial', financialRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Banco de dados inicializado com sucesso');
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando na porta ${PORT}`);
      console.log(`📍 API disponível em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.warn('⚠️  AVISO: Erro ao inicializar banco de dados:', error.message);
    console.warn('O servidor vai CONTINUAR RODANDO em modo API apenas\n');
    
    // Ainda assim, inicia o app para que a health check funcione
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando em modo API (sem DB) na porta ${PORT}`);
      console.log(`📍 API disponível em http://localhost:${PORT}`);
    });
  }
}

startServer();

process.on('SIGINT', () => {
  console.log('\n📴 Encerrando aplicação...');
  pool.end((err) => {
    if (err) console.error(err.message);
    process.exit(0);
  });
});
