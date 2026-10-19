// routes/colisRoutes.js
const express = require('express');
const router = express.Router();
const { createColis, getAllColis, updateColis,deleteColis, assignColisToLivreur, trackColis } = require('../controllers/colisController');



/**
 * @route   POST /api/colis
 * @desc    Créer un nouveau colis
 * @access  Admin
 */
router.post('/', createColis);

/**
 * @route   GET /api/colis
 * @desc    Récupérer tous les colis (pagination supportée via query params)
 * @access  Admin
 */
router.get('/', getAllColis);
// Route pour mettre à jour un colis 
router.put('/:id', updateColis);
// Route pour supprimer un colis    
router.delete('/:id', deleteColis);

// Route pour assigner un colis à un livreur
router.post('/:id/assign', assignColisToLivreur);


// ROUTE PUBLIQUE (Pas de middleware de sécurité ici)
router.get('/track/:codeSuivi', trackColis);

module.exports = router;