const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verificar se o diretório build existe
const buildPath = path.join(__dirname, 'build');
const buildExists = fs.existsSync(buildPath);

if (!buildExists) {
  console.warn('⚠️ AVISO: Diretório build/ não encontrado!');
  console.log('📝 Execute: npm run build');
}

// Servir arquivos estáticos do build
app.use(express.static(buildPath, {
  maxAge: '1y',
  etag: false,
  lastModified: false
}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    buildExists: buildExists
  });
});

// API health check (para monitoramento)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// SPA Fallback: Redirecionar todas as rotas não encontradas para index.html
app.use((req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'index.html não encontrado',
      path: indexPath,
      buildExists: buildExists
    });
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`\n✅ Servidor iniciado com sucesso!`);
  console.log(`🚀 Rodando em: http://localhost:${PORT}`);
  console.log(`📡 Ouvindo em: ${HOST}:${PORT}`);
  console.log(`📦 Build Path: ${buildPath}`);
  console.log(`✓ Build existe: ${buildExists}\n`);
});

// Tratamento de erro ao iniciar servidor
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ ERRO: Porta ${PORT} já está em uso!`);
    console.error('   Tente usar uma porta diferente: PORT=8080 npm run serve');
  } else {
    console.error('❌ Erro ao iniciar servidor:', err.message);
  }
  process.exit(1);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('✓ Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT recebido, encerrando servidor...');
  server.close(() => {
    console.log('✓ Servidor encerrado');
    process.exit(0);
  });
});
