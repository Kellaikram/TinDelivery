# Corrections JWT - Documentation

## 🔧 Problèmes identifiés et corrigés

### 1. **JWT_SECRET manquant** ❌ → ✅
- **Problème**: Le fichier `.env` ne contenait pas de `JWT_SECRET`
- **Solution**: Ajout de `JWT_SECRET` et `JWT_EXPIRE` au `.env`
- **Fichier**: `.env`

### 2. **Middleware auth.js inadéquat** ❌ → ✅
- **Problèmes**:
  - Gestion d'erreurs minimale
  - Pas de vérification du format du header
  - Messages d'erreur peu clairs
- **Solution**: Refactorisation complète avec:
  - Vérification stricte du header `Authorization`
  - Gestion des erreurs JWT spécifiques (TokenExpiredError, JsonWebTokenError)
  - Messages d'erreur détaillés et expliquant le problème
  - Format attendu clair: `Bearer <token>`
- **Fichier**: `middleware/auth.js`

### 3. **Routes d'authentification absentes** ❌ → ✅
- **Problème**: Pas de route `/api/auth/login` pour générer les tokens
- **Solution**: Création de `routes/authRoutes.js` avec:
  - `POST /api/auth/login` - Connexion utilisateur
  - `POST /api/auth/refresh-token` - Renouvellement de token
  - `POST /api/auth/logout` - Déconnexion
  - `GET /api/auth/me` - Récupérer infos utilisateur connecté
- **Fichier**: `routes/authRoutes.js`

### 4. **Contrôleur d'authentification manquant** ❌ → ✅
- **Problème**: Pas de logique pour générer et vérifier les tokens
- **Solution**: Création de `controllers/authController.js` avec:
  - Fonction `login()` - Authentification avec email/mot de passe
  - Fonction `generateToken()` - Génération JWT
  - Fonction `refreshToken()` - Renouvellement du token
  - Fonction `logout()` - Déconnexion propre
  - Fonction `getCurrentUser()` - Récupérer l'utilisateur connecté
  - Validation et gestion des erreurs complètes
- **Fichier**: `controllers/authController.js`

### 5. **Routes non intégrées au serveur** ❌ → ✅
- **Problème**: Les routes d'authentification n'étaient pas ajoutées à `server.js`
- **Solution**: Intégration de `authRoutes` dans `server.js`
- **Fichier**: `server.js`

### 6. **Middlewares de rôles améliorés** ✅
- **Améliorations**:
  - Vérification de `req.user` avant d'accéder à `req.user.role`
  - Messages d'erreur détaillés
  - Statut HTTP cohérents
  - Format de réponse standardisé
- **Fichiers**: 
  - `middleware/isAdmin.js`
  - `middleware/isLivreur.js`

---

## 📋 Flux d'authentification complet

### 1. **Connexion utilisateur** (Public)
```
POST /api/auth/login
Body: { email, motDePasse }
Response: { token, user }
```

### 2. **Stockage du token** (Frontend)
Le token reçu doit être stocké dans:
- `localStorage` (si persistent = plus facile)
- `sessionStorage` (si session only)
- Cookie sécurisé (recommandé en production, httpOnly)

### 3. **Utilisation du token** (dans les requêtes)
```
Authorization: Bearer <token>
```

### 4. **Renouvellement du token** (Optional)
```
POST /api/auth/refresh-token
Headers: { Authorization: Bearer <token> }
Response: { token: <new_token> }
```

### 5. **Vérification du token** (Middleware)
- Le middleware `auth.js` vérifie à chaque requête
- Décode le JWT et met à jour `req.user`
- Retourne une erreur 401 si invalide/expiré

---

## 🔐 Sécurité - Points importants

1. **JWT_SECRET**: 
   - ⚠️ Changez la valeur par défaut en production
   - Utilisez une clé longue et aléatoire (minimum 32 caractères)

2. **Token Expiration**:
   - Par défaut: 7 jours (`JWT_EXPIRE=7d`)
   - À adapter selon vos besoins

3. **Mot de passe**:
   - Hashé avec bcrypt (déjà configuré dans User.js)
   - Jamais retourné dans les réponses (sauf login)

4. **Headers CORS**:
   - Vérifiez la configuration CORS en production
   - Résolutionnez le domaine du frontend

---

## 🧪 Exemple d'utilisation avec Axios (Frontend)

```javascript
// 1. Connexion
const response = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  motDePasse: 'password123'
});

const token = response.data.token;
localStorage.setItem('token', token);

// 2. Utiliser le token dans les requêtes
const config = {
  headers: { Authorization: `Bearer ${token}` }
};

// 3. Appels protégés
const user = await axios.get('/api/auth/me', config);
const colis = await axios.get('/api/colis', config);

// 4. Renouveler le token
const newResponse = await axios.post('/api/auth/refresh-token', {}, config);
localStorage.setItem('token', newResponse.data.token);
```

---

## 📝 Variables d'environnement à configurer

```env
JWT_SECRET=votre_clé_secrète_très_longue_et_aléatoire_ici
JWT_EXPIRE=7d
NODE_ENV=development  # development ou production
```

---

## ✅ Checklist de vérification

- [ ] JWT_SECRET est configuré dans `.env`
- [ ] File `authRoutes.js` est créé
- [ ] File `authController.js` est créé
- [ ] Middleware `auth.js` est mis à jour
- [ ] Middlewares de rôles (`isAdmin.js`, `isLivreur.js`) sont améliorés
- [ ] Routes d'auth sont intégrées dans `server.js`
- [ ] Les routes protégées utilisent le middleware `auth`
- [ ] Les routes admin utilisent le middleware `auth` + `isAdmin`
- [ ] Les routes livreur utilisent le middleware `auth` + `isLivreur`

---

## 🚀 Prochaines étapes

1. **Protéger les routes existantes** avec le middleware `auth`:
   ```javascript
   router.get('/', auth, getAllColis);  // Pour les admins
   router.post('/', auth, isAdmin, createColis);
   ```

2. **Tester la flow complète** d'authentification

3. **Ajouter le token au axios du frontend** pour les requêtes automatiques

4. **Implémenter le logout côté frontend** (supprimer le token du localStorage)

---
