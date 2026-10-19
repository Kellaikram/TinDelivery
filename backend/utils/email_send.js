/**
 * Service d'envoi d'emails
 * Gère l'envoi des emails transactionnels pour TinDelivery
 */

const logger = {
  info: (msg) => console.log(`📧 [EMAIL] ${msg}`),
  error: (msg) => console.error(`❌ [EMAIL ERROR] ${msg}`),
  success: (msg) => console.log(`✅ [EMAIL SUCCESS] ${msg}`),
};

/**
 * Construit le template HTML pour l'email de bienvenue
 * @param {Object} data - Les données du livreur
 * @param {string} data.nomComplet - Nom complet du livreur
 * @param {string} data.email - Email du livreur
 * @param {string} data.plainPassword - Mot de passe temporaire
 * @returns {string} HTML du template
 */
const buildWelcomeEmailHTML = ({ nomComplet, email, plainPassword }) => {
  if (!nomComplet || !email || !plainPassword) {
    throw new Error('Paramètres manquants pour construire l\'email');
  }

  const loginUrl = process.env.LIVREUR_LOGIN_URL ?? 'https://app.tindelivery.com/login';
  const year = new Date().getFullYear();
  const brandColor = '#2563eb';
  const brandColorLight = '#3b82f6';
  const warningBg = '#fff7ed';
  const warningBorder = '#fed7aa';
  const warningText = '#9a3412';
  const textDark = '#111827';
  const textGray = '#6b7280';
  const lightGray = '#f9fafb';
  const borderGray = '#e5e7eb';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Bienvenue chez TinDelivery</title>
      <style>
        body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { width: 100%; padding: 40px 0; }
        .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, ${brandColor}, ${brandColorLight}); padding: 40px 30px; text-align: center; }
        .header-emoji { font-size: 40px; }
        .header-title { color: #fff; margin: 15px 0 0; font-size: 26px; font-weight: 700; }
        .header-subtitle { color: #dbeafe; margin: 8px 0 0; font-size: 14px; font-weight: 500; }
        .body { padding: 35px 30px; }
        .greeting { font-size: 16px; color: ${textDark}; margin: 0 0 12px; font-weight: 600; }
        .text { font-size: 15px; color: ${textGray}; line-height: 1.6; margin: 0 0 20px; }
        .credentials-box { margin: 25px 0; border: 1px solid ${borderGray}; border-radius: 10px; background: ${lightGray}; overflow: hidden; }
        .credentials-item { padding: 18px 20px; border-bottom: 1px solid ${borderGray}; }
        .credentials-item:last-child { border-bottom: none; }
        .credentials-label { font-size: 11px; color: ${textGray}; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 6px; }
        .credentials-value { font-size: 16px; font-weight: 700; color: ${textDark}; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 1px; }
        .cta-container { text-align: center; margin: 30px 0; }
        .cta-button { background: ${brandColor}; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px; transition: background 0.2s; }
        .cta-button:hover { background: ${brandColorLight}; }
        .warning-box { background: ${warningBg}; border: 1px solid ${warningBorder}; padding: 15px; border-radius: 8px; font-size: 13px; color: ${warningText}; margin: 20px 0 0; }
        .warning-icon { margin-right: 6px; }
        .footer { background: ${lightGray}; padding: 25px; text-align: center; font-size: 12px; color: ${textGray}; border-top: 1px solid ${borderGray}; }
        .footer-text { margin: 0; }
        .footer-link { color: ${brandColor}; text-decoration: none; font-weight: 600; }
        @media (max-width: 600px) {
          .email-wrapper { border-radius: 0; }
          .body { padding: 25px 20px; }
          .header { padding: 30px 20px; }
          .header-title { font-size: 22px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center">
            <div class="email-wrapper">
              <!-- HEADER -->
              <div class="header">
                <h1 class="header-title">Bienvenue ${nomComplet} 👋</h1>
                <p class="header-subtitle">Votre compte livreur TinDelivery est prêt à être utilisé</p>
              </div>

              <!-- BODY -->
              <div class="body">
                
                <p class="text">
                  Votre compte livreur a été créé avec succès. Vous trouverez ci-dessous vos informations de connexion personnelles pour accéder à votre espace de gestion des livraisons.
                </p>

                <!-- CREDENTIALS BOX -->
                <div class="credentials-box">
                  <div class="credentials-item">
                    <p class="credentials-label">Email</p>
                    <p class="credentials-value">${email}</p>
                  </div>
                  <div class="credentials-item">
                    <p class="credentials-label">Mot de passe temporaire</p>
                    <p class="credentials-value">${plainPassword}</p>
                  </div>
                </div>

                <p class="text">
                  <strong>Étapes suivantes :</strong><br>
                  1️⃣ Connectez-vous avec les identifiants ci-dessus<br>
                  2️⃣ Changez immédiatement votre mot de passe<br>
                  3️⃣ Complétez votre profil livreur<br>
                  4️⃣ Commencez à accepter des livraisons
                </p>

                <!-- CTA BUTTON -->
                <div class="cta-container">
                  <a href="${loginUrl}" class="cta-button">Se connecter à mon espace →</a>
                </div>

                <!-- SECURITY WARNING -->
                <div class="warning-box">
                  <span class="warning-icon">🔒</span>
                  <strong>Sécurité importante :</strong> Changez votre mot de passe dès votre première connexion. Ne le partagez jamais avec quelqu'un d'autre. TinDelivery ne vous demandera jamais vos identifiants par email.
                </div>
              </div>

              <!-- FOOTER -->
              <div class="footer">
                <p class="footer-text">© ${year} TinDelivery. Tous droits réservés.</p>
                <p class="footer-text" style="margin-top: 8px;">
                  Des questions ? <a href="oussamaboulmani22@gmail.com" class="footer-link">Contactez notre support</a>
                </p>
              </div>
            </div>
          </td></tr>
        </table>
      </div>
    </body>
    </html>
  `;
};

/**
 * Envoie un email de bienvenue au livreur
 * Opération asynchrone non-bloquante (fire-and-forget)
 * 
 * @param {Object} transporter - Instance Nodemailer configurée
 * @param {Object} data - Données du livreur
 * @param {string} data.nomComplet - Nom complet
 * @param {string} data.email - Adresse email
 * @param {string} data.plainPassword - Mot de passe temporaire
 * @returns {Promise<void>}
 */
const sendWelcomeEmailAsync = async (transporter, { nomComplet, email, plainPassword }) => {
  try {
    // Validation des paramètres
    if (!transporter) {
      throw new Error('Transporter email non configuré');
    }
    if (!nomComplet || !email || !plainPassword) {
      throw new Error('Données de livreur incomplètes');
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Format email invalide: ${email}`);
    }

    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    
    logger.info(`Tentative d'envoi vers ${email}...`);

    const mailOptions = {
      from: `"TinDelivery" <${emailFrom}>`,
      to: email,
      subject: 'Bienvenue chez TinDelivery – Vos identifiants de connexion',
      html: buildWelcomeEmailHTML({ nomComplet, email, plainPassword }),
      text: generatePlainTextEmail({ nomComplet, email, plainPassword }),
      replyTo: 'support@tindelivery.com',
    };

    // Envoi sans await (fire-and-forget)
    transporter.sendMail(mailOptions)
      .then(() => {
        logger.success(`Email envoyé au livreur ${nomComplet} (${email})`);
      })
      .catch((error) => {
        logger.error(`Échec d'envoi pour ${email}: ${error.message}`);
        if (error.response) {
          logger.error(`Réponse du serveur: ${error.response}`);
        }
      });

  } catch (error) {
    logger.error(`Erreur lors de la préparation de l'email: ${error.message}`);
  }
};

/**
 * Génère la version texte brut de l'email
 * @param {Object} data - Données du livreur
 * @returns {string} Texte brut de l'email
 */
const generatePlainTextEmail = ({ nomComplet, email, plainPassword }) => {
  const loginUrl = process.env.LIVREUR_LOGIN_URL ?? 'https://app.tindelivery.com/login';
  const year = new Date().getFullYear();

  return `
Bienvenue ${nomComplet} 

Votre compte TinDelivery est prêt à être utilisé.

Vos informations de connexion:

Email: ${email}
Mot de passe temporaire: ${plainPassword}

Connectez-vous ici: ${loginUrl}

Étapes suivantes:
1. Connectez-vous avec les identifiants ci-dessus
2. Changez immédiatement votre mot de passe
3. Complétez votre profil livreur
4. Commencez à accepter des livraisons

⚠️ SÉCURITÉ: Changez votre mot de passe dès votre première connexion.
Ne partagez jamais vos identifiants.

---
© ${year} TinDelivery. Tous droits réservés.
Support: support@tindelivery.com
  `.trim();
};

module.exports = { 
  sendWelcomeEmailAsync,
  buildWelcomeEmailHTML,
  generatePlainTextEmail,
};
