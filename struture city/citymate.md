..Voici une **nouvelle structure complète**, cohérente avec tes objectifs et la portée du projet, centrée sur la **solution web Admin/Restaurateur** (celle que tu conçois / développes).

Je sépare en 3 parties :
1. Structure fonctionnelle (modules et pages de l’interface web)  
2. Structure technique du frontend React (dossiers/fichiers)  
3. Structure des principales API backend (pour montrer comment tout se connecte)

---

## 1. Structure fonctionnelle de l’application web Admin

Cette structure couvre tous les points de ta portée :

- Gestion des restaurants  
- Gestion des menus et repas (ajout, modification, suppression, catégorisation)  
- Gestion des commandes et suivi en temps réel  
- Gestion des utilisateurs / clients  
- Gestion des promotions et offres  
- Tableau de bord pour statistiques et rapports  

### 1.1. Pages principales (menu latéral)

1. **Tableau de bord**
2. **Restaurants**
3. **Menus & Repas**
4. **Commandes**
5. **Utilisateurs / Clients**
6. **Promotions & Offres**
7. **Notifications** (simple config)
8. **Paramètres & Sécurité**

---

### 1.2. Détail par page

#### 1) Tableau de bord

- Filtres :
  - Période (Aujourd’hui / 7 jours / 30 jours / personnalisé)
  - Restaurant (si l’admin en gère plusieurs)
- Indicateurs (KPI) :
  - Nombre total de commandes
  - Chiffre d’affaires
  - Panier moyen
  - Nombre de clients uniques
- Graphiques :
  - CA dans le temps
  - Répartition des commandes par statut
- Listes :
  - Top 5 des plats les plus vendus
  - 10 dernières commandes

→ Couvre la partie « Tableau de bord pour statistiques et rapports ».

---

#### 2) Restaurants

- Liste des restaurants :
  - Nom, adresse, téléphone, email, statut (actif/inactif)
  - Actions : Modifier / Supprimer
- Formulaire de création / édition :
  - Nom
  - Adresse / ville / pays
  - Contact (téléphone, email)
  - Horaires d’ouverture
  - Logo (URL / upload)
  - Bouton Enregistrer

→ Couvre « Gestion des restaurants (création, modification, suppression) ».

---

#### 3) Menus & Repas

Page en 2 colonnes :

**Colonne gauche – Catégories de repas**

- Liste des catégories :
  - Nom : Entrées, Plats, Desserts, Boissons, etc.
  - Description
  - Actif / Inactif
  - Actions : Modifier / Supprimer
- Formulaire Catégorie :
  - Nom (ex. « Desserts »)
  - Description
  - Ordre d’affichage
  - Actif (oui/non)
  - Bouton Ajouter / Enregistrer

**Colonne droite – Repas / Plats**

- Tableau des plats pour la catégorie sélectionnée :
  - Nom du plat
  - Prix
  - Disponible (oui/non)
  - Actions : Modifier / Supprimer
- Formulaire Plat :
  - Nom
  - Description
  - Catégorie (pré‑remplie par la sélection)
  - Prix
  - Disponible (case à cocher)
  - (Optionnel : Image)
  - Bouton Ajouter / Enregistrer

→ Couvre « Gestion des menus et repas (ajout, modification, suppression, catégorisation) ».

---

#### 4) Commandes

- Filtres :
  - Période
  - Statut (en attente, en préparation, livrée, annulée…)
  - Restaurant (si multi‑restaurants)
- Liste des commandes :
  - N° commande
  - Client
  - Montant
  - Statut
  - Date / heure
  - Source (mobile / web)
  - Action : Voir détail
- Détail d’une commande :
  - Infos client
  - Liste des plats, quantités, prix
  - Montant total
  - Statut (avec possibilité de le mettre à jour)

→ Couvre « Gestion des commandes et suivi en temps réel ».

---

#### 5) Utilisateurs / Clients

Deux onglets possibles :

- **Utilisateurs (internes)** :
  - Liste : admin, restaurateur, livreur, etc.
  - Champs : nom, email, rôle, restaurant associé
  - Formulaire création/modif
  - Gestion basique des rôles (admin vs restaurateur)

- **Clients (finaux)** :
  - Liste des clients
  - Nombre de commandes par client
  - Dernière commande

→ Couvre « Gestion des utilisateurs / clients et de leurs informations » + début « rôles & permissions ».

---

#### 6) Promotions & Offres

- Liste des promotions :
  - Titre
  - Date de début / fin
  - Statut (active, programmée, expirée)
  - Actions : Modifier / Supprimer
- Formulaire :
  - Titre
  - Description
  - Date début / fin
  - (Optionnel : code promo, type de réduction, image)
  - Bouton Enregistrer

→ Couvre « Gestion des promotions et offres spéciales ».

---

#### 7) Notifications

- Réglages simples :
  - Activer notification client à la création de commande
  - Activer notification client au changement de statut
  - Activer notification restaurateur à chaque nouvelle commande
- Type de canal (juste indicatif dans l’UI) : email / push

→ Couvre « système de notifications pour les utilisateurs et restaurateurs ».

---

#### 8) Paramètres & Sécurité

- Profil utilisateur (admin/restaurateur) :
  - Nom, email, mot de passe
- (Optionnel) Rôles & permissions :
  - Liste des rôles
  - Description des droits (lecture/écriture par module)

→ Couvre le point « sécurité des données, gestion des rôles & permissions » côté UI.

---

## 2. Nouvelle structure technique du frontend React

Une structure de projet React correspondant à ces modules :

```text
project-root/
└─ src/
   ├─ index.js
   ├─ App.js
   ├─ routes/
   │   └─ AppRouter.jsx          // Routes : /dashboard, /restaurants, /menus, etc.
   ├─ layout/
   │   ├─ MainLayout.jsx         // Sidebar + Header + Contenu
   │   ├─ Sidebar.jsx
   │   └─ Header.jsx             // Sélecteur de restaurant + filtre de période
   ├─ pages/
   │   ├─ Dashboard/
   │   │   └─ DashboardPage.jsx  // Tableau de bord (stats & graphiques)
   │   ├─ Restaurants/
   │   │   └─ RestaurantsPage.jsx
   │   ├─ Menus/
   │   │   └─ MenusPage.jsx      // Catégories + Repas (CRUD complet)
   │   ├─ Orders/
   │   │   └─ OrdersPage.jsx     // Liste des commandes + statut de paiement
   │   ├─ Users/
   │   │   └─ UsersPage.jsx      // Utilisateurs internes
   │   ├─ Customers/
   │   │   └─ CustomersPage.jsx  // Clients finaux
   │   ├─ Promotions/
   │   │   └─ PromotionsPage.jsx
   │   ├─ Notifications/
   │   │   └─ NotificationsPage.jsx
   │   ├─ Payments/
   │   │   └─ PaymentsPage.jsx   // NOUVEAU : historique des paiements / transactions
   │   └─ Settings/
   │       └─ SettingsPage.jsx   // Inclura une section "Paramètres de paiement"
   ├─ components/
   │   ├─ charts/
   │   │   ├─ RevenueChart.jsx
   │   │   └─ OrdersStatusChart.jsx
   │   ├─ kpi/
   │   │   ├─ KpiCard.jsx
   │   │   └─ KpiGrid.jsx
   │   ├─ tables/
   │   │   ├─ RestaurantsTable.jsx
   │   │   ├─ OrdersTable.jsx        // Ajout colonnes méthode/statut de paiement
   │   │   ├─ UsersTable.jsx
   │   │   ├─ CustomersTable.jsx
   │   │   ├─ PromotionsTable.jsx
   │   │   └─ PaymentsTable.jsx      // NOUVEAU : liste des paiements
   │   ├─ menus/
   │   │   ├─ CategoryList.jsx
   │   │   ├─ CategoryForm.jsx
   │   │   ├─ MealList.jsx
   │   │   └─ MealForm.jsx           // contient le champ prix du repas
   │   ├─ forms/
   │   │   ├─ RestaurantForm.jsx
   │   │   ├─ UserForm.jsx
   │   │   ├─ PromotionForm.jsx
   │   │   ├─ NotificationSettingsForm.jsx
   │   │   └─ PaymentSettingsForm.jsx   // NOUVEAU : config moyens de paiement
   │   ├─ filters/
   │   │   ├─ DateRangeFilter.jsx
   │   │   └─ RestaurantSelector.jsx
   │   └─ common/
   │       ├─ Button.jsx
   │       ├─ Modal.jsx
   │       ├─ LoadingSpinner.jsx
   │       └─ ConfirmDialog.jsx
   ├─ api/
   │   ├─ client.js              // config axios/fetch
   │   ├─ auth.js
   │   ├─ restaurants.js
   │   ├─ menus.js               // regroupe mealCategories + meals
   │   ├─ orders.js              // commandes + statut de paiement
   │   ├─ users.js
   │   ├─ customers.js
   │   ├─ promotions.js
   │   ├─ notifications.js
   │   ├─ payments.js            // NOUVEAU : transactions et paramètres de paiement
   │   └─ dashboard.js           // stats & rapports (inclura CA payé)
   ├─ context/
   │   ├─ AuthContext.jsx
   │   └─ AppContext.jsx         // restaurant sélectionné + plage de dates
   ├─ hooks/
   │   ├─ useAuth.js
   │   ├─ useDashboardData.js
   │   └─ useFetch.js
   ├─ utils/
   │   ├─ date.js
   │   └─ format.js              // formatCurrency pour montants
   └─ styles/
       ├─ globals.css
       └─ layout.css
```

---

## 3. Structure des principales API backend (logique, pas le code)

Même si tu ne développes pas le backend, c’est utile de montrer comment ton dashboard l’utilise.

Pour chaque module :

- **Tableau de bord :**
  - `GET /api/dashboard/summary?restaurantId=&from=&to=`
  - `GET /api/dashboard/revenue?restaurantId=&from=&to=`
  - `GET /api/dashboard/top-meals?restaurantId=&from=&to=`
  - `GET /api/dashboard/orders-status?restaurantId=&from=&to=`

- **Restaurants :**
  - `GET /api/restaurants`
  - `POST /api/restaurants`
  - `PUT /api/restaurants/:id`
  - `DELETE /api/restaurants/:id`

- **Menus & Repas :**
  - `GET /api/meal-categories?restaurantId=`
  - `POST /api/meal-categories`
  - `PUT /api/meal-categories/:id`
  - `DELETE /api/meal-categories/:id`
  - `GET /api/meals?restaurantId=&categoryId=`
  - `POST /api/meals`
  - `PUT /api/meals/:id`
  - `DELETE /api/meals/:id`

- **Commandes :**
  - `GET /api/orders?restaurantId=&from=&to=&status=`
  - `GET /api/orders/:id`
  - `PUT /api/orders/:id/status`

- **Utilisateurs / Clients :**
  - `GET /api/users`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`
  - `GET /api/customers?restaurantId=`

- **Promotions :**
  - `GET /api/promotions?restaurantId=`
  - `POST /api/promotions`
  - `PUT /api/promotions/:id`
  - `DELETE /api/promotions/:id`

- **Notifications :**
  - `GET /api/notifications/settings?restaurantId=`
  - `PUT /api/notifications/settings?restaurantId=`

Ces APIs alimentent à la fois :
- ton **dashboard React** (lecture/écriture),  
- et les **mobiles via SDK CityMate** (lecture seule pour affichage).

  

  Voici une explication claire de chaque **niveau** et **dossier/fichier** de la structure, comme tu pourrais l’utiliser dans un rapport.

---

## 1. Niveau racine du projet

### `project-root/`

C’est le dossier racine de l’application React.  
Il contient, en plus du dossier `src/` :

- les fichiers de configuration (ex. `package.json`, `vite.config.js` ou `webpack.config.js`, etc.)  
- les fichiers liés au build, aux dépendances, au lancement du projet.

On ne détaille ici que le dossier `src/`, qui contient tout le code applicatif.

---

## 2. Dossier `src/` (code source de l’application)

Tout le code de l’interface web (frontend) se trouve dans `src/`.

### `index.js`

- Point d’entrée de l’application React.
- Monte le composant racine `<App />` dans le DOM (dans `index.html`).
- Initialise éventuellement des providers globaux (ex. `React.StrictMode`).

### `App.js`

- Composant racine de l’application.
- Configure les providers généraux (contexte d’authentification, contexte d’application).
- Contient le `BrowserRouter` et appelle le composant de routes `AppRouter`.
- C’est le point de départ pour toute la navigation.

---

## 3. Dossier `routes/`

### `routes/AppRouter.jsx`

- Définit toutes les **routes** de l’application (par exemple avec `react-router-dom`).
- Associe chaque URL à une **page** :
  - `/dashboard` → `DashboardPage`
  - `/restaurants` → `RestaurantsPage`
  - `/menus` → `MenusPage`
  - etc.
- Permet de gérer les redirections (par ex. `/` → `/dashboard`).

---

## 4. Dossier `layout/` (mise en page globale)

Ce dossier contient les composants qui définissent la **structure visuelle générale** (layout) de l’application.

### `MainLayout.jsx`

- Composant de mise en page principal.
- Inclut :
  - la **sidebar** (menu latéral),
  - le **header** (barre en haut),
  - la zone de **contenu central** où les pages sont affichées.
- Sert de “cadre” commun à toutes les pages.

### `Sidebar.jsx`

- Composant qui affiche le menu latéral :
  - Liens vers : Tableau de bord, Restaurants, Menus, Commandes, Utilisateurs, Promotions, etc.
- Gère éventuellement la mise en évidence (highlight) de la page courante.

### `Header.jsx`

- Barre supérieure de l’interface.
- Contient par exemple :
  - le **sélecteur de restaurant** (pour choisir sur quel restaurant on travaille),
  - le **filtre de période** (dates pour les statistiques),
  - l’avatar ou le nom de l’utilisateur connecté.
- Sert de zone de filtres globaux et d’informations utilisateur.

---

## 5. Dossier `pages/` (pages principales de l’application)

Chaque sous-dossier représente une **page** accessible par une route.

### `pages/Dashboard/DashboardPage.jsx`

- Page du **tableau de bord**.
- Affiche les KPI, les graphiques (chiffre d’affaires, commandes), les dernières commandes, etc.
- C’est la vue d’ensemble de l’activité pour un restaurant donné et une période donnée.

### `pages/Restaurants/RestaurantsPage.jsx`

- Page de gestion des **restaurants**.
- Affiche un tableau des restaurants (liste) et permet de créer, modifier, supprimer un restaurant.
- Utilisée surtout par l’administrateur global.

### `pages/Menus/MenusPage.jsx`

- Page de gestion des **menus & repas**.
- Regroupe :
  - la gestion des **catégories** (Entrées, Plats, Desserts, etc.),
  - la gestion des **repas/plats** (nom, prix, description, disponibilité).
- Propose un CRUD complet (Create, Read, Update, Delete) pour les menus.

### `pages/Orders/OrdersPage.jsx`

- Page de gestion et de suivi des **commandes**.
- Permet de filtrer les commandes par période, statut, restaurant.
- Affiche la liste des commandes et les détails d’une commande (contenu, client, statut, montant).

### `pages/Users/UsersPage.jsx`

- Page pour gérer les **utilisateurs internes** :
  - administrateurs, restaurateurs, livreurs, etc.
- Permet d’ajouter, modifier, supprimer des comptes, et de gérer les **rôles**.

### `pages/Customers/CustomersPage.jsx`

- Page pour gérer ou visualiser les **clients finaux** (utilisateurs des applis mobiles).
- Affiche la liste des clients, leur nombre de commandes, quelques infos de contact.

### `pages/Promotions/PromotionsPage.jsx`

- Page de gestion des **promotions et offres spéciales**.
- Liste des promotions + formulaire de création/modification.
- Les promotions définies ici sont affichées sur mobile via le SDK CityMate.

### `pages/Notifications/NotificationsPage.jsx`

- Page pour configurer les **notifications** :
  - choix des événements qui déclenchent une notification (nouvelle commande, changement de statut),
  - éventuellement type de canal (email, push).
- Stocke les préférences de notification côté backend.

### `pages/Settings/SettingsPage.jsx`

- Page des **paramètres** et de la **sécurité**.
- Contient :
  - les paramètres de profil (nom, email, mot de passe),
  - éventuellement une vue de configuration des rôles/permissions.

---

## 6. Dossier `components/` (composants réutilisables)

Contient des composants UI partagés entre plusieurs pages.

### `components/charts/`

- `RevenueChart.jsx`  
  Composant graphique (courbe ou barres) pour afficher le chiffre d’affaires dans le temps.

- `OrdersStatusChart.jsx`  
  Graphique (camembert/barres) pour afficher la répartition des commandes par statut (en attente, livrée, annulée, etc.).

### `components/kpi/`

- `KpiCard.jsx`  
  Composant pour afficher une **carte d’indicateur** (ex. “Total commandes : 120”).

- `KpiGrid.jsx`  
  Grille de plusieurs `KpiCard` pour afficher les KPI principaux du tableau de bord.

### `components/tables/`

- `RestaurantsTable.jsx`  
  Tableau listant les restaurants (nom, adresse, actions…).

- `OrdersTable.jsx`  
  Tableau listant les commandes (N°, client, montant, statut…).

- `UsersTable.jsx`  
  Tableau pour les utilisateurs internes (nom, email, rôle…).

- `CustomersTable.jsx`  
  Tableau pour les clients finaux.

- `PromotionsTable.jsx`  
  Tableau pour les promotions (titre, dates, statut, actions).

### `components/menus/`

- `CategoryList.jsx`  
  Liste des catégories de repas (Entrées, Plats, Desserts, etc.).

- `CategoryForm.jsx`  
  Formulaire pour ajouter/modifier une catégorie.

- `MealList.jsx`  
  Liste des plats/repas d’une catégorie (nom, prix, disponibilité…).

- `MealForm.jsx`  
  Formulaire pour ajouter/modifier un plat (nom, description, prix, disponible ou non).

### `components/forms/`

- `RestaurantForm.jsx`  
  Formulaire de création/édition de restaurant.

- `UserForm.jsx`  
  Formulaire de création/édition d’utilisateur interne.

- `PromotionForm.jsx`  
  Formulaire de création/édition de promotion.

- `NotificationSettingsForm.jsx`  
  Formulaire de configuration des paramètres de notifications.

### `components/filters/`

- `DateRangeFilter.jsx`  
  Composant pour sélectionner une **période** (dates de début/fin ou raccourcis type “7 jours”).

- `RestaurantSelector.jsx`  
  Composant pour choisir le **restaurant** actif (s’il y en a plusieurs).

### `components/common/`

- `Button.jsx`  
  Bouton générique stylé.

- `Modal.jsx`  
  Fenêtre modale réutilisable (pour formulaires, confirmations…).

- `LoadingSpinner.jsx`  
  Indicateur de chargement (spinner).

- `ConfirmDialog.jsx`  
  Boîte de dialogue de confirmation (ex. “Voulez-vous vraiment supprimer ?”).

---

## 7. Dossier `api/` (communication avec le backend)

Contient des fonctions qui font les appels HTTP vers l’API backend.

### `api/client.js`

- Configure l’outil HTTP (fetch ou axios) :
  - base URL,
  - headers par défaut (par ex. token d’authentification),
  - gestion centralisée des erreurs.

### `api/auth.js`

- Fonctions d’authentification :
  - login, logout,
  - récupération des infos utilisateur.

### `api/restaurants.js`

- Fonctions pour appeler l’API des **restaurants** :
  - `getRestaurants()`, `createRestaurant()`, `updateRestaurant()`, `deleteRestaurant()`.

### `api/menus.js`

- Fonctions pour gérer **catégories et repas** :
  - `getMealCategories()`, `createCategory()`, etc.
  - `getMeals()`, `createMeal()`, `updateMeal()`, `deleteMeal()`.

### `api/orders.js`

- Fonctions pour les **commandes** :
  - `getOrders()`, `getOrderById()`, `updateOrderStatus()`, etc.

### `api/users.js`

- Fonctions pour les **utilisateurs internes** :
  - `getUsers()`, `createUser()`, `updateUser()`, `deleteUser()`.

### `api/customers.js`

- Fonctions pour les **clients finaux** :
  - `getCustomers()`, stats éventuelles, etc.

### `api/promotions.js`

- Fonctions pour les **promotions & offres** :
  - `getPromotions()`, `createPromotion()`, `updatePromotion()`, `deletePromotion()`.

### `api/notifications.js`

- Fonctions pour les **notifications** :
  - `getNotificationSettings()`, `updateNotificationSettings()`.

### `api/dashboard.js`

- Fonctions pour les **statistiques & rapports** utilisés par le tableau de bord :
  - `getSummary()`, `getRevenueOverTime()`, `getTopMeals()`, etc.

---

## 8. Dossier `context/` (contexte global React)

Utilisé pour partager des informations entre composants sans passer par les props.

### `AuthContext.jsx`

- Contexte d’**authentification** :
  - utilisateur connecté (id, nom, rôle),
  - token d’accès,
  - fonctions pour login/logout.
- Accessible depuis n’importe quel composant via un hook (`useAuth`).

### `AppContext.jsx`

- Contexte de l’**application** :
  - restaurant sélectionné,
  - plage de dates (pour les statistiques),
  - autres filtres globaux éventuels.
- Permet à plusieurs pages (Dashboard, Commandes, Menus, Promotions…) de partager les mêmes filtres.

---

## 9. Dossier `hooks/` (hooks personnalisés)

Des hooks React réutilisables pour simplifier le code.

### `useAuth.js`

- Hook pour accéder facilement au contexte d’authentification (`AuthContext`).
- Expose les informations de l’utilisateur et les fonctions de login/logout.

### `useDashboardData.js`

- Hook pour charger toutes les **données du tableau de bord** en une fois (KPI, graphiques, top plats, etc.) en fonction du restaurant et de la période sélectionnés.
- Gère les états `loading`, `error`, `data`.

### `useFetch.js`

- Hook générique pour faire des appels API :
  - prend une URL ou une fonction d’API,
  - renvoie `data`, `loading`, `error`.
- Permet de factoriser le code des requêtes HTTP.

---

## 10. Dossier `utils/` (fonctions utilitaires)

Fonctions d’aide réutilisables dans toute l’application.

### `date.js`

- Fonctions liées aux dates :
  - formater des dates,
  - calculer des périodes (aujourd’hui, 7 jours, 30 jours),
  - convertir des chaînes de date en objets Date ou inversement.

### `format.js`

- Fonctions de formatage :
  - formatage de montants (ex. `formatCurrency(1234.5) → "1 234,50 €"`),
  - format de nombres, pourcentage, etc.

---

## 11. Dossier `styles/` (styles CSS)

Rassemble les feuilles de style de l’application.

### `globals.css`

- Styles **globaux** :
  - reset CSS,
  - polices,
  - couleurs de base,
  - styles généraux de la page.

### `layout.css`

- Styles spécifiques au **layout** :
  - organisation de la sidebar + header + contenu,
  - tailles, marges, couleurs des zones principales.

---

Tu peux reprendre ces explications dans ton rapport, par exemple dans une section intitulée :

>