// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, refreshToken, logout, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

/**
 * POST /api/auth/login
 * @desc    Connecter un utilisateur
 * @access  Public
 * Body: { email, motDePasse }
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh-token
 * @desc    Renouveler le token JWT
 * @access  Private
 */
router.post('/refresh-token', auth, refreshToken);

/**
 * POST /api/auth/logout
 * @desc    Déconnecter un utilisateur
 * @access  Private
 */
router.post('/logout', auth, logout);

/**
 * GET /api/auth/me
 * @desc    Récupérer les infos du user connecté
 * @access  Private
 */
router.get('/me', auth, getCurrentUser);

module.exports = router;
