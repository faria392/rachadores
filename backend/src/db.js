const mysql = require('mysql2/promise');

// ============================================
// VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
// ============================================
console.log('\n📋 Carregando variáveis de ambiente...');
console.log(`   DB_HOST: ${process.env.DB_HOST || 'NÃO DEFINIDO'}`);
console.log(`   DB_USERNAME: ${process.env.DB_USERNAME || 'NÃO DEFINIDO'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'NÃO DEFINIDO'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Definido' : '❌ NÃO DEFINIDO'}\n`);

// Defina como aviso, não erro fatal
if (!process.env.DB_HOST || !process.env.DB_USERNAME || !process.env.DB_NAME) {
  console.warn('⚠️  Aviso: Variáveis do banco incompletas - usando valores padrão');
  console.warn('   Isso pode causar erro de conexão\n');
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
  connectionTimeout: 5000,
});

pool.on('error', (err) => {
  console.error('⚠️ Erro no pool de conexões:', err.message);
  // Não faz process.exit() - deixa app continuar
});


async function initializeDatabase() {
  let retries = 3;
  let lastError;

  while (retries > 0) {
    try {
      console.log(`⏳ Tentando conectar ao banco (tentativa ${4 - retries}/3)...`);
      
      // Timeout de 10s para conexão
      const connectionPromise = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de conexão (10s)')), 10000)
      );

      const connection = await Promise.race([connectionPromise, timeoutPromise]);

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
        // Coluna já existe, ignorar
        if (error.message.includes('Duplicate')) {
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

      await poolConnection.execute(`
        CREATE TABLE IF NOT EXISTS contas_chinesas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          telefone VARCHAR(20),
          pix VARCHAR(100),
          cpf VARCHAR(14),
          nome VARCHAR(100),
          saldo DECIMAL(12, 2) DEFAULT 0,
          status VARCHAR(20) DEFAULT 'Ativa',
          tipo VARCHAR(20) DEFAULT 'NOVA',
          dominio VARCHAR(10) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_dominio (user_id, dominio),
          INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ Tabela contas_chinesas criada/verificada');

      await poolConnection.release();
      console.log('✅ Banco de dados inicializado com SUCESSO\n');
      return; // Sucesso!
      
    } catch (error) {
      lastError = error;
      retries--;
      console.warn(`⚠️ Falha na tentativa: ${error.message}`);
      
      if (retries > 0) {
        console.warn(`   Tentando novamente em 2s...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // Chegou aqui = todas as tentativas falharam
  console.error(`\n❌ Falha ao conectar ao banco após 3 tentativas`);
  console.error(`   Último erro: ${lastError.message}\n`);
  console.warn('⚠️ O servidor vai INICIAR mesmo assim em modo FALLBACK\n');
  
  // NÃO throw - deixa a aplicação continuar
  throw lastError;
}

module.exports = { pool, initializeDatabase };

