// models/PositionColis.js
const mongoose = require('mongoose');

const positionColisSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: [true, 'La latitude est requise'],
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: [true, 'La longitude est requise'],
    min: -180,
    max: 180,
  },
  libelleEtape: {
    type: String,
    required: [true, "Le libellé de l'étape est requis"],
    trim: true,
  },
  statut: {
    type: String,
    enum: ['en transit', 'en attente', 'livré'],
    default: 'en transit',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  idColis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis',
    required: [true, 'Le colis associé est requis'],
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('PositionColis', positionColisSchema);