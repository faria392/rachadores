const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/financeiro - Retorna todos os dados financeiros do usuário
router.get('/', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Buscar todos os registros financeiros do usuário
    const [registros] = await connection.execute(`
      SELECT 
        rf.id,
        rf.data,
        rf.faturamento
      FROM registros_financeiros rf
      WHERE rf.user_id = ?
      ORDER BY rf.data DESC
    `, [req.userId]);

    // Para cada registro, buscar seus gastos
    const dados = [];
    for (const registro of registros) {
      const [gastos] = await connection.execute(`
        SELECT id, nome, valor
        FROM gastos
        WHERE registro_id = ?
        ORDER BY created_at ASC
      `, [registro.id]);

      dados.push({
        id: registro.id,
        data: registro.data,
        faturamento: parseFloat(registro.faturamento) || 0,
        gastos: gastos.map(g => ({
          id: g.id,
          nome: g.nome,
          valor: parseFloat(g.valor)
        }))
      });
    }

    connection.release();
    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

router.post('/faturamento', verifyToken, async (req, res) => {
  const { data, faturamento } = req.body;

  if (!data || faturamento === undefined) {
    return res.status(400).json({ error: 'Data e faturamento são obrigatórios' });
  }

  try {
    const connection = await pool.getConnection();

    const [result] = await connection.execute(`
      INSERT INTO registros_financeiros (user_id, data, faturamento)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE faturamento = ?
    `, [req.userId, data, faturamento, faturamento]);

    const [registros] = await connection.execute(`
      SELECT id FROM registros_financeiros
      WHERE user_id = ? AND data = ?
    `, [req.userId, data]);

    if (registros.length === 0) {
      connection.release();
      return res.status(500).json({ error: 'Erro ao salvar faturamento' });
    }

    const registroId = registros[0].id;

    const [gastos] = await connection.execute(`
      SELECT id, nome, valor
      FROM gastos
      WHERE registro_id = ?
    `, [registroId]);

    connection.release();

    res.json({
      id: registroId,
      data,
      faturamento,
      gastos: gastos.map(g => ({
        id: g.id,
        nome: g.nome,
        valor: parseFloat(g.valor)
      }))
    });
  } catch (error) {
    console.error('Erro ao salvar faturamento:', error);
    res.status(500).json({ error: 'Erro ao salvar faturamento' });
  }
});

router.post('/gasto', verifyToken, async (req, res) => {
  const { data, nome, valor } = req.body;

  if (!data || !nome || valor === undefined) {
    return res.status(400).json({ error: 'Data, nome e valor são obrigatórios' });
  }

  try {
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(`
      INSERT INTO registros_financeiros (user_id, data, faturamento)
      VALUES (?, ?, 0)
      ON DUPLICATE KEY UPDATE id = id
    `, [req.userId, data]);


    const [registros] = await connection.execute(`
      SELECT id FROM registros_financeiros
      WHERE user_id = ? AND data = ?
    `, [req.userId, data]);

    if (registros.length === 0) {
      connection.release();
      return res.status(500).json({ error: 'Erro ao criar registro' });
    }

    const registroId = registros[0].id;

    // Adicionar o gasto
    const [gastoResult] = await connection.execute(`
      INSERT INTO gastos (registro_id, nome, valor)
      VALUES (?, ?, ?)
    `, [registroId, nome, valor]);

    connection.release();

    res.json({
      id: gastoResult.insertId,
      nome,
      valor: parseFloat(valor)
    });
  } catch (error) {
    console.error('Erro ao adicionar gasto:', error);
    res.status(500).json({ error: 'Erro ao adicionar gasto' });
  }
});

// PUT /api/financeiro/gasto/:id - Edita um gasto
router.put('/gasto/:id', verifyToken, async (req, res) => {
  const gastoId = req.params.id;
  const { nome, valor } = req.body;

  if (!nome || valor === undefined) {
    return res.status(400).json({ error: 'Nome e valor são obrigatórios' });
  }

  try {
    const connection = await pool.getConnection();

    // Verificar se o gasto pertence ao usuário
    const [gastosVerify] = await connection.execute(`
      SELECT g.id
      FROM gastos g
      JOIN registros_financeiros rf ON g.registro_id = rf.id
      WHERE g.id = ? AND rf.user_id = ?
    `, [gastoId, req.userId]);

    if (gastosVerify.length === 0) {
      connection.release();
      return res.status(403).json({ error: 'Gasto não encontrado' });
    }

    // Atualizar o gasto
    await connection.execute(`
      UPDATE gastos
      SET nome = ?, valor = ?
      WHERE id = ?
    `, [nome, valor, gastoId]);

    connection.release();

    res.json({
      id: parseInt(gastoId),
      nome,
      valor: parseFloat(valor)
    });
  } catch (error) {
    console.error('Erro ao editar gasto:', error);
    res.status(500).json({ error: 'Erro ao editar gasto' });
  }
});

// DELETE /api/financeiro/gasto/:id - Remove um gasto
router.delete('/gasto/:id', verifyToken, async (req, res) => {
  const gastoId = req.params.id;

  try {
    const connection = await pool.getConnection();

    // Verificar se o gasto pertence ao usuário
    const [gastosVerify] = await connection.execute(`
      SELECT g.id
      FROM gastos g
      JOIN registros_financeiros rf ON g.registro_id = rf.id
      WHERE g.id = ? AND rf.user_id = ?
    `, [gastoId, req.userId]);

    if (gastosVerify.length === 0) {
      connection.release();
      return res.status(403).json({ error: 'Gasto não encontrado' });
    }

    // Deletar o gasto
    await connection.execute(`
      DELETE FROM gastos
      WHERE id = ?
    `, [gastoId]);

    connection.release();

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar gasto:', error);
    res.status(500).json({ error: 'Erro ao deletar gasto' });
  }
});

// PUT /api/financeiro/faturamento/:data - Edita faturamento de uma data específica
router.put('/faturamento/:data', verifyToken, async (req, res) => {
  const { data } = req.params;
  const { faturamento } = req.body;

  if (faturamento === undefined) {
    return res.status(400).json({ error: 'Faturamento é obrigatório' });
  }

  try {
    const connection = await pool.getConnection();

    // Verificar se o registro pertence ao usuário
    const [registrosVerify] = await connection.execute(`
      SELECT id FROM registros_financeiros
      WHERE user_id = ? AND data = ?
    `, [req.userId, data]);

    if (registrosVerify.length === 0) {
      connection.release();
      return res.status(403).json({ error: 'Registro não encontrado' });
    }

    // Atualizar o faturamento
    await connection.execute(`
      UPDATE registros_financeiros
      SET faturamento = ?
      WHERE user_id = ? AND data = ?
    `, [faturamento, req.userId, data]);

    connection.release();

    res.json({
      data,
      faturamento: parseFloat(faturamento)
    });
  } catch (error) {
    console.error('Erro ao editar faturamento:', error);
    res.status(500).json({ error: 'Erro ao editar faturamento' });
  }
});

module.exports = router;
