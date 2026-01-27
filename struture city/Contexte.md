Contexte et justification La digitalisation de la restauration est devenue essentielle pour
améliorer la gestion des commandes, la communication avec les clients et le suivi des ventes.
Les restaurateurs ont besoin d’une solution web complète pour gérer leurs repas, commandes et
promotions, tandis que les clients finaux attendent une interface mobile fluide et ergonomique
pour passer des commandes et suivre leur livraison. Ce projet vise à créer une solution web pour
les restaurants et administrateurs, tout en exploitant le SDK CityMate pour générer
automatiquement le rendu mobile destiné aux utilisateurs finaux

En repartant de tes objectifs et de la portée du projet, je te propose une **structure complète et cohérente de la solution web Admin/Restaurateurs**, orientée “design d’interface” (ce que l’utilisateur voit et fait).

Je reste dans le cadre :  
- l’ensemble du projet = Web Admin + Backend + SDK mobile  
- ta réalisation principale = **le tableau de bord (et plus largement l’UI Admin)**  

---

## 1. Rappel des objectifs et impact sur le design

Objectifs du projet (vus côté interface web) :

1. **Solution web complète pour admins et restaurateurs**  
   → Nécessite une interface structurée en modules : Restaurants, Menus/Repas, Commandes, Utilisateurs, Promotions, Tableau de bord.

2. **Backend sécurisé et centralisé**  
   → L’UI doit gérer la connexion, les rôles, les permissions, et appeler une API sécurisée.

3. **Utilisation du SDK CityMate pour le rendu mobile**  
   → L’UI admin gère les données (menus, promos, etc.) qui sont ensuite exploitées par le mobile. Certaines pages de configuration auront un impact direct sur ce que voit l’utilisateur final.

4. **Sécurité des données, rôles/permissions, notifications**  
   → Nécessite une page de gestion des utilisateurs/rôles + une gestion des notifications (au minimum consultation / configuration simple).

---

## 2. Structure globale de l’interface Admin

Imagine une application web avec :

- **Une barre latérale (sidebar)** pour les sections principales  
- **Un header** en haut avec :
  - le nom de l’utilisateur connecté
  - un sélecteur de restaurant / application (si multi-restaurants)
  - éventuellement un filtre de période global (pour les stats)

### 2.1. Menu principal (sidebar)

Proposition de menu aligné sur la portée du projet :

1. **Tableau de bord**
2. **Restaurants**
3. **Menus & Repas**
4. **Commandes**
5. **Utilisateurs / Clients**
6. **Promotions & Offres**
7. **Notifications**
8. **Paramètres & Sécurité**

Selon le rôle :
- un **Admin global** voit toutes les sections  
- un **Restaurateur** voit surtout : Tableau de bord, Menus & Repas, Commandes, Promotions, éventuellement une partie simplifiée des Utilisateurs.

---

## 3. Design détaillé par module

### 3.1. Tableau de bord (Dashboard)

**Objectif** : donner une vue d’ensemble rapide de l’activité.

**Éléments d’interface :**

- Zone de **filtres** (en haut) :
  - Période : Aujourd’hui / 7 jours / 30 jours / Personnalisée
  - Sélecteur de restaurant (si l’admin gère plusieurs)
- **Cartes KPI** :
  - Nombre total de commandes
  - Chiffre d’affaires total
  - Panier moyen
  - Nombre de clients uniques
- **Graphiques** :
  - CA dans le temps (courbe ou barres)
  - Répartition des commandes par statut (camembert)
- **Listes** :
  - Top 5 des plats les plus vendus
  - 10 dernières commandes (avec statut)

→ C’est ton module principal de travail en React.

---
### 3.2. Restaurants

**Objectif** : gérer les entités “Restaurant” que le backend expose aux mobiles.

**Écrans :**

1. **Liste des restaurants**
   - Tableau avec : Nom, Adresse, Téléphone, Statut (actif/inactif)
   - Bouton “Créer un restaurant”
   - Boutons “Modifier” / “Supprimer” par ligne

2. **Formulaire de création / modification**
   - Champs : Nom, Adresse, Ville, Pays, Téléphone, Email, Horaires, Logo (URL ou upload)
   - Bouton Enregistrer / Annuler

Ce module est surtout utile pour l’admin global.


---

### 3.3. Menus & Repas

**Objectif** : gérer les catégories (Entrées, Plats, Desserts…) et les repas (avec leurs prix).

**Design recommandé en 2 colonnes :**

- **Colonne gauche : Catégories de repas**
  - Liste de catégories pour le restaurant choisi :
    - Nom : Entrées, Plats, Desserts, Boissons, etc.
    - Boutons : Modifier / Supprimer
  - En dessous : Formulaire
    - Nom, Description (optionnelle), Ordre d’affichage, Actif/Oui/Non
    - Bouton Ajouter / Enregistrer

- **Colonne droite : Repas de la catégorie sélectionnée**
  - Tableau des plats :
    - Nom du plat
    - Catégorie (déduite)
    - Prix
    - Disponible (Oui/Non)
    - Actions : Modifier / Supprimer
  - Formulaire de plat :
    - Nom
    - Description
    - Prix
    - Disponible (case à cocher)
    - (Optionnel : URL image)
    - Bouton Ajouter / Enregistrer

**Lien avec le mobile :**
- Les catégories + repas définis ici sont ceux que le SDK CityMate affichera sur les applis mobiles.

---

### 3.4. Commandes

**Objectif** : suivre les commandes en temps réel et consulter l’historique.

**Écrans :**

1. **Liste des commandes**
   - Filtre par :
     - Période
     - Statut (En attente, En préparation, En livraison, Livrée, Annulée)
     - Source (Mobile/Web)
   - Tableau avec :
     - N° commande
     - Client
     - Montant
     - Statut
     - Date / heure
     - Actions : Voir détails

2. **Détail d’une commande**
   - Informations client
   - Liste des plats commandés (nom, quantité, prix)
   - Montant total
   - Statut avec possibilité de mise à jour (pour le restaurateur, si prévu)

---

### 3.5. Utilisateurs / Clients

**Objectif** : gérer les comptes utilisateurs et voir les clients.

**Deux sous-parties possibles :**

1. **Utilisateurs (internes)**  
   - Admins, restaurateurs, livreurs, etc.
   - Tableau : Nom, Email, Rôle, Restaurant associé
   - Formulaire pour créer/modifier un utilisateur + choix du rôle
   - Lien avec la sécurité (rôles / permissions)

2. **Clients (finaux)**
   - Liste des clients (nom, email, téléphone)
   - Nombre de commandes par client
   - Historique simplifié

---

### 3.6. Promotions & Offres

**Objectif** : gérer les promotions affichées sur mobile.

**Écrans :**

1. **Liste des promotions**
   - Titre
   - Date de début / fin
   - Statut (active / expirée / programmée)
   - Actions : Modifier / Supprimer

2. **Formulaire de promotion**
   - Titre
   - Description
   - Dates de début et de fin
   - (Optionnel : image, type de réduction, code promo)
   - Bouton Activer / Désactiver

**Lien avec le mobile :**
- Ces promotions sont récupérées par le SDK CityMate et affichées dans l’appli (bannière, liste d’offres…).

---

### 3.7. Notifications

**Objectif** : gérer/configurer les notifications pour utilisateurs et restaurateurs.

**Écrans simples :**

- **Paramètres de notifications**
  - Cases à cocher :
    - Notifier le client à la création de commande (email/push)
    - Notifier à la préparation / livraison
    - Alerte pour le restaurateur en cas de nouvelle commande
  - (Optionnel : modèle de message simple)

- **Journal des notifications (optionnel)**
  - Liste des derniers envois pour debug / suivi.

---

### 3.8. Paramètres & Sécurité

**Objectif** : centraliser les réglages globaux.

**Sous-sections possibles :**

1. **Profil utilisateur**
   - Nom, email, mot de passe

2. **Rôles & permissions** (si exposé côté UI)
   - Liste des rôles (Admin, Restaurateur, Livreur, etc.)
   - Droits par rôle (lecture/écriture sur modules)

3. **Configuration technique basique**
   - Fuseau horaire
   - Langue
   - (Optionnel) Paramètres d’intégration (paiement, etc.)

---

## 4. Vue d’ensemble du “design complet”

En résumé, l’interface web Admin/Restaurateurs est organisée ainsi :

- **Layout commun** :
  - Sidebar avec les modules : Tableau de bord, Restaurants, Menus & Repas, Commandes, Utilisateurs, Promotions, Notifications, Paramètres.
  - Header avec : utilisateur connecté, sélecteur de restaurant, filtre de période (pour stats), éventuellement notifications.

- **Pattern d’interface récurrent** :
  - Page =  
    - Barre de titre + filtres  
    - Tableau de liste (Restaurants / Commandes / Menus / Promotions / Utilisateurs…)  
    - Formulaire de création/modification (affiché à droite, en bas ou dans une modale)

- **Lien constant avec le mobile** :
  - Menus & Repas → ce que voient les clients dans l’appli  
  - Promotions & Offres → bannières/offres dans l’appli  
  - Paramètres/Restaurants → configuration de l’appli (via backend + SDK)  
