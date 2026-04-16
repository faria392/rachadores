const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware para autenticação
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT * FROM contas_chinesas WHERE user_id = ? ORDER BY dominio, id`,
      [userId]
    );
    connection.release();

    res.json(rows || []);
  } catch (error) {
    console.error('Erro ao buscar contas chinesas:', error);
    res.status(500).json({ error: 'Erro ao buscar contas' });
  }
});

// Obter contas por domínio
router.get('/dominio/:dominio', async (req, res) => {
  try {
    const userId = req.user.id;
    const { dominio } = req.params;

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT * FROM contas_chinesas WHERE user_id = ? AND dominio = ? ORDER BY id`,
      [userId, dominio]
    );
    connection.release();

    res.json(rows || []);
  } catch (error) {
    console.error('Erro ao buscar contas por domínio:', error);
    res.status(500).json({ error: 'Erro ao buscar contas' });
  }
});

// Adicionar nova conta chinesa
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { telefone, pix, cpf, nome, saldo, status, tipo, dominio } = req.body;

    if (!dominio) {
      return res.status(400).json({ error: 'Domínio é obrigatório' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO contas_chinesas (user_id, telefone, pix, cpf, nome, saldo, status, tipo, dominio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, telefone || '', pix || '', cpf || '', nome || '', saldo || 0, status || 'Ativa', tipo || 'NOVA', dominio]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      telefone,
      pix,
      cpf,
      nome,
      saldo,
      status,
      tipo,
      dominio
    });
  } catch (error) {
    console.error('Erro ao criar conta chinesa:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Atualizar conta chinesa
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { telefone, pix, cpf, nome, saldo, status, tipo } = req.body;

    const connection = await pool.getConnection();
    
    // Verificar se a conta pertence ao usuário
    const [conta] = await connection.execute(
      `SELECT id FROM contas_chinesas WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (conta.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    const [result] = await connection.execute(
      `UPDATE contas_chinesas 
       SET telefone = ?, pix = ?, cpf = ?, nome = ?, saldo = ?, status = ?, tipo = ?
       WHERE id = ? AND user_id = ?`,
      [telefone, pix, cpf, nome, saldo, status, tipo, id, userId]
    );

    connection.release();

    res.json({
      id,
      user_id: userId,
      telefone,
      pix,
      cpf,
      nome,
      saldo,
      status,
      tipo
    });
  } catch (error) {
    console.error('Erro ao atualizar conta chinesa:', error);
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

// Deletar conta chinesa
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const connection = await pool.getConnection();

    // Verificar se a conta pertence ao usuário
    const [conta] = await connection.execute(
      `SELECT id FROM contas_chinesas WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (conta.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    await connection.execute(
      `DELETE FROM contas_chinesas WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    connection.release();
    res.json({ message: 'Conta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar conta chinesa:', error);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
});

// Obter resumo/totais das contas
router.get('/resumo/totais', async (req, res) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();
    const [totais] = await connection.execute(
      `SELECT 
        dominio,
        COUNT(*) as total_contas,
        SUM(CASE WHEN status = 'Ativa' THEN 1 ELSE 0 END) as contas_ativas,
        SUM(CASE WHEN status = 'Inativa' THEN 1 ELSE 0 END) as contas_inativas,
        SUM(saldo) as saldo_total
       FROM contas_chinesas 
       WHERE user_id = ?
       GROUP BY dominio`,
      [userId]
    );
    connection.release();

    res.json(totais || []);
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

module.exports = router;
