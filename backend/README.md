# TinDelivery - API Backend

API REST pour la gestion des livraisons de TinDelivery. Système de gestion des livreurs avec authentification par email.

## 📋 Fonctionnalités

- ✅ Création de comptes livreurs
- ✅ Génération de mots de passe sécurisés
- ✅ Envoi d'emails de bienvenue avec identifiants
- ✅ Liste des livreurs
- ✅ Gestion MongoDB des utilisateurs
- ✅ CORS activé pour le frontend

## 🚀 Installation

### Prérequis

- Node.js 14+
- MongoDB
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet**

   ```bash
   git clone <url-du-repo>
   cd backend
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Créer un fichier `.env` à la racine du backend:

   ```env
   # Base de données
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database

   # Serveur
   PORT=5000
   NODE_ENV=development

   # Configuration Email (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=votre_email@gmail.com
   EMAIL_PASS=votre_mot_de_passe_app
   EMAIL_FROM=votre_email@gmail.com

   # Frontend URL
   LIVREUR_LOGIN_URL=https://localhost:5173/login
   ```

   ⚠️ **Important pour Gmail**: 
   - Activer l'authentification 2FA
   - Générer un [mot de passe d'application](https://myaccount.google.com/apppasswords)
   - Utiliser ce mot de passe dans `EMAIL_PASS`

4. **Démarrer le serveur**

   ```bash
   npm run dev
   ```

## 📚 API ENDPOINTS

### Livreurs

#### Créer un nouveau livreur
```http
POST /api/livreurs
Content-Type: application/json

{
  "nomComplet": "Nom du Livreur",
  "email": "livreur@email.com",
  "telephone": "+212612345678",
  "adresse": "123 rue de Test, Ville"
}
```

**Réponse (201)**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "nomComplet": "Nom du Livreur",
    "email": "livreur@email.com",
    "role": "livreur",
    "status": "actif",
    "disponibilite": true,
    "nombreLivraison": 0
  },
  "message": "Livreur créé avec succès. Un email avec les identifiants a été envoyé."
}
```

#### Lister tous les livreurs
```http
GET /api/livreurs
```

**Réponse (200)**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "nomComplet": "Livreur 1",
      "email": "livreur1@email.com",
      "role": "livreur",
      "status": "actif"
    }
  ]
}
```

### Health Check

```http
GET /health
```

**Réponse (200)**:
```json
{
  "status": "OK",
  "timestamp": "2024-04-26T10:30:00.000Z"
}
```

## 🔐 Sécurité

- Les mots de passe sont hachés avec bcrypt
- Les mots de passe ne sont jamais retournés dans les réponses API
- Les emails sont validés au format
- Les doublons d'email sont gérés

## 📧 Système d'Email

Le système envoie automatiquement un email de bienvenue quand un livreur est créé:
- Template HTML professionnel et responsive
- Contient les identifiants de connexion
- Lien direct vers l'espace de connexion
- Message de sécurité

## 🛠️ Stack Technologique

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: bcrypt
- **Email**: Nodemailer
- **Env**: dotenv
- **CORS**: cors

## 📦 Dépendances

```json
{
  "express": "^4.x",
  "mongoose": "^7.x",
  "bcrypt": "^5.x",
  "nodemailer": "^6.x",
  "dotenv": "^16.x",
  "cors": "^2.x"
}
```

## 🧪 Structure du Projet

```
backend/
├── config/
│   ├── db.js              # Configuration MongoDB
│   └── email.js           # Configuration Nodemailer
├── controllers/
│   └── livreurController.js  # Logique des endpoints
├── models/
│   └── User.js            # Schéma Mongoose User
├── routes/
│   └── livreurRoutes.js   # Routes de l'API
├── utils/
│   └── email_send.js      # Service d'envoi d'emails
├── .env                   # Variables d'environnement
├── server.js              # Point d'entrée
└── package.json
```

## 🐛 Troubleshooting

### Les emails ne s'envoient pas

1. Vérifier que les variables `EMAIL_*` sont correctement configurées dans `.env`
2. Pour Gmail: vérifier que 2FA est activé et le mot de passe d'application est utilisé
3. Consulter les logs du serveur (`npm run dev`)

### Erreur de connexion MongoDB

1. Vérifier que `MONGO_URL` est correct dans `.env`
2. V

érifier la connectivité réseau
3. Vérifier que MongoDB accepte les connexions

### Port déjà utilisé

Changer le port dans `.env`:
```env
PORT=5001
```

## 📝 License

Projet privé TinDelivery

## 👥 Contributeurs

- Boulmani Oussama

## 📞 Support

Email: support@tindelivery.com
