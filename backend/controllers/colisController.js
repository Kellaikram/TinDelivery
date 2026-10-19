// controllers/colisController.js
const Colis = require('../models/Colis');
const Livraison = require('../models/Livraison');
const User = require('../models/User');
const { sendTrackingEmail } = require("../services/emailService");
const PositionColis = require('../models/PositionColis'); 

/**
 * @desc    Créer un nouveau colis
 * @route   POST /api/colis
 * @access  Admin
 */

const generateTrackingCode = () => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `TD-${date}-${random}`;
};


const createColis = async (req, res) => {
  try {
    const {
      poids,
      expediteurNomComplet,
      expediteurTelephone,
      expediteurEmail,
      expediteurAdresse,
      destinataireNomComplet,
      destinataireTelephone,
      destinataireEmail,
      destinataireAdresse,
    } = req.body;

    // Validation
    const champsManquants = [];
    if (!expediteurNomComplet) champsManquants.push("expediteurNomComplet");
    if (!expediteurTelephone) champsManquants.push("expediteurTelephone");
    if (!expediteurEmail) champsManquants.push("expediteurEmail");
    if (!expediteurAdresse) champsManquants.push("expediteurAdresse");
    if (!destinataireNomComplet) champsManquants.push("destinataireNomComplet");
    if (!destinataireTelephone) champsManquants.push("destinataireTelephone");
    if (!destinataireEmail) champsManquants.push("destinataireEmail");
    if (!destinataireAdresse) champsManquants.push("destinataireAdresse");

    if (poids === undefined || poids === null || poids === "") {
      champsManquants.push("poids");
    }

    if (champsManquants.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Champs obligatoires manquants.",
        errors: champsManquants.map((champ) => ({
          champ,
          message: `Le champ "${champ}" est obligatoire.`,
        })),
      });
    }

    if (Number(poids) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Données invalides.",
        errors: [{ champ: "poids", message: "Le poids doit être supérieur à 0." }],
      });
    }

    const codeSuivi = generateTrackingCode();
    const statut = "en attente";

    const colis = await Colis.create({
      codeSuivi,
      poids,
      status: statut,
      expediteurNomComplet,
      expediteurTelephone,
      expediteurEmail,
      expediteurAdresse,
      destinataireNomComplet,
      destinataireTelephone,
      destinataireEmail,
      destinataireAdresse,
    });

    let emailResults = [];

    try {
      const results = await Promise.all([
        sendTrackingEmail(expediteurEmail, codeSuivi),
        sendTrackingEmail(destinataireEmail, codeSuivi)
      ]);

      emailResults = results;
      console.log("📧 Email status :", emailResults);


    } catch (err) {
      console.error("Erreur globale email :", err.message);
    }
    const [expediteurResult, destinataireResult] = emailResults;

    return res.status(201).json({
      success: true,
      message: "Colis créé avec succès.",
      codeSuivi,
      emailStatus: {
        expediteur: expediteurResult || { success: false, error: "Non envoyé" },
        destinataire:  destinataireResult || { success: false, error: "Non envoyé" }
      },
      recipients: [expediteurEmail, destinataireEmail],
      data: colis,
    });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Données invalides.",
          errors: Object.values(error.errors).map((e) => ({
            champ: e.path,
            message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du colis.",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

const getAllColis = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [colis, total] = await Promise.all([
      Colis.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Colis.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Liste des colis récupérée avec succès.",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: colis,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des colis.",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

const updateColis = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Vérifier ID valide
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID du colis requis"
      });
    }

    // 2. Trouver le colis
    const colis = await Colis.findById(id);

    if (!colis) {
      return res.status(404).json({
        success: false,
        message: "Colis introuvable"
      });
    }

    // 3. Liste des champs autorisés
    const allowedFields = [
      "poids",
      "status",
      "expediteurNomComplet",
      "expediteurTelephone",
      "expediteurEmail",
      "expediteurAdresse",
      "destinataireNomComplet",
      "destinataireTelephone",
      "destinataireEmail",
      "destinataireAdresse"
    ];

    // 4. Mise à jour contrôlée
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        colis[key] = req.body[key];
      }
    });

    // 5. Validation métier
    if (colis.poids !== undefined && Number(colis.poids) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le poids doit être supérieur à 0"
      });
    }

    // 6. Sauvegarde
    await colis.save();

    // 7. Réponse propre
    return res.status(200).json({
      success: true,
      message: "Colis modifié avec succès",
      data: colis
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la modification",
      ...(process.env.NODE_ENV === "development" && { error: error.message })
    });
  }
};

const deleteColis = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Vérifier ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID du colis requis"
      });
    }

    // 2. SUPPRESSION DIRECTE (PROPRE)
    const deleted = await Colis.findByIdAndDelete(id);

    // 3. Si rien trouvé
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Colis introuvable"
      });
    }

    // 4. Réponse OK
    return res.status(200).json({
      success: true,
      message: "Colis supprimé avec succès",
      deletedId: id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression",
      error: error.message
    });
  }
};


const assignColisToLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const { idLivreur } = req.body;

    // 1. Vérifier que le colis existe
    const colis = await Colis.findById(id);
    if (!colis) {
      return res.status(404).json({ success: false, error: 'Colis introuvable' });
    }

    // 2. Vérifier le livreur et son rôle
    const livreur = await User.findOne({ _id: idLivreur, role: 'livreur' });
    if (!livreur) {
      return res.status(404).json({ success: false, error: 'Livreur introuvable' });
    }

    // 3. Vérifier la disponibilité du livreur
    if (!livreur.disponibilite) {
      return res.status(400).json({ success: false, error: 'Ce livreur n’est pas disponible actuellement.' });
    }

    // 4. Limite journalière (10 livraisons max)
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    const finJour = new Date();
    finJour.setHours(23, 59, 59, 999);

    const nbLivraisonsAujourdhui = await Livraison.countDocuments({
      idLivreur,
      createdAt: { $gte: debutJour, $lte: finJour }
    });

    if (nbLivraisonsAujourdhui >= 10) {
      return res.status(400).json({
        success: false,
        error: `Limite journalière atteinte : ${nbLivraisonsAujourdhui} livraisons déjà assignées aujourd’hui.`
      });
    }

    // 5. Créer l'enregistrement de Livraison
    const livraison = await Livraison.create({
      idColis: id,
      idLivreur,
      dateEstimee: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain par défaut
      statut: 'en cours',
    });

    // 6. INITIALISATION GÉOGRAPHIQUE (Agence Tinghir)
    // Cette étape permet à la carte du client d'afficher un point dès l'assignation
    
    await PositionColis.create({
        latitude: 31.5173, // Ton agence réelle à Tinghir
        longitude: -5.5348,
        libelleEtape: "Colis en attente à l'Agence Centrale (Tinghir)",
        statut: 'en attente',
        idColis: id
    });
        
    // 7. Mise à jour du statut du colis
    colis.status = 'en cours';
    await colis.save();

    // 8. Mise à jour des stats du livreur
    livreur.nombreLivraison = (livreur.nombreLivraison || 0) + 1;
    await livreur.save();

    res.status(201).json({
      success: true,
      message: 'Colis assigné et position initialisée à Tinghir.',
      livraison,
      colis: {
        id: colis._id,
        codeSuivi: colis.codeSuivi,
        status: colis.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const trackColis = async (req, res) => {
  try {
    const { codeSuivi } = req.params;
    const colis = await Colis.findOne({ codeSuivi });

    if (!colis) return res.status(404).json({ success: false, error: "Code invalide" });

    const livraison = await Livraison.findOne({ idColis: colis._id }).populate('idLivreur', 'nomComplet');
    
    // ON FORCE LE TRI PAR DATE DÉCROISSANTE POUR AVOIR LA POSITION LA PLUS RÉCENTE
    const position = await PositionColis.findOne({ idColis: colis._id }).sort({ createdAt: -1 });

    // Log pour vérifier dans ton terminal ce que le serveur envoie
    console.log("Position envoyée au front :", position.latitude, position.longitude);

    res.status(200).json({
      success: true,
      colis,
      livraison,
      position, // C'est cette position que le front va utiliser
      historique: [
        { status: "EXPÉDITION RAMASSÉE", location: "AGENCE TINGHIR", done: true },
        { status: "EN TRANSIT", location: "SECTEUR URBAIN", done: colis.status !== 'en attente' },
        { status: "LIVRÉE", location: colis.destinataireAdresse, done: (colis.status === 'livré' || colis.status === 'livrée' || colis.status === 'annulé') }
      ]
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
};
module.exports = {
  createColis,
  getAllColis,
  updateColis,
  deleteColis,
  assignColisToLivreur,
  trackColis
};