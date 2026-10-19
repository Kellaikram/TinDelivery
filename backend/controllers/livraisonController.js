
const Livraison = require('../models/Livraison');
const User = require('../models/User');
const Colis = require('../models/Colis');
const axios = require('axios'); // Pour appeler le service de géocodage
const PositionColis = require('../models/PositionColis');


// Fonction utilitaire pour le géocodage à Tinghir
const getRealCoordinates = async (adresse) => {
  try {
    const query = `${adresse}, Tinghir, Maroc`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, { headers: { 'User-Agent': 'TinDelivery-Project' } });
    if (response.data && response.data.length > 0) {
      return { lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) };
    }
    return { lat: 31.5120, lng: -5.5360 }; // Position de secours à Tinghir
  } catch (error) {
    return { lat: 31.5147, lng: -5.5323 };
  }
};


// Récupérer toutes les livraisons avec pagination
exports.getAllLivraisons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [livraisons, total] = await Promise.all([
      Livraison.find()
        .populate('idColis')
        .populate('idLivreur', 'nomComplet email telephone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Livraison.countDocuments()
    ]);

    res.json({
      success: true,
      data: livraisons,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Récupérer les statistiques de livraisons
exports.getStatsLivraisons = async (req, res) => {
  try {
    const [total, enAttente, enCours, livrees, annulees] = await Promise.all([
      Livraison.countDocuments(),
      Livraison.countDocuments({ statut: 'en attente' }),
      Livraison.countDocuments({ statut: 'en cours' }),
      Livraison.countDocuments({ statut: 'livrée' }),
      Livraison.countDocuments({ statut: 'annulée' })
    ]);

    res.json({
      success: true,
      stats: { total, enAttente, enCours, livrees, annulees }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Mettre à jour une livraison (ex: changement de livreur, mise à jour du statut)
// Mettre à jour une livraison (Admin)
exports.updateLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id);
    if (!livraison) return res.status(404).json({ error: 'Livraison introuvable' });

    // Vérification si terminée
    if (['livrée', 'annulée'].includes(livraison.statut))
      return res.status(400).json({ error: 'Modification interdite sur une livraison terminée' });

    // --- UNE SEULE DÉCLARATION ICI (J'ai ajouté "adresse") ---
    const { dateEstimee, statut, idColis, idLivreur, dateLivraison, adresse } = req.body;

    // 1. Mise à jour de l'adresse dans la table Colis
    if (adresse) {
      await Colis.findByIdAndUpdate(livraison.idColis, {
        destinataireAdresse: adresse
      });
    }

    // 2. Logique pour le statut "livrée"
    if (statut === 'livrée') {
      livraison.dateLivraison = dateLivraison ? new Date(dateLivraison) : new Date();
      await Colis.findByIdAndUpdate(livraison.idColis, {
        status: 'livré',
        dateLivraison: livraison.dateLivraison
      });
    }

    // 3. Logique de changement de livreur (Code d'Oussama)
    if (idLivreur && idLivreur !== livraison.idLivreur?.toString()) {
      const livreur = await User.findOne({ _id: idLivreur, role: 'livreur' });
      if (!livreur) return res.status(404).json({ error: 'Livreur introuvable' });
      if (!livreur.disponibilite) return res.status(400).json({ error: 'Livreur non disponible' });

      // Mise à jour des compteurs du livreur
      if (livraison.idLivreur) {
        await User.findByIdAndUpdate(livraison.idLivreur, { $inc: { nombreLivraison: -1 } });
      }
      await User.findByIdAndUpdate(idLivreur, { $inc: { nombreLivraison: 1 } });
      livraison.idLivreur = idLivreur;
    }

    // 4. Enregistrement des autres modifications
    if (dateEstimee) livraison.dateEstimee = new Date(dateEstimee);
    if (statut) livraison.statut = statut;
    
    await livraison.save();
    
    // On repeuple pour renvoyer un objet propre au frontend
    await livraison.populate(['idColis', { path: 'idLivreur', select: 'nomComplet email' }]);

    res.json({ success: true, data: livraison });
  } catch (err) {
    console.error("Erreur updateLivraison:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour une livraison (ex: changement de livreur, mise à jour du statut)
exports.deleteLivraison = async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id);
    if (!livraison) return res.status(404).json({ error: 'Livraison introuvable' });
    if (livraison.statut === 'livrée') return res.status(400).json({ error: 'Impossible de supprimer une livraison livrée' });

    // Remettre le colis  livrée
    await Colis.findByIdAndUpdate(livraison.idColis, { status: 'livré' });

    

    await Livraison.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Livraison supprimée' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marquer comme livrée pour livreur
exports.markLivraisonLivree = async (req, res) => {
  try {
    // ON AJOUTE .populate('idColis') pour avoir l'adresse de destination
    const livraison = await Livraison.findById(req.params.id).populate('idColis');
    if (!livraison) return res.status(404).json({ error: 'Livraison introuvable' });

    const livreurId = req.user.id || req.user._id;
    if (livraison.idLivreur.toString() !== livreurId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    if (['livrée', 'annulée'].includes(livraison.statut)) {
      return res.status(400).json({ error: 'Cette livraison est déjà terminée' });
    }

    // 1. Mise à jour statut (Féminin pour livraison)
    livraison.statut = 'livrée';
    livraison.dateLivraison = new Date();
    await livraison.save();

    // 2. Mise à jour colis (Masculin pour colis)
    await Colis.findByIdAndUpdate(livraison.idColis._id, {
      status: 'livré',
      dateLivraison: livraison.dateLivraison
    });

    // 3. INSERTION GPS POUR FAIRE BOUGER LE CAMION
    const coords = await getRealCoordinates(livraison.idColis.destinataireAdresse);
    await PositionColis.create({
        latitude: coords.lat,
        longitude: coords.lng,
        libelleEtape: `Colis livré à : ${livraison.idColis.destinataireAdresse}`,
        statut: 'livré',
        idColis: livraison.idColis._id
    });

    res.json({ success: true, data: livraison });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marquer comme annulée pour livreur
exports.markLivraisonAnnulee = async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id);
    if (!livraison) return res.status(404).json({ error: 'Livraison introuvable' });

    // Vérifier que le livreur connecté est bien assigné
    const livreurId = req.user.id || req.user._id; // Support id et _id
    if (livraison.idLivreur.toString() !== livreurId) {
      return res.status(403).json({ error: 'Vous n’êtes pas assigné à cette livraison' });
    }

    if (['livrée', 'annulée'].includes(livraison.statut)) {
      return res.status(400).json({ error: 'Cette livraison est déjà terminée' });
    }

    livraison.statut = 'annulée';
    livraison.motifAnnulation = req.body.motif || 'Non spécifié';
    await livraison.save();

    // Mettre à jour le colis
    await Colis.findByIdAndUpdate(livraison.idColis, { status: 'annulé' });

    // Décrémenter le compteur de livraisons en cours du livreur
    
    await User.findByIdAndUpdate(livreurId, { $inc: { nombreLivraison: -1 } });

    res.json({ success: true, data: livraison });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLivreurStats = async (req, res) => {
  try {
    // Utiliser req.user.id (JWT) ou req.user._id (fallback)
    const idLivreur = req.user.id || req.user._id;

    const [total, enCours, livrees, annulees] = await Promise.all([
      Livraison.countDocuments({ idLivreur }),
      Livraison.countDocuments({ idLivreur, statut: { $in: ['en attente', 'en cours'] } }),
      Livraison.countDocuments({ idLivreur, statut: 'livrée' }),
      Livraison.countDocuments({ idLivreur, statut: 'annulée' })
    ]);

    res.json({
      success: true,
      stats: { total, enCours, livrees, annulees }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





