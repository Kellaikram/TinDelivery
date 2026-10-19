// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nomComplet: {
    type: String,
    required: [true, 'Le nom complet est requis'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide'],
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    trim: true,
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true,
  },
  role: {
    type: String,
    enum: [ 'livreur', 'admin'],
    default: 'client',
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false,
  },
  status: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif',
  },
  disponibilite: {
    type: Boolean,
    default: true,
  },
  nombreLivraison: {
    type: Number,
    default: 0,
  },
  
}, { timestamps: true });

// Middleware : hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next();
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);