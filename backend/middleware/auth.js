const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'Token manquant - Veuillez vous connecter' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Format de token invalide. Utilisez: Bearer <token>' 
      });
    }
    
    // Vérifier et décoder le token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: 'Token expiré',
          expiredAt: jwtError.expiredAt
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          error: 'Token invalide ou malformé'
        });
      }
      throw jwtError;
    }
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la vérification du token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};