const mongoose = require('mongoose');

const colisSchema = new mongoose.Schema({
  poids: {
    type: Number,
    required: true,
    min: 0,
  },

  status: {
    type: String,
    enum: ['en attente', 'en cours', 'livré', 'annulé'],
    default: 'en attente',
  },

  dateCreation: {
    type: Date,
    default: Date.now,
  },

  dateLivraison: {
    type: Date,
  },
  codeSuivi: {
    type: String,
    required: true,
    unique: true,
  },
  // Expéditeur
  expediteurNomComplet: {
    type: String,
    required: true,
    trim: true,
  },

  expediteurTelephone: {
    type: String,
    required: true,
    trim: true,
  },

  expediteurEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  expediteurAdresse: {
    type: String,
    required: true,
    trim: true,
  },

  // Destinataire
  destinataireNomComplet: {
    type: String,
    required: true,
    trim: true,
  },

  destinataireTelephone: {
    type: String,
    required: true,
    trim: true,
  },

  destinataireEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  destinataireAdresse: {
    type: String,
    required: true,
    trim: true,
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model('Colis', colisSchema);