const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { verifyToken } = require('../middleware/auth');

router.post('/add', verifyToken, async (req, res) => {
  const { amount, date } = req.body;

  if (!amount || !date) {
    return res.status(400).json({ error: 'Valor e data são obrigatórios' });
  }

  // Garantir que amount é um número válido
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return res.status(400).json({ error: 'Valor deve ser um número positivo' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Data deve estar no formato YYYY-MM-DD' });
  }

  try {
    const connection = await pool.getConnection();
    
    // IMPORTANTE: Usar UPDATE para SOMAR, não para SUBSTITUIR
    await connection.execute(
      `INSERT INTO revenue (user_id, amount, date) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = amount + VALUES(amount)`,
      [req.userId, numAmount, date]
    );

    connection.release();

    res.json({ 
      message: 'Faturamento registrado com sucesso', 
      amount: numAmount, 
      date 
    });
  } catch (error) {
    console.error('Erro ao salvar faturamento:', error);
    return res.status(500).json({ error: 'Erro ao salvar faturamento' });
  }
});

router.get('/day/:date', verifyToken, async (req, res) => {
  const { date } = req.params;

  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM revenue WHERE user_id = ? AND date = ?',
      [req.userId, date]
    );

    connection.release();

    if (rows.length === 0) {
      return res.json({ amount: 0, date });
    }

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar faturamento' });
  }
});

router.get('/history', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [revenues] = await connection.execute(
      'SELECT * FROM revenue WHERE user_id = ? ORDER BY date DESC',
      [req.userId]
    );

    connection.release();

    res.json(revenues || []);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

router.get('/total', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(
      'SELECT SUM(amount) as total FROM revenue WHERE user_id = ?',
      [req.userId]
    );

    connection.release();

    const total = rows[0].total || 0;
    res.json({ total });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao calcular total' });
  }
});

router.get('/ranking', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.avatarUrl,
        COALESCE(SUM(r.amount), 0) as total
      FROM users u
      LEFT JOIN revenue r ON u.id = r.user_id
      GROUP BY u.id, u.name, u.email, u.avatarUrl
      ORDER BY total DESC
    `);

    connection.release();

    const ranking = (rows || []).map((row, index) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatarUrl: row.avatarUrl,
      total: row.total || 0,
      position: index + 1,
    }));

    res.json(ranking);
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    return res.status(500).json({ error: 'Erro ao obter ranking' });
  }
});

router.get('/ranking/daily/:date', async (req, res) => {
  const { date } = req.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Data deve estar no formato YYYY-MM-DD' });
  }

  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.avatarUrl,
        COALESCE(r.amount, 0) as amount,
        COALESCE(r.date, ?) as date
      FROM users u
      LEFT JOIN revenue r ON u.id = r.user_id AND r.date = ?
      ORDER BY COALESCE(r.amount, 0) DESC, u.name ASC
    `, [date, date]);

    connection.release();

    const ranking = (rows || []).map((row, index) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatarUrl: row.avatarUrl,
      amount: row.amount || 0,
      date: row.date || date,
      position: index + 1
    }));

    res.json(ranking);
  } catch (error) {
    console.error('Erro ao obter ranking do dia:', error);
    return res.status(500).json({ error: 'Erro ao obter ranking do dia' });
  }
});

router.get('/ranking/daily', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.avatarUrl,
        COALESCE(r.amount, 0) as amount,
        COALESCE(r.date, ?) as date
      FROM users u
      LEFT JOIN revenue r ON u.id = r.user_id AND r.date = ?
      ORDER BY COALESCE(r.amount, 0) DESC, u.name ASC
    `, [today, today]);

    connection.release();

    const ranking = (rows || []).map((row, index) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatarUrl: row.avatarUrl,
      amount: row.amount || 0,
      date: row.date || today,
      position: index + 1
    }));

    res.json(ranking);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao obter ranking do dia' });
  }
});

module.exports = router;
