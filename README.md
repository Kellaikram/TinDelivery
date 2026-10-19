# 📦 TinDelivery - Système de Gestion de Livraison Logistique

**TinDelivery** est une plateforme web complète de gestion de livraison conçue pour fluidifier les opérations logistiques entre les administrateurs, les livreurs et les clients finaux. Le système assure un suivi en temps réel et une gestion centralisée des colis.

---

## ✨ Fonctionnalités Principales (Features)

L'application est divisée en trois espaces distincts selon le rôle de l'utilisateur :

### 👨‍💻 Espace Administrateur
- **Gestion des Livraisons & Colis :** Création (CRUD), génération automatique de codes de suivi, et assignation des colis aux livreurs disponibles.
- **Gestion des Livreurs :** Ajout, modification, suppression et suivi de la charge de travail (disponibilité automatique).
- **Tableau de bord (Dashboard) :** Visualisation des statistiques globales, taux de réussite, et filtrage des opérations logistiques en temps réel.

### 🛵 Espace Livreur
- **Tableau de bord personnel :** Visualisation des colis affectés sous forme de cartes interactives.
- **Mise à jour des statuts :** Changement de l'état de la livraison ("En cours", "Livré", "Annulé").
- **Gestion de profil :** Modification des informations personnelles et du mot de passe.

### 👤 Espace Client (Public)
- **Suivi en temps réel :** Saisie du code de suivi reçu par email pour localiser le colis.
- **Carte Interactive :** Visualisation de la position actuelle du colis et de l'historique d'acheminement sur une carte géographique (Leaflet).

### 🔒 Sécurité & Notifications (Système)
- Authentification multi-rôles sécurisée avec **JWT**.
- Envoi automatique d'emails (Bienvenue, Code de suivi) via **Nodemailer**.

---

## 🛠️ Technologies Utilisées (Tech Stack)

Ce projet adopte une architecture client-serveur (MERN Stack adapté) :

**Frontend :**
- React.js / HTML CSS (Interfaces UI/UX responsives)
- Leaflet (Cartographie interactive pour le suivi)

**Backend :**
- Node.js & Express.js (API RESTful)
- Middleware JWT (Sécurisation des accès)
- Nodemailer (Service SMTP pour les emails)

**Base de Données :**
- MongoDB avec Mongoose ODM

**Gestion de Projet & Outils :**
- Agile Scrum (3 Sprints)
- Jira (Suivi des tickets), MS Project (Gantt)
- GitHub (Versionnement)

---

## 🚀 Installation & Exécution (Localement)

Pour lancer le projet sur votre machine locale, suivez ces étapes :

### 1. Prérequis
- [Node.js](https://nodejs.org/) installé.
- Une instance [MongoDB](https://www.mongodb.com/) (locale ou Atlas) active.

### 2. Cloner le projet
```bash
git clone https://github.com/votre-username/TinDelivery.git
cd TinDelivery