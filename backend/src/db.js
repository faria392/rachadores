const mysql = require('mysql2/promise');

// ============================================
// VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
// ============================================
const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ ERRO: Variáveis de ambiente obrigatórias não definidas:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\n📝 Defina as variáveis no arquivo .env');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1); // Falha em produção se vars faltarem
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'faturamento_competicaos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});


async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'faturamento_competicaos'}`
    );
    console.log('✓ Banco de dados criado/verificado');

    await connection.end();

    const poolConnection = await pool.getConnection();

    await poolConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatarUrl LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabela users criada/verificada');

    // Adicionar coluna avatarUrl se não existir
    try {
      await poolConnection.execute(
        `ALTER TABLE users ADD COLUMN avatarUrl LONGTEXT AFTER password`
      );
      console.log('✓ Coluna avatarUrl adicionada');
    } catch (error) {
      // Coluna já existe, ignorar erro
      if (!error.message.includes('Duplicate column name')) {
        console.log('ℹ Coluna avatarUrl já existe');
      }
    }

    await poolConnection.execute(`
      CREATE TABLE IF NOT EXISTS revenue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_date (user_id, date),
        INDEX idx_revenue_date (date),
        INDEX idx_revenue_user_date (user_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Tabela revenue criada/verificada');

    await poolConnection.release();
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error.message);
    throw error;
  }
}

module.exports = { pool, initializeDatabase };

