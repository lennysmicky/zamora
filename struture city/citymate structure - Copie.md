

# 1. Proposition de structure du rapport

Tu peux organiser ton document ainsi :

1. Introduction  
2. Présentation générale de la solution CityMate  
3. Périmètre du travail réalisé : tableau de bord web  
4. Analyse des besoins fonctionnels du tableau de bord  
5. Conception fonctionnelle du tableau de bord  
6. Conception technique du tableau de bord (React + API)  
7. Implémentation de la gestion des menus, catégories et repas  
8. Intégration avec les applications mobiles via le SDK CityMate  
9. Tests, validation et résultats  
10. Limites et perspectives d’évolution  
11. Conclusion  


---

# 2. Rapport rédigé (texte complet)

## 1. Introduction

La digitalisation du secteur de la restauration est devenue un enjeu majeur pour améliorer la gestion des commandes, optimiser les processus internes et offrir une meilleure expérience aux clients. Dans ce contexte, la solution CityMate propose une plateforme globale permettant aux restaurants de gérer leurs activités et de diffuser automatiquement leurs services sur des applications mobiles grâce à un SDK dédié.

Le présent travail s’inscrit dans ce cadre et se concentre sur le développement d’un **tableau de bord web (dashboard)** destiné aux administrateurs et aux restaurateurs. Ce tableau de bord a pour objectif de centraliser la gestion des menus, des catégories de repas, des plats (dont les desserts et autres types), ainsi que le suivi de l’activité (commandes, promotions, etc.).  
Les données gérées via ce dashboard sont ensuite exploitées par des applications mobiles multiples, dont l’interface est générée dynamiquement via le SDK CityMate à partir du backend.

L’objectif du rapport est de présenter le contexte du projet, les besoins fonctionnels, la conception et l’implémentation du tableau de bord React, ainsi que son intégration avec le backend et les applications mobiles.

---

## 2. Présentation générale de la solution CityMate

CityMate est une solution modulaire conçue pour les acteurs de la restauration. Elle repose sur trois briques principales :

- **Un backend centralisé** :  
  Il stocke et gère l’ensemble des données liées aux restaurants, aux menus, aux repas, aux commandes, aux utilisateurs et aux promotions. Il expose une API sécurisée (REST ou équivalent) consommée par l’interface web et par les applications mobiles.

- **Une interface web d’administration** :  
  Accessible aux administrateurs et restaurateurs, elle permet de gérer les restaurants, les menus, les repas, les commandes, les promotions, ainsi que d’accéder à des statistiques. C’est dans cette interface que s’intègre le **tableau de bord** développé dans le cadre de ce travail.

- **Des applications mobiles générées via le SDK CityMate** :  
  Le SDK CityMate lit les données exposées par le backend (menus, catégories, promotions, configuration d’application, etc.) et génère automatiquement le rendu mobile pour les utilisateurs finaux. Plusieurs applications mobiles peuvent coexister et s’appuyer sur le même backend (multi-application).

L’architecture globale repose ainsi sur une **base de données unique**, un **backend exposant des API**, un **frontend web d’administration en React** et **un ensemble d’applications mobiles** consommant les mêmes données via le SDK.

Voici un schéma d’architecture que tu peux mettre à la place de la phrase :



### Schéma d’architecture globale (version texte)

Tu peux le reprendre dans ton rapport comme “Figure 1 : Architecture globale de la solution CityMate”.

```text
             ┌───────────────────────────────┐
             │   Interface Web d’admin       │
             │   (Dashboard React)           │
             └──────────────┬────────────────┘
                            │  (HTTP / HTTPS - API REST)
                            │
             ┌──────────────▼────────────────┐
             │         Backend API           │
             │  (Node.js / Express, logique  │
             │   métier, auth, sécurité)     │
             └──────────────┬────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
     ┌──────────▼──────────┐  ┌────────▼──────────┐
     │ Base de données      │  │ Services annexes  │
     │ (Menus, Repas,       │  │ (Notifications,   │
     │ Catégories,          │  │ Paiement, etc.)   │
     │ Promotions,          │  └───────────────────┘
     │ Commandes, Clients,  │
     │ Config. Applis)      │
     └──────────────────────┘

                            ▲
                            │  (HTTP / HTTPS - API REST)
             ┌──────────────┴────────────────┐
             │        SDK CityMate           │
             │ (intégré dans les applis      │
             │  mobiles Android / iOS)       │
             └──────────────┬────────────────┘
                            │
        ┌───────────────────┴─────────────────────┐
        │                                         │
┌───────▼─────────┐                     ┌────────▼───────┐
│ Application     │                     │ Application    │
│ mobile A        │                     │ mobile B       │
│ (Restaurant 1)  │                     │ (Restaurant 2) │
└─────────────────┘                     └────────────────┘
```

> La figure ci-dessus illustre l’architecture globale de la solution CityMate.  
> Le **tableau de bord web**, développé en React, permet aux administrateurs et restaurateurs de gérer les menus, catégories de repas, plats, promotions et configurations des applications mobiles. Il communique avec le **backend** via une API REST sécurisée (HTTP/HTTPS).  
> 
> Le **backend** centralise l’ensemble des données (restaurants, menus, repas, commandes, utilisateurs, promotions, configuration des applis) et applique la logique métier et les règles de sécurité. Il s’appuie sur une **base de données** et peut être connecté à des **services annexes** (notifications, paiements, etc.).  
> 
> Les **applications mobiles** (Android/iOS) intègrent le **SDK CityMate**, qui interroge le backend pour récupérer les menus, promotions et configurations définis dans le tableau de bord. Le SDK génère ensuite automatiquement le **rendu mobile** pour les utilisateurs finaux. Ainsi, chaque modification effectuée dans le dashboard (ajout/suppression de catégories, mise à jour des plats et des prix, activation de promotions) est automatiquement reflétée dans les différentes applications mobiles.


## 3. Périmètre du travail réalisé : tableau de bord web

L’application globale CityMate étant déjà en grande partie développée (backend, intégration du SDK, logique métier principale), le travail réalisé se concentre exclusivement sur la partie **tableau de bord web** côté administrateurs/restaurateurs.

Le périmètre fonctionnel couvert par ce tableau de bord est le suivant :

- Affichage d’une **vue d’ensemble** de l’activité (commandes, chiffre d’affaires, top plats, etc.)  
- **Gestion des menus** :
  - Gestion des **catégories de repas** (par exemple : Entrées, Plats, Desserts, Boissons) avec ajout, modification et suppression
  - Gestion des **repas / plats** (dont les desserts et autres types) avec leurs prix, descriptions, disponibilité, etc.
- Consultation des **commandes récentes** et de leurs statuts
- Gestion et suivi des **promotions** proposées aux clients
- Gestion de la configuration des **applications mobiles** (multi-application) :
  - association des menus et contenus à une application donnée
  - configuration de certaines options (par ex. fonctionnalités activées)

Les aspects propres au backend (conception de la base de données, implémentation des API, sécurité serveur) et à la partie SDK mobile ne sont pas développés ici, mais le tableau de bord s’appuie sur ces éléments existants pour fonctionner.

---

## 4. Analyse des besoins fonctionnels du tableau de bord

### 4.1. Types d’utilisateurs

Le dashboard s’adresse principalement à deux profils :

- **Administrateur global** :
  - Peut visualiser les statistiques globales sur l’ensemble des restaurants / applications.
  - Peut gérer les différentes applications mobiles et les données transverses.

- **Restaurateur** :
  - Accède uniquement aux données liées à son / ses restaurant(s) et à l’application mobile associée.
  - Gère ses propres menus, catégories, plats, promotions et suit ses commandes.

Les droits et permissions sont gérés côté backend ; le dashboard consomme les informations de rôle pour adapter l’affichage (par exemple, liste limitée d’applications, filtrage des données).

### 4.2. Cas d’utilisation principaux

Les principaux cas d’utilisation couverts par le tableau de bord sont :

- **Consulter une vue d’ensemble de l’activité** :
  - Nombre de commandes sur une période
  - Chiffre d’affaires généré
  - Répartition des commandes par statut
  - Plats les plus commandés

- **Gérer les catégories de repas** :
  - Ajouter une catégorie (ex : “Desserts”)
  - Modifier le nom ou la description d’une catégorie
  - Supprimer une catégorie si elle n’est plus utilisée

- **Gérer les repas / plats** :
  - Ajouter un nouveau plat en indiquant nom, catégorie, description, prix, disponibilité
  - Modifier un plat existant (par exemple changer le prix, corriger un nom)
  - Supprimer un plat qui n’est plus au menu
  - Marquer un plat comme “disponible” ou “indisponible” sans le supprimer

- **Gérer les promotions visibles sur mobile** :
  - Créer une promotion (titre, description, période de validité, éventuellement image)
  - Activer / désactiver des promotions
  - Visualiser les promotions en cours associées à une application mobile

- **Configurer les applications mobiles (multi-application)** :
  - Choisir l’application mobile sur laquelle on travaille (sélecteur d’application)
  - Associer les menus et les contenus à cette application
  - Configurer certains éléments d’affichage (logo, couleurs, fonctionnalités activées ou non)

Ces besoins fonctionnels ont guidé la conception du tableau de bord et sa structure de navigation.

---

## 5. Conception fonctionnelle du tableau de bord

### 5.1. Navigation et organisation générale

Le tableau de bord est implémenté sous la forme d’une application web monopage (SPA) en React, organisée autour d’un **menu latéral (sidebar)** et d’un **en-tête (header)**.

- La **sidebar** permet d’accéder aux principales sections :
  - Vue d’ensemble
  - Menus / Repas
  - Commandes
  - Promotions
  - Applications mobiles
  - Paramètres

- Le **header** contient :
  - Un **sélecteur d’application mobile** (dans le cas d’un système multi-application) permettant de changer le contexte.
  - Un **filtre de période** (par ex. Aujourd’hui, 7 derniers jours, 30 derniers jours, période personnalisée) permettant de recalculer les statistiques.

Cette organisation offre une expérience cohérente et permet de passer rapidement d’une vue globale à une vue plus détaillée (par exemple la gestion d’un menu précis).

### 5.2. Module « Vue d’ensemble »

Le module « Vue d’ensemble » présente une synthèse de l’activité liée à l’application sélectionnée :

- Indicateurs clés (KPI) :
  - Nombre total de commandes sur la période
  - Chiffre d’affaires total et, le cas échéant, chiffre d’affaires provenant du mobile
  - Panier moyen
  - Nombre de clients uniques

- Graphiques :
  - Courbe de l’évolution du chiffre d’affaires dans le temps
  - Répartition des commandes par statut (en cours, livrées, annulées, etc.)

- Liste des **dernières commandes** avec leurs informations principales (numéro, client, montant, statut).

Ce module permet aux administrateurs et restaurateurs de suivre l’évolution de leur activité de manière synthétique.

### 5.3. Module « Menus / Repas »

Le module « Menus / Repas » est au cœur de la gestion de l’offre de restauration. Il se compose de deux sous-parties :

1. **Gestion des catégories de repas** :
   - Liste des catégories existantes (Entrées, Plats, Desserts, Boissons, etc.)
   - Formulaire pour ajouter une nouvelle catégorie (nom, description, ordre d’affichage, activation)
   - Possibilité de modifier ou supprimer une catégorie

2. **Gestion des repas / plats** :
   - Affichage de la liste des repas appartenant à la catégorie sélectionnée
   - Formulaire pour créer un nouveau plat :
     - Nom du plat
     - Description
     - Catégorie associée
     - Prix
     - Disponibilité (oui/non)
   - Possibilité de modifier un plat existant (par exemple ajuster le prix d’un dessert)
   - Possibilité de supprimer un plat

Les opérations d’ajout, de modification et de suppression (CRUD) sur les **types de plats**, y compris les **desserts**, sont ainsi centralisées dans cette section. Les données enregistrées sont immédiatement disponibles pour les applications mobiles via le backend.

### 5.4. Module « Commandes »

Le module « Commandes » permet de :

- Visualiser la liste des commandes sur une période donnée
- Filtrer par statut, source (mobile / web), ou autre critère (restaurant, si applicable)
- Consulter les détails d’une commande (contenu du panier, montant, coordonnées client)  

Ce module est principalement orienté suivi opérationnel et analytique.

### 5.5. Module « Promotions »

Le module « Promotions » offre :

- Une liste des promotions actives ou passées pour l’application sélectionnée
- Un formulaire permettant de créer ou modifier une promotion (titre, description, date de début/fin, éventuels paramètres supplémentaires)
- La possibilité de désactiver ou supprimer une promotion

Les promotions gérées ici sont récupérées par les applications mobiles via le SDK CityMate et affichées aux utilisateurs finaux (bannières, sections “Offres spéciales”, etc.).

### 5.6. Module « Applications mobiles »

Dans un contexte multi-application, ce module permet :

- De visualiser la liste des applications mobiles liées au backend
- D’accéder à la configuration de chaque application :
  - Nom, logo
  - Thème graphique simple (couleurs principales)
  - Fonctionnalités activées (par exemple : commande, livraison, réservation)

Le tableau de bord agit ainsi comme un **panneau de configuration central** pour les différentes applications générées via le SDK CityMate.

---

## 6. Conception technique du tableau de bord (React + API)

### 6.1. Choix technologiques

Le tableau de bord est développé en **React.js**, pour les raisons suivantes :

- Réactivité et bonne expérience utilisateur (SPA)
- Écosystème riche (gestion du routage, composants graphiques, intégration avec des librairies de graphiques)
- Facilité de consommation des API REST exposées par le backend

D’autres outils viennent compléter l’architecture front-end :

- **react-router-dom** pour la gestion des routes et des pages
- Une bibliothèque de graphiques (par exemple **Recharts** ou **react-chartjs-2**) pour les courbes et diagrammes
- Fetch natif ou Axios pour les appels HTTP vers l’API backend

### 6.2. Architecture front-end

L’application React est structurée de manière modulaire :

- Un composant racine `App` qui englobe :
  - Le routeur (définition des routes : `/dashboard`, `/menus`, `/orders`, etc.)
  - Des contextes globaux, notamment :
    - Contexte d’authentification (utilisateur, rôle, token éventuel)
    - Contexte d’application (application mobile sélectionnée, plage de dates)

- Un **layout principal** (`MainLayout`) qui définit :
  - La sidebar (menu latéral)
  - Le header (sélecteur d’application, filtre de dates)
  - La zone de contenu centrale où les pages sont rendues

- Des **pages** correspondant aux modules fonctionnels :
  - `DashboardOverviewPage` (vue d’ensemble)
  - `MenusPage` (gestion des catégories et plats)
  - `OrdersAnalyticsPage` (analyse des commandes)
  - `PromotionsPage`
  - `MobileAppsPage`
  - `SettingsPage`

- Des **composants réutilisables** :
  - Composants de graphiques (RevenueChart, TopMealsChart, etc.)
  - Composants de tableaux (liste des commandes, liste des promos)
  - Formulaires (par exemple pour créer une promotion ou un plat)

### 6.3. Modèle de données côté frontend

Côté frontend, des structures de données claires sont définies pour représenter :

- Les **applications mobiles** (id, nom, thème, fonctionnalités)
- Les **catégories de repas** (id, nom, description, ordre d’affichage, statut)
- Les **repas / plats** (id, nom, catégorie, prix, disponibilité)
- Les **commandes**
- Les **promotions**
- Les **statistiques** (résumé, points de données pour les graphiques, etc.)

Ces modèles sont directement liés aux réponses des API du backend.

### 6.4. Interaction avec le backend

L’intégralité des données affichées ou modifiées dans le dashboard est obtenue et mise à jour via des appels à l’API backend :

- Lecture des statistiques pour la vue d’ensemble
- Lecture et écriture des catégories et repas pour le module “Menus / Repas”
- Lecture/écriture des promotions
- Lecture des commandes récentes et statistiques associées
- Lecture et mise à jour de la configuration des applications mobiles

Le tableau de bord ne communique jamais directement avec le SDK CityMate ; il se limite à manipuler les données backend qui sont ensuite consommées par les mobiles.

---

## 7. Implémentation de la gestion des menus, catégories et repas

La gestion des menus, et en particulier des types de plats (dont les desserts), est une partie centrale du tableau de bord.

### 7.1. Gestion des catégories de repas

Une interface dédiée permet au restaurateur ou à l’administrateur :

- De **visualiser la liste des catégories** existantes pour l’application mobile sélectionnée.
- De **créer une nouvelle catégorie** (par exemple pour ajouter une nouvelle rubrique “Desserts” ou “Snacks”).
- De **modifier** le nom ou la description d’une catégorie pour l’adapter à l’offre du restaurant.
- De **supprimer** une catégorie lorsque celle-ci n’est plus pertinente.

Chaque catégorie est associée à une application mobile (via un identifiant `appId`) pour permettre une gestion multi-application.

### 7.2. Gestion des plats / repas

Pour chaque catégorie, une liste de plats est affichée. L’utilisateur peut :

- **Ajouter un plat** en renseignant :
  - le nom du plat (par exemple “Tiramisu” pour un dessert)
  - une description
  - le prix
  - la disponibilité (oui/non)
- **Modifier un plat** existant pour mettre à jour le prix, corriger le nom, ajuster la description ou changer son statut de disponibilité.
- **Supprimer un plat** qui ne fait plus partie du menu.

Les opérations de création, modification et suppression (CRUD) sont réalisées côté frontend via des formulaires React, et déclenchent des appels aux endpoints du backend correspondants.  
Une fois enregistrées, ces informations sont immédiatement prises en compte par les applications mobiles, qui récupèrent les menus à chaque actualisation via le SDK CityMate.

### 7.3. Impact côté mobile

Grâce à ce mécanisme :

- Lorsqu’une **nouvelle catégorie** (par exemple “Desserts”) est créée, elle devient disponible dans l’interface mobile.
- Lorsqu’un **nouveau plat** est ajouté, il est automatiquement affiché sur mobile dans la bonne catégorie.
- Lorsqu’un plat est marqué comme **indisponible**, les utilisateurs mobiles ne peuvent plus le commander (ou le voient comme indisponible, selon le comportement défini dans le mobile).

Le tableau de bord devient ainsi l’outil central de gestion du contenu affiché sur les terminaux mobiles.

---

## 8. Intégration avec les applications mobiles via le SDK CityMate

Les applications mobiles ne sont pas codées “en dur” pour chaque restaurant ; elles sont générées et configurées dynamiquement grâce au SDK CityMate, qui interroge le backend.

Le rôle du tableau de bord, dans ce contexte, est de :

- **Configurer le contenu** :
  - menus, catégories, plats, promotions, etc.
- **Configurer chaque application mobile** (dans le cas du multi-application) :
  - lier un restaurant à une appli
  - paramétrer certains aspects visuels et fonctionnels
- **Fournir des données structurées** que le SDK CityMate va utiliser pour construire l’interface utilisateur mobile.

La séparation des rôles est claire :

- Le tableau de bord gère les **données et configurations** côté back-office.
- Le SDK CityMate et les applications mobiles gèrent le **rendu et l’interaction** côté client final.

---

## 9. Tests, validation et résultats

Le tableau de bord a fait l’objet de tests fonctionnels, visant à vérifier :

- La conformité des écrans avec les besoins fonctionnels identifiés (vue d’ensemble, menus, promotions, etc.).
- Le bon fonctionnement des opérations CRUD sur :
  - les catégories de repas
  - les plats / repas (dont les desserts et autres types de mets)
- La cohérence des données entre :
  - le tableau de bord
  - le backend
  - les applications mobiles (vérification que les modifications se reflètent correctement côté mobile)

Des tests de non-régression basiques ont également été réalisés pour s’assurer qu’une modification dans un module (par exemple les menus) n’impacte pas négativement les autres (promotions, commandes, etc.).

Les résultats montrent que le tableau de bord permet de gérer efficacement le contenu et les paramètres des applications mobiles, et qu’il offre une vision claire de l’activité du restaurant.


## 10. Limites et perspectives d’évolution

Certaines limites et pistes d’amélioration ont été identifiées :

- **Visualisation avancée des statistiques** :  
  Il serait possible d’ajouter des graphiques plus avancés (comparaison de périodes, segmentation par type de plat, analyse de performance des promotions).

- **Gestion des images** :  
  L’intégration d’une gestion plus complète des images (upload, recadrage, optimisation) pour les plats et les promotions améliorerait la qualité visuelle des menus mobiles.

- **Gestion avancée des droits** :  
  Une interface dédiée à la gestion fine des rôles et permissions (par exemple autoriser certains restaurateurs à gérer uniquement les menus, d’autres à gérer aussi les promotions) enrichirait l’aspect multi-utilisateurs.

- **Notifications en temps réel dans le dashboard** :  
  Intégrer de la WebSocket ou des mécanismes temps réel permettrait aux restaurateurs de suivre les commandes sans rechargement de page.

---

## 11. Conclusion

Le développement du tableau de bord web en React pour la solution CityMate répond à un besoin central : offrir aux administrateurs et aux restaurateurs un outil complet pour **gérer leurs menus, catégories de repas, plats et promotions**, tout en bénéficiant d’une vue d’ensemble sur l’activité.

Ce dashboard s’intègre pleinement dans l’architecture globale de CityMate, en s’appuyant sur un backend centralisé et en alimentant les applications mobiles via le SDK CityMate. La gestion des types de plats, y compris les desserts, les prix et les catégories, se fait désormais de manière unifiée et intuitive, avec un impact direct sur l’affichage mobile.

Ce travail constitue une base solide sur laquelle il sera possible de construire de futures évolutions, tant sur le plan fonctionnel (nouvelles analyses, nouveaux modules) que technique (amélioration des performances et de l’ergonomie).

---

# 3. Structure complète du projet React (mise à jour)

Pour terminer, voici une **structure de dossiers** actualisée, incluant clairement la gestion des menus / catégories / repas :

```text
project-root/
└─ src/
   ├─ index.js
   ├─ App.js
   ├─ routes/
   │   └─ AppRouter.jsx
   ├─ layout/
   │   ├─ MainLayout.jsx      // Layout principal : sidebar + header + contenu
   │   ├─ Sidebar.jsx
   │   └─ Header.jsx          // Sélecteur d’appli + filtre de dates
   ├─ pages/
   │   ├─ DashboardOverview/
   │   │   └─ DashboardOverviewPage.jsx
   │   ├─ Menus/
   │   │   └─ MenusPage.jsx   // Gestion catégories + repas (CRUD complet)
   │   ├─ OrdersAnalytics/
   │   │   └─ OrdersAnalyticsPage.jsx
   │   ├─ CustomersAnalytics/
   │   │   └─ CustomersAnalyticsPage.jsx
   │   ├─ Promotions/
   │   │   └─ PromotionsPage.jsx
   │   ├─ MobileApps/
   │   │   └─ MobileAppsPage.jsx
   │   └─ Settings/
   │       └─ SettingsPage.jsx
   ├─ components/
   │   ├─ charts/
   │   │   ├─ RevenueChart.jsx
   │   │   ├─ OrdersByStatusChart.jsx
   │   │   └─ TopMealsChart.jsx
   │   ├─ kpi/
   │   │   ├─ KpiCard.jsx
   │   │   └─ KpiGrid.jsx
   │   ├─ tables/
   │   │   ├─ RecentOrdersTable.jsx
   │   │   └─ PromotionsTable.jsx
   │   ├─ menus/
   │   │   ├─ CategoryList.jsx
   │   │   ├─ CategoryForm.jsx
   │   │   ├─ MealList.jsx
   │   │   └─ MealForm.jsx
   │   ├─ filters/
   │   │   ├─ DateRangeFilter.jsx
   │   │   └─ AppSelector.jsx
   │   ├─ forms/
   │   │   └─ PromotionForm.jsx
   │   └─ common/
   │       ├─ Button.jsx
   │       ├─ Modal.jsx
   │       └─ LoadingSpinner.jsx
   ├─ api/
   │   ├─ client.js           // Configuration fetch/axios
   │   ├─ dashboard.js        // Endpoints /dashboard
   │   ├─ orders.js
   │   ├─ promotions.js
   │   ├─ mobileApps.js
   │   ├─ mealCategories.js   // CRUD catégories
   │   └─ meals.js            // CRUD plats/repas
   ├─ context/
   │   ├─ AuthContext.jsx
   │   └─ AppContext.jsx      // appId sélectionné + plage de dates
   ├─ hooks/
   │   ├─ useAuth.js
   │   ├─ useDashboardData.js
   │   └─ useFetch.js
   ├─ utils/
   │   ├─ date.js
   │   └─ format.js
   └─ styles/
       ├─ globals.css
       └─ layout.css
```
