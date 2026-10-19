/**
 * Configuration du service email avec Nodemailer
 * Utilise les variables d'environnement pour la configuration SMTP
 */

const nodemailer = require('nodemailer');

// Validation des variables d'environnement requises
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  [EMAIL CONFIG] Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
  console.warn('⚠️  [EMAIL CONFIG] Les emails ne seront pas envoyés correctement.');
}

/**
 * Créer le transport email avec les paramètres SMTP
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true' ? true : false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: process.env.NODE_ENV === 'development' ? true : false,
  debug: process.env.NODE_ENV === 'development' ? true : false,
});

/**
 * Vérifier la connexion au serveur SMTP
 * Cette vérification est non-bloquante
 */
transporter.verify()
  .then(() => {
    console.log('✅ [EMAIL CONFIG] Configuration email validée. Prêt à envoyer des emails.');
  })
  .catch((err) => {
    console.error('❌ [EMAIL CONFIG] Erreur de configuration email:', err.message);
    console.error('❌ [EMAIL CONFIG] Vérifiez vos variables d\'environnement EMAIL_*');
  });

module.exports = transporter;