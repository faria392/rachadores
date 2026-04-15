require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { pool, initializeDatabase } = require('./backend/src/db');
const authRoutes = require('./backend/src/routes/auth');
const revenueRoutes = require('./backend/src/routes/revenue');
const userRoutes = require('./backend/src/routes/user');

// ============================================
// VALIDAÇÃO CRÍTICA - EVITAR ERRO 503
// ============================================
const NODE_ENV = process.env.NODE_ENV || 'development';
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

console.log(`\n📌 Ambiente: ${NODE_ENV}`);
console.log(`📌 Porta: ${PORT}`);
console.log(`📌 Host: ${HOST}\n`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/user', userRoutes);

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

    // Iniciar servidor
    const server = app.listen(PORT, HOST, () => {
      console.log('\n' + '='.repeat(60));
      console.log('✅ SERVIDOR UNIFICADO INICIADO COM SUCESSO!');
      console.log('='.repeat(60));
      console.log(`🚀 Rodando em: http://localhost:${PORT}`);
      console.log(`📡 Ouvindo em: ${HOST}:${PORT}`);
      console.log(`\n📋 Serviços disponíveis:`);
      console.log(`   ✓ Frontend: http://localhost:${PORT}`);
      console.log(`   ✓ API: http://localhost:${PORT}/api`);
      console.log(`   ✓ Health: http://localhost:${PORT}/api/health`);
      console.log(`\n📦 Build Frontend: ${buildExists ? '✓ Encontrado' : '❌ Não encontrado'}`);
      console.log('='.repeat(60) + '\n');
    });

    // Tratamento de erro ao iniciar
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ ERRO: Porta ${PORT} já está em uso!`);
        process.exit(1);
      } else {
        console.error('❌ Erro ao iniciar servidor:', err.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  }
}

// Iniciar
startServer();

process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM recebido, encerrando...');
  pool.end((err) => {
    if (err) console.error(err.message);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT recebido, encerrando...');
  pool.end((err) => {
    if (err) console.error(err.message);
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error.message);
  process.exit(1);
});
