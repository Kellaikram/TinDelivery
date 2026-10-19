// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * Génère un JWT token
 */
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { 
      id: userId, 
      email, 
      role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

/**
 * POST /api/auth/login
 * @desc    Connecter un utilisateur
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Validation des champs requis
    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur et inclure le mot de passe
    const user = await User.findOne({ email }).select('+motDePasse');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le statut de l'utilisateur
    if (user.status === 'inactif') {
      return res.status(403).json({
        success: false,
        error: 'Compte inactif. Veuillez contacter l\'administrateur'
      });
    }

    // Générer le token
    const token = generateToken(user._id, user.email, user.role);

    // Retourner les informations de l'utilisateur et le token
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        nomComplet: user.nomComplet,
        email: user.email,
        role: user.role,
        telephone: user.telephone,
        adresse: user.adresse,
        disponibilite: user.disponibilite,
        nombreLivraison: user.nombreLivraison
      }
    });

  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la connexion',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * POST /api/auth/refresh-token
 * @desc    Renouveler le token JWT
 * @access  Private (nécessite un token valide)
 */
const refreshToken = async (req, res) => {
  try {
    // Le middleware auth a déjà vérifié le token et défini req.user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    if (user.status === 'inactif') {
      return res.status(403).json({
        success: false,
        error: 'Compte inactif'
      });
    }

    // Générer un nouveau token
    const newToken = generateToken(user._id, user.email, user.role);

    return res.status(200).json({
      success: true,
      message: 'Token renouvelé',
      token: newToken
    });

  } catch (err) {
    console.error('Erreur lors du renouvellement du token:', err);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du renouvellement du token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * POST /api/auth/logout
 * @desc    Déconnecter un utilisateur (optionnel - JWT est stateless)
 * @access  Private
 */
const logout = (req, res) => {
  try {
    // JWT est stateless, donc on peut simplement retourner un message
    // En production, vous pourriez blacklister le token en base de données
    return res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la déconnexion'
    });
  }
};

/**
 * GET /api/auth/me
 * @desc    Récupérer les infos du user connecté
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        nomComplet: user.nomComplet,
        email: user.email,
        role: user.role,
        telephone: user.telephone,
        adresse: user.adresse,
        status: user.status,
        disponibilite: user.disponibilite,
        nombreLivraison: user.nombreLivraison
      }
    });

  } catch (err) {
    console.error('Erreur lors de la récupération des infos utilisateur:', err);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  getCurrentUser,
  generateToken
};
