const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    
    // Validar se o usuário ainda existe no banco
    try {
      const connection = await pool.getConnection();
      const [user] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [req.userId]
      );
      connection.release();
      
      if (!user || user.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
    } catch (dbError) {
      console.error('Erro ao verificar usuário no banco:', dbError);
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { verifyToken };
