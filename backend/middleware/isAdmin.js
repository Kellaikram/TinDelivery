module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentification requise' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Accès refusé - Rôle administrateur requis',
      userRole: req.user.role
    });
  }
  
  next();
};