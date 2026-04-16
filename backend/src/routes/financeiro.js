const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { verifyToken } = require('../middleware/auth');

// ============================================
// GET /financeiro/summary - Resumo completo
// ============================================
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Pega faturamentos
    const [revenues] = await connection.execute(
      'SELECT date, amount, name FROM revenue WHERE user_id = ? ORDER BY date DESC',
      [req.userId]
    );

    // Pega despesas
    const [expenses] = await connection.execute(
      'SELECT id, date, name, amount FROM expenses WHERE user_id = ? ORDER BY date DESC',
      [req.userId]
    );

    connection.release();

    // 🛡️ BLINDAGEM: Sempre retorna arrays válidos
    console.log('SUMMARY BACKEND:', {
      revenues: revenues ? revenues.length : 0,
      expenses: expenses ? expenses.length : 0
    });

    res.json({
      revenues: Array.isArray(revenues) ? revenues : [],
      expenses: Array.isArray(expenses) ? expenses : [],
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar resumo financeiro',
      revenues: [],
      expenses: []
    });
  }
});

router.get('/day/:date', verifyToken, async (req, res) => {
  const { date } = req.params;
  console.log('🔥 CHEGOU REQUISIÇÃO GET /financeiro/day/:date', { date, userId: req.userId });

  try {
    const connection = await pool.getConnection();

    // Pega faturamentos do dia
    const [revenueRows] = await connection.execute(
      'SELECT id, amount, name FROM revenue WHERE user_id = ? AND date = ?',
      [req.userId, date]
    );

    const faturamento = revenueRows.length > 0 ? revenueRows[0].amount : 0;

    // Pega despesas do dia
    const [expenseRows] = await connection.execute(
      'SELECT id, name, amount FROM expenses WHERE user_id = ? AND date = ?',
      [req.userId, date]
    );

    connection.release();

    // Calcula totais
    const totalGastos = expenseRows.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const lucro = parseFloat(faturamento) - totalGastos;

    res.json({
      date,
      faturamento: parseFloat(faturamento),
      faturamentos: revenueRows,
      gastos: expenseRows,
      totalGastos,
      lucro,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dia:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dia' });
  }
});

// ============================================
// POST /financeiro/revenue - Salvar faturamento
// ============================================
router.post('/revenue', verifyToken, async (req, res) => {
  console.log('🔥 CHEGOU REQUISIÇÃO POST /financeiro/revenue', req.body);
  
  const { date, amount, name } = req.body;

  if (!date || amount === undefined) {
    return res.status(400).json({ error: 'Data e valor são obrigatórios' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return res.status(400).json({ error: 'Valor deve ser um número positivo' });
  }

  try {
    const connection = await pool.getConnection();

    // INSERT novo faturamento
    await connection.execute(
      `INSERT INTO revenue (user_id, amount, date, name) VALUES (?, ?, ?, ?)`,
      [req.userId, numAmount, date, name || 'Faturamento']
    );

    connection.release();

    res.json({
      message: 'Faturamento salvo com sucesso',
      date,
      amount: numAmount,
      name: name || 'Faturamento',
    });
  } catch (error) {
    console.error('Erro ao salvar faturamento:', error);
    res.status(500).json({ error: 'Erro ao salvar faturamento' });
  }
});

// ============================================
// POST /financeiro/expenses - Adicionar despesa
// ============================================
router.post('/expenses', verifyToken, async (req, res) => {
  console.log('🔥 CHEGOU REQUISIÇÃO POST /financeiro/expenses', req.body);
  
  const { date, name, amount } = req.body;

  if (!date || !name || amount === undefined) {
    return res.status(400).json({ error: 'Data, nome e valor são obrigatórios' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return res.status(400).json({ error: 'Valor deve ser um número positivo' });
  }

  try {
    const connection = await pool.getConnection();

    const result = await connection.execute(
      'INSERT INTO expenses (user_id, date, name, amount) VALUES (?, ?, ?, ?)',
      [req.userId, date, name, numAmount]
    );

    connection.release();

    res.json({
      message: 'Despesa adicionada com sucesso',
      id: result[0].insertId,
      date,
      name,
      amount: numAmount,
    });
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    res.status(500).json({ error: 'Erro ao adicionar despesa' });
  }
});

// ============================================
// PUT /financeiro/expenses/:id - Editar despesa
// ============================================
router.put('/expenses/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, amount } = req.body;

  if (!name || amount === undefined) {
    return res.status(400).json({ error: 'Nome e valor são obrigatórios' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return res.status(400).json({ error: 'Valor deve ser um número positivo' });
  }

  try {
    const connection = await pool.getConnection();

    // Verifica se a despesa pertence ao usuário
    const [rows] = await connection.execute(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    // Atualiza
    await connection.execute(
      'UPDATE expenses SET name = ?, amount = ? WHERE id = ? AND user_id = ?',
      [name, numAmount, id, req.userId]
    );

    connection.release();

    res.json({
      message: 'Despesa atualizada com sucesso',
      id,
      name,
      amount: numAmount,
    });
  } catch (error) {
    console.error('Erro ao editar despesa:', error);
    res.status(500).json({ error: 'Erro ao editar despesa' });
  }
});

// ============================================
// DELETE /financeiro/expenses/:id - Deletar despesa
// ============================================
router.delete('/expenses/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    // Verifica se a despesa pertence ao usuário
    const [rows] = await connection.execute(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    // Deleta
    await connection.execute(
      'DELETE FROM expenses WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    connection.release();

    res.json({ message: 'Despesa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    res.status(500).json({ error: 'Erro ao deletar despesa' });
  }
});

// ============================================
// PUT /financeiro/revenue/:id - Atualizar faturamento
// ============================================
router.put('/revenue/:id', verifyToken, async (req, res) => {
  console.log('🔥 CHEGOU REQUISIÇÃO PUT /financeiro/revenue/:id', req.body);
  
  const { id } = req.params;
  const { name, amount } = req.body;

  if (!name || amount === undefined) {
    return res.status(400).json({ error: 'Nome e valor são obrigatórios' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return res.status(400).json({ error: 'Valor deve ser um número positivo' });
  }

  try {
    const connection = await pool.getConnection();

    // Verifica se o faturamento pertence ao usuário
    const [rows] = await connection.execute(
      'SELECT id FROM revenue WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Faturamento não encontrado' });
    }

    // Atualiza
    await connection.execute(
      'UPDATE revenue SET name = ?, amount = ? WHERE id = ? AND user_id = ?',
      [name, numAmount, id, req.userId]
    );

    connection.release();

    res.json({
      message: 'Faturamento atualizado com sucesso',
      id,
      name,
      amount: numAmount,
    });
  } catch (error) {
    console.error('Erro ao editar faturamento:', error);
    res.status(500).json({ error: 'Erro ao editar faturamento' });
  }
});

// ============================================
// DELETE /financeiro/revenue/:id - Deletar faturamento
// ============================================
router.delete('/revenue/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    // Verifica se o faturamento pertence ao usuário
    const [rows] = await connection.execute(
      'SELECT id FROM revenue WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Faturamento não encontrado' });
    }

    // Deleta
    await connection.execute(
      'DELETE FROM revenue WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    connection.release();

    res.json({ message: 'Faturamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar faturamento:', error);
    res.status(500).json({ error: 'Erro ao deletar faturamento' });
  }
});

module.exports = router;
