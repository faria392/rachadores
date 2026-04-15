/**
 * 🚀 SERVIDOR UNIFICADO - Backend + Frontend
 * 
 * Este servidor roda:
 * - Backend Express (rotas de API)
 * - Frontend React (arquivos estáticos)
 * 
 * Tudo em uma única aplicação Node.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ============================================
// BACKEND - Importar rotas da API
// ============================================
const { pool, initializeDatabase } = require('./backend/src/db');
const authRoutes = require('./backend/src/routes/auth');
const revenueRoutes = require('./backend/src/routes/revenue');
const userRoutes = require('./backend/src/routes/user');

// ============================================
// CONFIGURAÇÃO EXPRESS
// ============================================
const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROTAS DA API (BACKEND)
// ============================================
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

// ============================================
// FRONTEND ESTÁTICO (React Build)
// ============================================
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');

// Verificar se o build do frontend existe
const buildExists = fs.existsSync(frontendBuildPath);

if (buildExists) {
  // Servir arquivos estáticos do frontend
  app.use(express.static(frontendBuildPath, {
    maxAge: '1y',
    etag: false,
    lastModified: false
  }));

  // SPA Fallback para rotas React
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

// ============================================
// TRATAMENTO DE ERROS
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
async function startServer() {
  try {
    // Inicializar banco de dados
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

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
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
