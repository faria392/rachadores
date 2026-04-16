const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { verifyToken } = require('../middleware/auth');

// ✅ CRIAR NOVA TABELA
router.post('/create', verifyToken, async (req, res) => {
  const { name } = req.body;
  const userId = req.userId;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nome da tabela é obrigatório' });
  }

  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO user_tables (user_id, table_name) VALUES (?, ?)',
      [userId, name.trim()]
    );

    connection.release();

    res.json({ 
      id: result.insertId, 
      name: name.trim(),
      user_id: userId,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    res.status(500).json({ error: 'Erro ao criar tabela' });
  }
});

// ✅ OBTER TODAS AS TABELAS DO USUÁRIO
router.get('/', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const connection = await pool.getConnection();
    
    const [tables] = await connection.execute(
      'SELECT id, table_name, created_at FROM user_tables WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Para cada tabela, buscar os usuários
    const tablesWithUsers = await Promise.all(
      tables.map(async (table) => {
        const [users] = await connection.execute(
          `SELECT id, phone, pix_key, cpf, name, balance, status, account_type, table_id 
           FROM table_users WHERE table_id = ? ORDER BY created_at DESC`,
          [table.id]
        );
        return {
          ...table,
          users: users || []
        };
      })
    );

    connection.release();
    res.json(tablesWithUsers);
  } catch (error) {
    console.error('Erro ao obter tabelas:', error);
    res.status(500).json({ error: 'Erro ao obter tabelas' });
  }
});

// ✅ OBTER UMA TABELA ESPECÍFICA COM USUÁRIOS
router.get('/:tableId', verifyToken, async (req, res) => {
  const { tableId } = req.params;
  const userId = req.userId;

  try {
    const connection = await pool.getConnection();
    
    // Verificar se a tabela pertence ao usuário
    const [tables] = await connection.execute(
      'SELECT id, table_name, created_at FROM user_tables WHERE id = ? AND user_id = ?',
      [tableId, userId]
    );

    if (tables.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    const table = tables[0];

    const [users] = await connection.execute(
      `SELECT id, phone, pix_key, cpf, name, balance, status, account_type, table_id 
       FROM table_users WHERE table_id = ? ORDER BY created_at DESC`,
      [tableId]
    );

    connection.release();

    res.json({
      ...table,
      users: users || []
    });
  } catch (error) {
    console.error('Erro ao obter tabela:', error);
    res.status(500).json({ error: 'Erro ao obter tabela' });
  }
});

// ✅ DELETAR TABELA
router.delete('/:tableId', verifyToken, async (req, res) => {
  const { tableId } = req.params;
  const userId = req.userId;

  try {
    const connection = await pool.getConnection();
    
    // Verificar se a tabela pertence ao usuário
    const [tables] = await connection.execute(
      'SELECT id FROM user_tables WHERE id = ? AND user_id = ?',
      [tableId, userId]
    );

    if (tables.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    // Deletar usuários da tabela primeiro
    await connection.execute('DELETE FROM table_users WHERE table_id = ?', [tableId]);

    // Deletar tabela
    await connection.execute('DELETE FROM user_tables WHERE id = ?', [tableId]);

    connection.release();

    res.json({ message: 'Tabela deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tabela:', error);
    res.status(500).json({ error: 'Erro ao deletar tabela' });
  }
});

// ✅ DUPLICAR TABELA
router.post('/:tableId/duplicate', verifyToken, async (req, res) => {
  const { tableId } = req.params;
  const userId = req.userId;

  try {
    const connection = await pool.getConnection();
    
    // Verificar se a tabela pertence ao usuário
    const [tables] = await connection.execute(
      'SELECT table_name FROM user_tables WHERE id = ? AND user_id = ?',
      [tableId, userId]
    );

    if (tables.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    const originalTableName = tables[0].table_name;
    const newTableName = `${originalTableName} (cópia)`;

    // Criar nova tabela
    const [newTable] = await connection.execute(
      'INSERT INTO user_tables (user_id, table_name) VALUES (?, ?)',
      [userId, newTableName]
    );

    const newTableId = newTable.insertId;

    // Copiar usuários
    const [users] = await connection.execute(
      `SELECT phone, pix_key, cpf, name, balance, status, account_type 
       FROM table_users WHERE table_id = ?`,
      [tableId]
    );

    for (const user of users) {
      await connection.execute(
        `INSERT INTO table_users (table_id, phone, pix_key, cpf, name, balance, status, account_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newTableId, user.phone, user.pix_key, user.cpf, user.name, user.balance, user.status, user.account_type]
      );
    }

    connection.release();

    res.json({
      id: newTableId,
      table_name: newTableName,
      user_id: userId,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao duplicar tabela:', error);
    res.status(500).json({ error: 'Erro ao duplicar tabela' });
  }
});

// ✅ ADICIONAR USUÁRIO À TABELA
router.post('/:tableId/users', verifyToken, async (req, res) => {
  const { tableId } = req.params;
  const { phone, pix_key, cpf, name, balance, status, account_type } = req.body;
  const userId = req.userId;

  if (!phone || !name) {
    return res.status(400).json({ error: 'Telefone e nome são obrigatórios' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Verificar se a tabela pertence ao usuário
    const [tables] = await connection.execute(
      'SELECT id FROM user_tables WHERE id = ? AND user_id = ?',
      [tableId, userId]
    );

    if (tables.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    // Se account_type é 'mae', remover de outros usuários
    if (account_type === 'mae') {
      await connection.execute(
        "UPDATE table_users SET account_type = 'normal' WHERE table_id = ? AND account_type = 'mae'",
        [tableId]
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO table_users (table_id, phone, pix_key, cpf, name, balance, status, account_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tableId, phone, pix_key || null, cpf || null, name, balance || 0, status || 'ativa', account_type || 'normal']
    );

    connection.release();

    res.json({
      id: result.insertId,
      table_id: tableId,
      phone,
      pix_key: pix_key || null,
      cpf: cpf || null,
      name,
      balance: balance || 0,
      status: status || 'ativa',
      account_type: account_type || 'normal'
    });
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    res.status(500).json({ error: 'Erro ao adicionar usuário' });
  }
});

// ✅ ATUALIZAR USUÁRIO
router.put('/:tableId/users/:userId', verifyToken, async (req, res) => {
  const { tableId, userId } = req.params;
  const { phone, pix_key, cpf, name, balance, status, account_type } = req.body;
  const authUserId = req.userId;

  try {
    const connection = await pool.getConnection();
    
    // Verificar se a tabela pertence ao usuário
    const [tables] = await connection.execute(
      'SELECT id FROM user_tables WHERE id = ? AND user_id = ?',
      [tableId, authUserId]
    );

    if (tables.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    // Se account_type é 'mae', remover de outros usuários
    if (account_type === 'mae') {
      await connection.execute(
        "UPDATE table_users SET account_type = 'normal' WHERE table_id = ? AND id != ? AND account_type = 'mae'",
        [tableId, userId]
      );
    }

    const [result] = await connection.execute(
      `UPDATE table_users 
       SET phone = ?, pix_key = ?, cpf = ?, name = ?, balance = ?, status = ?, account_type = ?
       WHERE id = ? AND table_id = ?`,
      [phone, pix_key || null, cpf || null, name, balance || 0, status || 'ativa', account_type || 'normal', userId, tableId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: userId,
      table_id: tableId,
      phone,
      pix_key: pix_key || null,
      cpf: cpf || null,
      name,
      balance: balance || 0,
      status: status || 'ativa',
      account_type: account_type || 'normal'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// ✅ DELETAR USUÁRIO
router.delete('/:tableId/users/:userId', verifyToken, async (req, res) => {
  const { tableId, userId } = req.params;
  const authUserId = req.userId;

  try {
    const connection = await pool.getConnection();
    
    // Verificar se a tabela pertence ao usuário
    const [tables] = await connection.execute(
      'SELECT id FROM user_tables WHERE id = ? AND user_id = ?',
      [tableId, authUserId]
    );

    if (tables.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    const [result] = await connection.execute(
      'DELETE FROM table_users WHERE id = ? AND table_id = ?',
      [userId, tableId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

module.exports = router;
