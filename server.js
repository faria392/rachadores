require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ============================================
// PROTEÇÃO: Imports de rotas com erro handling
// ============================================
let authRoutes, revenueRoutes, userRoutes, financeiroRoutes;
const { pool, initializeDatabase } = require('./backend/src/db');

try {
  authRoutes = require('./backend/src/routes/auth');
  console.log('✓ Rotas AUTH carregadas');
} catch (err) {
  console.error('⚠️ Erro ao carregar rotas AUTH:', err.message);
  authRoutes = (req, res) => res.status(500).json({ error: 'Serviço indisponível' });
}

try {
  revenueRoutes = require('./backend/src/routes/revenue');
  console.log('✓ Rotas REVENUE carregadas');
} catch (err) {
  console.error('⚠️ Erro ao carregar rotas REVENUE:', err.message);
  revenueRoutes = (req, res) => res.status(500).json({ error: 'Serviço indisponível' });
}

try {
  userRoutes = require('./backend/src/routes/user');
  console.log('✓ Rotas USER carregadas');
} catch (err) {
  console.error('⚠️ Erro ao carregar rotas USER:', err.message);
  userRoutes = (req, res) => res.status(500).json({ error: 'Serviço indisponível' });
}

try {
  financeiroRoutes = require('./backend/src/routes/financeiro');
  console.log('✓ Rotas FINANCEIRO carregadas');
} catch (err) {
  console.error('⚠️ Erro ao carregar rotas FINANCEIRO:', err.message);
  financeiroRoutes = (req, res) => res.status(500).json({ error: 'Serviço indisponível' });
}

// ============================================
// VALIDAÇÃO CRÍTICA - EVITAR ERRO 503
// ============================================
const NODE_ENV = process.env.NODE_ENV || 'development';
const app = express();
const PORT = process.env.PORT || 5000;

console.log(`\n📌 Ambiente: ${NODE_ENV}`);
console.log(`📌 Porta: ${PORT}`);
console.log(`📌 Variáveis críticas carregadas\n`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/user', userRoutes);
app.use('/api/financeiro', financeiroRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'unified-server'
  });
});

const frontendBuildPath = path.join(__dirname, 'frontend', 'dist');

const buildExists = fs.existsSync(frontendBuildPath);

if (buildExists) {
  app.use(express.static(frontendBuildPath, {
    maxAge: '1y',
    etag: false,
    lastModified: false
  }));

  app.use((req, res) => {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'index.html não encontrado' });
    }
  });
} else {
  console.warn('⚠️ Frontend build não encontrado em:', frontendBuildPath);
  console.warn('📝 Execute: cd frontend && npm run build');
}

app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Banco de dados inicializado com sucesso');

    // Iniciar servidor - SEM HOST fixo (deixa Hostinger decidir)
    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('✅ SERVIDOR UNIFICADO INICIADO COM SUCESSO!');
      console.log('='.repeat(60));
      console.log(`🚀 Rodando em porta: ${PORT}`);
      console.log(`\n📋 Serviços disponíveis:`);
      console.log(`   ✓ Frontend: http://localhost:${PORT}`);
      console.log(`   ✓ API: http://localhost:${PORT}/api`);
      console.log(`   ✓ Health: http://localhost:${PORT}/api/health`);
      console.log(`\n📦 Build Frontend: ${buildExists ? '✓ Encontrado' : '❌ Não encontrado'}`);
      console.log('='.repeat(60) + '\n');
    });

    // Tratamento de erro ao iniciar - NÃO mata com process.exit()
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`⚠️  AVISO: Porta ${PORT} já está em uso!`);
        console.error('Tentando reconectar em 5s...');
        setTimeout(() => startServer(), 5000);
      } else {
        console.error('⚠️  Erro ao iniciar servidor:', err.message);
        console.error('Servidor continuará tentando rodar...');
      }
    });
  } catch (error) {
    console.error('⚠️  AVISO: Erro ao inicializar banco de dados:', error.message);
    console.error('📝 Detalhes:', error.code);
    console.warn('\n⚠️  O servidor vai CONTINUAR RODANDO em modo API apenas');
    console.warn('🔧 Você pode:');
    console.warn('   1. Verificar as variáveis de ambiente (.env)');
    console.warn('   2. Verificar conectividade com o banco');
    console.warn('   3. Verificar credenciais do banco\n');
    
    // NÃO para o app - deixa rodar em modo API apenas
    const server = app.listen(PORT, () => {
      console.log('✅ SERVIDOR INICIADO (modo API apenas - sem DB)');
      console.log(`🚀 Porta: ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Erro na porta:', err.message);
    });
  }
}

// Iniciar
startServer();

process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM recebido, encerrando gracefully...');
  pool.end((err) => {
    if (err) console.error(err.message);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT recebido, encerrando gracefully...');
  pool.end((err) => {
    if (err) console.error(err.message);
    process.exit(0);
  });
});

// IMPORTANTE: Não use process.exit(1) para erros - logging apenas
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Promise rejeitada (não fatal):', reason);
  // NÃO para a aplicação
});

process.on('uncaughtException', (error) => {
  console.error('⚠️  Exceção não capturada (não fatal):', error.message);
  console.error('Stack:', error.stack);
  // NÃO para a aplicação
});
