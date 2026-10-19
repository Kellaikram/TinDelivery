const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URL = process.env.MONGO_URL;
    if (!MONGO_URL) {
      console.error("❌ Erreur: MONGO_URL n'est pas défini dans le fichier .env");
      process.exit(1);
    }

    const conn = await mongoose.connect(MONGO_URL);
    console.log(`✅ Connexion à MongoDB réussie : ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à MongoDB :', error.message);
    process.exit(1); // Arrêter l'application si la connexion échoue
  }
};

module.exports = connectDB;