const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware para autenticação
router.use(authenticateToken);

// ============================================
// ENDPOINTS PARA TABELAS
// ============================================

// GET: Obter todas as tabelas com suas contas
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    // Buscar todas as tabelas do usuário
    const [tabelas] = await connection.execute(
      `SELECT id, nome, created_at FROM tabelas_chinesas WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Para cada tabela, buscar suas contas
    const tabelasComContas = await Promise.all(
      tabelas.map(async (tabela) => {
        const [contas] = await connection.execute(
          `SELECT id, telefone, pix, cpf, nome, saldo, status, tipo, tabela_id, created_at 
           FROM contas_chinesas 
           WHERE user_id = ? AND tabela_id = ? 
           ORDER BY created_at ASC`,
          [userId, tabela.id]
        );
        return {
          ...tabela,
          contas: contas || []
        };
      })
    );

    connection.release();
    res.json(tabelasComContas || []);
  } catch (error) {
    console.error('❌ Erro ao buscar tabelas:', error);
    res.status(500).json({ error: 'Erro ao buscar tabelas' });
  }
});

// POST: Criar nova tabela
router.post('/tabelas', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome da tabela é obrigatório' });
    }

    const connection = await pool.getConnection();

    // Verificar se já existe tabela com esse nome
    const [existente] = await connection.execute(
      `SELECT id FROM tabelas_chinesas WHERE user_id = ? AND nome = ?`,
      [userId, nome.trim()]
    );

    if (existente.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Já existe uma tabela com esse nome' });
    }

    // Criar tabela
    const [result] = await connection.execute(
      `INSERT INTO tabelas_chinesas (user_id, nome) VALUES (?, ?)`,
      [userId, nome.trim()]
    );

    connection.release();

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      nome: nome.trim(),
      contas: []
    });
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    res.status(500).json({ error: 'Erro ao criar tabela' });
  }
});

// DELETE: Deletar tabela (e todas suas contas)
router.delete('/tabelas/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const connection = await pool.getConnection();

    // Verificar se a tabela pertence ao usuário
    const [tabela] = await connection.execute(
      `SELECT id FROM tabelas_chinesas WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (tabela.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    // Deletar tabela (contas serão deletadas por CASCADE)
    await connection.execute(
      `DELETE FROM tabelas_chinesas WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    connection.release();
    res.json({ message: 'Tabela deletada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar tabela:', error);
    res.status(500).json({ error: 'Erro ao deletar tabela' });
  }
});

// ============================================
// ENDPOINTS PARA CONTAS
// ============================================

// POST: Criar nova conta em uma tabela
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { telefone, pix, cpf, nome, saldo, status, tipo, tabela_id, dominio } = req.body;

    let finalTabelaId = tabela_id;

    // Se usar o campo antigo `dominio`, criar/buscar tabela
    if (!finalTabelaId && dominio) {
      const connection = await pool.getConnection();
      
      // Buscar ou criar tabela com esse dominio
      let [tabelaExistente] = await connection.execute(
        `SELECT id FROM tabelas_chinesas WHERE user_id = ? AND nome = ?`,
        [userId, dominio]
      );

      if (tabelaExistente.length === 0) {
        const [result] = await connection.execute(
          `INSERT INTO tabelas_chinesas (user_id, nome) VALUES (?, ?)`,
          [userId, dominio]
        );
        finalTabelaId = result.insertId;
      } else {
        finalTabelaId = tabelaExistente[0].id;
      }

      connection.release();
    }

    if (!finalTabelaId) {
      return res.status(400).json({ error: 'tabela_id é obrigatório' });
    }

    const connection = await pool.getConnection();

    // Verificar se a tabela pertence ao usuário
    const [tabela] = await connection.execute(
      `SELECT id FROM tabelas_chinesas WHERE id = ? AND user_id = ?`,
      [finalTabelaId, userId]
    );

    if (tabela.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    // Criar conta
    const [result] = await connection.execute(
      `INSERT INTO contas_chinesas (user_id, tabela_id, telefone, pix, cpf, nome, saldo, status, tipo, dominio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, finalTabelaId, telefone || '', pix || '', cpf || '', nome || '', saldo || 0, status || 'Ativa', tipo || 'NOVA', dominio || '']
    );

    connection.release();

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      tabela_id: finalTabelaId,
      telefone,
      pix,
      cpf,
      nome,
      saldo,
      status,
      tipo
    });
  } catch (error) {
    console.error('❌ Erro ao criar conta:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// PUT: Atualizar conta
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { telefone, pix, cpf, nome, saldo, status, tipo, dominio } = req.body;

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

    // Atualizar conta
    await connection.execute(
      `UPDATE contas_chinesas 
       SET telefone = ?, pix = ?, cpf = ?, nome = ?, saldo = ?, status = ?, tipo = ?, dominio = ?
       WHERE id = ? AND user_id = ?`,
      [telefone, pix, cpf, nome, saldo, status, tipo, dominio || '', id, userId]
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
    console.error('❌ Erro ao atualizar conta:', error);
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

// DELETE: Deletar conta
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

    // Deletar conta
    await connection.execute(
      `DELETE FROM contas_chinesas WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    connection.release();
    res.json({ message: 'Conta deletada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar conta:', error);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
});

// ============================================
// ENDPOINTS LEGADO (compatibilidade)
// ============================================

// GET: Obter contas por domínio (LEGADO)
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
    console.error('❌ Erro ao buscar contas por domínio:', error);
    res.status(500).json({ error: 'Erro ao buscar contas' });
  }
});

// GET: Obter resumo/totais (LEGADO)
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
    console.error('❌ Erro ao buscar resumo:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo' });
  }
});

module.exports = router;
