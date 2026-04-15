const express = require('express');
const router = express.Router();
const multer = require('multer');
const { pool } = require('../db');
const { verifyToken } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Validar tipo de arquivo
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas imagens são permitidas'));
    }
    cb(null, true);
  },
});

router.put('/profile', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    const hasName = name && name.trim();
    const hasAvatar = req.file;

    if (!hasName && !hasAvatar) {
      return res.status(400).json({
        message: 'Envie pelo menos um campo para atualizar (nome ou avatar)',
      });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Construir query dinâmica - atualizar apenas campos enviados
    const updateFields = [];
    const params = [];

    if (hasName) {
      updateFields.push('name = ?');
      params.push(name.trim());
    }

    if (hasAvatar) {
      // Converter arquivo para base64
      const avatarBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        'base64'
      )}`;
      updateFields.push('avatarUrl = ?');
      params.push(avatarBase64);
    }

    params.push(userId);

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

    await connection.execute(updateQuery, params);

    // Buscar dados atualizados
    const [updatedUsers] = await connection.execute(
      'SELECT id, name, email, avatarUrl FROM users WHERE id = ?',
      [userId]
    );

    connection.release();

    if (updatedUsers.length === 0) {
      return res.status(404).json({ message: 'Erro ao atualizar perfil' });
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUsers[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil: ' + error.message });
  }
});

/**
 * GET /user/profile
 * Obter dados do perfil do usuário
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT id, name, email, avatarUrl, created_at FROM users WHERE id = ?',
      [userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

module.exports = router;
