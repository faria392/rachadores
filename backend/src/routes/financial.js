const express = require('express');
const { pool } = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ============================================
// GET - Buscar todos os dados financeiros do usuário
// ============================================
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const connection = await pool.getConnection();

    // Buscar faturamento do usuário
    const [revenue] = await connection.execute(
      `SELECT DATE(date) as data, SUM(amount) as faturamento 
       FROM revenue 
       WHERE user_id = ? 
       GROUP BY DATE(date)
       ORDER BY date DESC`,
      [userId]
    );

    // Buscar despesas do usuário
    const [expenses] = await connection.execute(
      `SELECT id, DATE(date) as data, name, amount as valor 
       FROM expenses 
       WHERE user_id = ? 
       ORDER BY date DESC`,
      [userId]
    );

    connection.release();

    // Transformar em formato esperado pelo frontend
    const dados = {};
    
    // Agrupar receitas por data
    revenue.forEach(r => {
      if (!dados[r.data]) {
        dados[r.data] = { data: r.data, faturamento: 0, gastos: [] };
      }
      dados[r.data].faturamento = r.faturamento;
    });

    // Agrupar despesas por data
    expenses.forEach(e => {
      if (!dados[e.data]) {
        dados[e.data] = { data: e.data, faturamento: 0, gastos: [] };
      }
      dados[e.data].gastos.push({
        id: e.id,
        nome: e.name,
        valor: e.valor,
      });
    });

    // Converter para array
    const dadosArray = Object.values(dados).sort((a, b) => 
      new Date(b.data) - new Date(a.data)
    );

    res.json(dadosArray);
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// ============================================
// GET - Buscar dados de um dia específico
// ============================================
router.get('/day/:date', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.params;
    const connection = await pool.getConnection();

    // Buscar faturamento do dia
    const [revenue] = await connection.execute(
      `SELECT SUM(amount) as faturamento 
       FROM revenue 
       WHERE user_id = ? AND DATE(date) = ?`,
      [userId, date]
    );

    // Buscar despesas do dia
    const [expenses] = await connection.execute(
      `SELECT id, name, amount as valor 
       FROM expenses 
       WHERE user_id = ? AND DATE(date) = ?`,
      [userId, date]
    );

    connection.release();

    res.json({
      data: date,
      faturamento: revenue[0]?.faturamento || 0,
      gastos: expenses.map(e => ({
        id: e.id,
        nome: e.name,
        valor: e.valor,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dia:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// ============================================
// POST - Adicionar/atualizar faturamento
// ============================================
router.post('/revenue', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { date, amount } = req.body;

    if (!date || !amount) {
      return res.status(400).json({ error: 'Date e amount são obrigatórios' });
    }

    const connection = await pool.getConnection();

    // Verificar se já existe registro para este dia
    const [existing] = await connection.execute(
      `SELECT id FROM revenue WHERE user_id = ? AND DATE(date) = ?`,
      [userId, date]
    );

    if (existing.length > 0) {
      // Atualizar
      await connection.execute(
        `UPDATE revenue SET amount = ? WHERE user_id = ? AND DATE(date) = ?`,
        [amount, userId, date]
      );
    } else {
      // Inserir novo (date já é string YYYY-MM-DD)
      await connection.execute(
        `INSERT INTO revenue (user_id, date, amount) VALUES (?, ?, ?)`,
        [userId, date, amount]
      );
    }

    connection.release();

    res.json({ success: true, message: 'Faturamento salvo com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar faturamento:', error);
    res.status(500).json({ error: 'Erro ao salvar faturamento' });
  }
});

// ============================================
// POST - Adicionar despesa
// ============================================
router.post('/expenses', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { date, name, amount } = req.body;

    if (!date || !name || !amount) {
      return res.status(400).json({ error: 'Date, name e amount são obrigatórios' });
    }

    const connection = await pool.getConnection();

    await connection.execute(
      `INSERT INTO expenses (user_id, date, name, amount) VALUES (?, ?, ?, ?)`,
      [userId, date, name, amount]
    );

    const [result] = await connection.execute(
      `SELECT LAST_INSERT_ID() as id`
    );

    connection.release();

    res.json({
      success: true,
      id: result[0].id,
      message: 'Despesa adicionada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    res.status(500).json({ error: 'Erro ao adicionar despesa' });
  }
});

// ============================================
// PUT - Editar despesa
// ============================================
router.put('/expenses/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, amount } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ error: 'Name e amount são obrigatórios' });
    }

    const connection = await pool.getConnection();

    // Verificar se a despesa pertence ao usuário
    const [expense] = await connection.execute(
      `SELECT id FROM expenses WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (expense.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    await connection.execute(
      `UPDATE expenses SET name = ?, amount = ? WHERE id = ? AND user_id = ?`,
      [name, amount, id, userId]
    );

    connection.release();

    res.json({ success: true, message: 'Despesa atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Erro ao atualizar despesa' });
  }
});

// ============================================
// DELETE - Remover despesa
// ============================================
router.delete('/expenses/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const connection = await pool.getConnection();

    // Verificar se a despesa pertence ao usuário
    const [expense] = await connection.execute(
      `SELECT id FROM expenses WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (expense.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    await connection.execute(
      `DELETE FROM expenses WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    connection.release();

    res.json({ success: true, message: 'Despesa removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover despesa:', error);
    res.status(500).json({ error: 'Erro ao remover despesa' });
  }
});

module.exports = router;
