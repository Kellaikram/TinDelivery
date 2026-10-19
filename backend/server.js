/**
 * Serveur backend TinDelivery - VERSION NETTOYÉE
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const colisRoutes = require('./routes/colisRoutes');
const livraisonRoutes = require('./routes/livraisonRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Configuration DNS (optionnel)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());

// ============ ROUTES DE TEST ============
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 API TinDelivery fonctionne correctement.',
    version: '1.0.0'
  });
});

// ============ API ROUTES ============
// On importe et on utilise les routes une seule fois
const livreurRoutes = require('./routes/livreurRoutes');


// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/colis', colisRoutes);
app.use('/api/livreurs', livreurRoutes);
app.use('/api/livraisons', livraisonRoutes);



// ============ GESTION DES ERREURS 404 ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    path: req.path,
  });
});

// ============ FONCTION DE DÉMARRAGE ============
const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDB();

    // Démarrage du serveur
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Serveur en cours d'exécution sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur :', error.message);
    process.exit(1);
  }
};

// ON APPELLE LA FONCTION UNE SEULE FOIS
startServer();