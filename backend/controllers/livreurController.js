/**
 * Contrôleur pour la gestion des livreurs
 */
const User = require('../models/User');
const crypto = require('crypto');
const transporter = require('../config/email');
const { sendWelcomeEmailAsync } = require('../utils/email_send');
const Livraison = require('../models/Livraison');
/**
 * Génère un mot de passe aléatoire sécurisé
 */
const generatePassword = (length = 16, options = {}) => {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options;

  let charset = '';
  if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers)   charset += '0123456789';
  if (symbols)   charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (charset.length === 0) {
    throw new Error('Au moins un type de caractère doit être autorisé');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }

  // Garantir qu'au moins un caractère de chaque type demandé est présent
  if (lowercase && !/[a-z]/.test(password)) {
    const pos = crypto.randomInt(0, length);
    password = password.substring(0, pos) + 
               'abcdefghijklmnopqrstuvwxyz'[crypto.randomInt(0, 26)] + 
               password.substring(pos + 1);
  }
  if (uppercase && !/[A-Z]/.test(password)) {
    const pos = crypto.randomInt(0, length);
    password = password.substring(0, pos) + 
               'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.randomInt(0, 26)] + 
               password.substring(pos + 1);
  }
  if (numbers && !/[0-9]/.test(password)) {
    const pos = crypto.randomInt(0, length);
    password = password.substring(0, pos) + 
               '0123456789'[crypto.randomInt(0, 10)] + 
               password.substring(pos + 1);
  }
  if (symbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    const pos = crypto.randomInt(0, length);
    password = password.substring(0, pos) + 
               '!@#$%^&*()_+-=[]{}|;:,.<>?'[crypto.randomInt(0, 25)] + 
               password.substring(pos + 1);
  }

  return password;
};


/**
 * POST /api/livreurs - Création
 */
const createLivreur = async (req, res) => {
  try {
    const { nomComplet, email, telephone, adresse } = req.body;

    // Validation des champs requis
    if (!nomComplet || !email || !telephone || !adresse) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont obligatoires: nomComplet, email, telephone, adresse',
      });
    }

    // Génération du mot de passe temporaire
    const plainPassword = generatePassword(12, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });

    // Création du livreur dans la base de données
    const livreur = await User.create({
      nomComplet,
      email,
      telephone,
      adresse,
      motDePasse: plainPassword,
      role: 'livreur',
      status: 'actif',
      disponibilite: true,
      nombreLivraison: 0,
    });

    // Retirer les champs sensibles de la réponse
    const { motDePasse, __v, ...livreurSansMdp } = livreur.toObject();

    // Envoyer la réponse succès
    res.status(201).json({
      success: true,
      data: livreurSansMdp,
      message: 'Livreur créé avec succès. Un email avec les identifiants a été envoyé.',
    });

    // Envoyer l'email de bienvenue (fire-and-forget)
    sendWelcomeEmailAsync(transporter, { nomComplet, email, plainPassword });

  } catch (error) {
    // Gérer l'erreur de duplication d'email (code MongoDB 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà.',
        field: 'email',
      });
    }

    // Log l'erreur complète pour debugging
    console.error('Erreur lors de la création du livreur:', error);

    // Répondre avec l'erreur
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la création du livreur.',
    });
  }
};

// Mettre à jour les informations d'un livreur (accessible uniquement par l'admin)
const updateLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'nomComplet',
      'email',
      'telephone',
      'adresse',
    ];

    const filteredUpdates = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Vérifier si l'email est modifié et s'il est déjà utilisé par un autre utilisateur
    if (filteredUpdates.email) {
      const existingUser = await User.findOne({
        email: filteredUpdates.email,
        _id: { $ne: id }, // exclure l'utilisateur actuel
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Cet email est déjà utilisé par un autre utilisateur.',
        });
      }
    }

    const livreur = await User.findOneAndUpdate(
      { _id: id, role: 'livreur' },
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-motDePasse');

    if (!livreur) {
      return res.status(404).json({ success: false, error: 'Livreur non trouvé' });
    }

    res.status(200).json({ success: true, data: livreur });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/livreurs - Liste complète
 */
const getAllLivreurs = async (req, res) => {
  try {
    const livreurs = await User.find({ role: 'livreur' })
      .select('-motDePasse')
      .lean();

    res.status(200).json({
      success: true,
      count: livreurs.length,
      data: livreurs,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livreurs:', error);

    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des livreurs.',
    });
  }
};


const deleteLivreur = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier d'abord que le livreur existe
    const livreur = await User.findOne({ _id: id, role: 'livreur' });
    if (!livreur) {
      return res.status(404).json({ success: false, error: 'Livreur non trouvé' });
    }

    // Vérifier s'il a des livraisons en cours (statut non final)
    const livraisonsActives = await Livraison.countDocuments({
      idLivreur: id,
      statut: { $in: ['en préparation', 'en cours'] }
    });

    if (livraisonsActives > 0) {
      return res.status(400).json({
        success: false,
        error: `Impossible de supprimer ce livreur : ${livraisonsActives} livraison(s) active(s) lui sont encore affectée(s).`
      });
    }

    // Si tout est bon, on supprime
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Livreur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/livreurs/search - Recherche par nom
 */
const searchLivreursByNom = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: "Le paramètre 'q' est requis." });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      role: 'livreur',
      nomComplet: { $regex: query, $options: 'i' }
    };

    const [livreurs, total] = await Promise.all([
      User.find(filter).select('-motDePasse').sort({ nomComplet: 1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: livreurs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Filtrage par disponibilité
 */
const getLivreursByDisponibilite = (disponible) => async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'livreur', disponibilite: disponible };

    const [livreurs, total] = await Promise.all([
      User.find(filter).select('-motDePasse').sort({ nomComplet: 1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: livreurs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// chnager le statut d'un livreur (actif, inactif)
const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const livreur = await User.findOne({ _id: id, role: 'livreur' });
    if (!livreur) {
      return res.status(404).json({ success: false, error: 'Livreur non trouvé' });
    }

    // Si on veut basculer vers 'inactif' (donc si actuellement 'actif')
    if (livreur.status === 'actif') {
      const livraisonsActives = await Livraison.countDocuments({
        idLivreur: id,
        statut: { $in: ['en préparation', 'en cours'] }
      });

      if (livraisonsActives > 0) {
        return res.status(400).json({
          success: false,
          error: `Impossible de désactiver le livreur : ${livraisonsActives} livraison(s) active(s) lui sont encore affectée(s).`
        });
      }
    }

    // Basculer
    livreur.status = livreur.status === 'actif' ? 'inactif' : 'actif';
    await livreur.save();

    const { motDePasse, ...livreurSansMdp } = livreur.toObject();
    res.status(200).json({
      success: true,
      data: livreurSansMdp,
      message: `Statut basculé en "${livreur.status}"`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMesLivraisons = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtre par statut (optionnel)
    const livreurId = req.user.id || req.user._id; // Support id et _id
    const filtre = { idLivreur: livreurId };
    if (req.query.statut) {
      const statutsValides = ['en attente', 'en cours', 'livrée', 'annulée'];
      if (!statutsValides.includes(req.query.statut)) {
        return res.status(400).json({ error: 'Statut invalide' });
      }
      filtre.statut = req.query.statut;
    }

    // Tri (par date estimée ascendante par défaut)
    const sort = req.query.sort || 'dateEstimee';
    const order = sort.startsWith('-') ? -1 : 1;
    const sortField = sort.replace(/^-/, '');
    const sortObj = {};
    sortObj[sortField] = order;

    const [livraisons, total] = await Promise.all([
      Livraison.find(filtre)
        .populate('idColis')
        .populate('idLivreur', 'nomComplet email telephone') // <--- AJOUTE CETTE LIGNE ICI
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Livraison.countDocuments(filtre)
    ]);

    res.json({
      success: true,
      data: livraisons,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};







// ON EXPORTE TOUT D'UN COUP ICI A LA FIN
module.exports = { 
    createLivreur, 
    getAllLivreurs, 
    searchLivreursByNom, 
    getLivreursByDisponibilite ,
    deleteLivreur,
    updateLivreur,
    changeStatus,
    getMesLivraisons
};

