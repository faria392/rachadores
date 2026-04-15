const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do build
app.use(express.static(path.join(__dirname, 'build')));

// Health check (opcional, mas útil para debugging)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor rodando' });
});

// SPA Fallback: Redirecionar todas as rotas não encontradas para index.html
// Isso é essencial para React Router funcionar
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor React rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📦 Servindo arquivos de: ${path.join(__dirname, 'build')}`);
});
