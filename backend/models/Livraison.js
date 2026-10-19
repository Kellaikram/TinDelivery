// models/Livraison.js
const mongoose = require('mongoose');

const livraisonSchema = new mongoose.Schema({
  dateEstimee: {
    type: Date,
    required: [true, 'La date estimée est requise'],
  },
  statut: {
    type: String,
    enum: ['en attente', 'en cours', 'livrée', 'annulée'],
    default: 'en attente',
  },
  idColis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis',
    required: [true, 'Le colis associé est requis'],
    index: true,
  },
  idLivreur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // référence vers un utilisateur avec role = 'livreur'
    required: false, // pas toujours affecté dès le départ
    index: true,
  },
  dateLivraison: {
    type: Date,
    default: null,   // sera rempli quand la livraison passe à "livrée"
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Livraison', livraisonSchema);