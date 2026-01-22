Voici un récapitulatif **de toutes les commandes utiles** pour ce projet, présentées en tableau avec :

- la **commande exacte** à taper  
- une **explication claire**  
- le **rôle** (pour quoi / à quel moment)

Je pars sur la base d’un projet **Vite + React** comme on l’a construit ensemble.

---

## 1. Commandes d’initialisation du projet

| Étape | Commande | Explication | Rôle / Quand l’utiliser |
|-------|----------|-------------|--------------------------|
| Créer le projet | `npm create vite@latest citymate-dashboard -- --template react` | Lance l’outil Vite pour créer un nouveau projet React dans le dossier `citymate-dashboard`. | Première étape : créer le squelette du projet React. |
| Entrer dans le projet | `cd citymate-dashboard` | Se positionne dans le répertoire du projet nouvellement créé. | À faire juste après la création du projet. |
| Installer les dépendances de base | `npm install` | Installe toutes les dépendances listées dans `package.json` (celles ajoutées par Vite). | Toujours après la création du projet, avant de lancer le serveur. |

---

## 2. Commandes pour installer les bibliothèques nécessaires

### 2.1. Navigation, HTTP, graphiques, dates, notifications

| Domaine | Commande | Explication | Rôle dans le projet |
|--------|----------|-------------|----------------------|
| Routage | `npm install react-router-dom` | Ajoute `react-router-dom` pour gérer les routes (`/dashboard`, `/menus`, `/orders`, etc.). | Utilisé dans `src/routes/AppRouter.jsx` pour définir les pages. |
| HTTP (API) | `npm install axios` | Ajoute `axios` comme client HTTP. | Utilisé dans `src/api/client.js` et tous les fichiers `api/*.js` pour appeler le backend. |
| Graphiques | `npm install recharts` | Ajoute la librairie de graphiques Recharts. | Utilisé dans `src/components/charts/RevenueChart.jsx`, `OrdersStatusChart.jsx` pour les stats du dashboard. |
| Dates | `npm install dayjs` | Ajoute une petite librairie pour manipuler les dates. | Utilisé dans `src/utils/date.js` et dans les pages qui filtrent par période (Dashboard, Orders, Payments). |
| Notifications UI | `npm install react-toastify` | Ajoute un système de “toasts” (messages de succès/erreur). | Utilisé par exemple dans les formulaires (sauvegarde paramètres de paiement, création de plats, etc.). |

### 2.2. Formulaires et validation (recommandé)

| Domaine | Commande | Explication | Rôle dans le projet |
|--------|----------|-------------|----------------------|
| Gestion formulaires | `npm install react-hook-form` | Librairie pour gérer les formulaires de manière simple (état, submit, erreurs). | Utilisée dans `components/forms/*Form.jsx` (PromotionForm, MealForm, RestaurantForm…). |
| Validation | `npm install yup @hookform/resolvers` | `yup` sert à définir les règles de validation, `@hookform/resolvers` les connecte à `react-hook-form`. | Permet de valider les champs (prix > 0, nom obligatoire, etc.) côté frontend. |

### 2.3. Icônes (confort)

| Domaine | Commande | Explication | Rôle dans le projet |
|--------|----------|-------------|----------------------|
| Icônes | `npm install react-icons` | Ajoute une grande collection d’icônes prêtes à l’emploi. | Utilisé dans `Sidebar.jsx` et les tables/boutons (icônes de menu, modifier, supprimer, etc.). |

### 2.4. (Optionnel) Styling avancé

Si tu veux aller plus loin sur le design, tu peux utiliser Tailwind CSS ou Material UI, mais ce n’est **pas obligatoire**.

| Domaine | Commande | Explication | Rôle |
|--------|----------|-------------|------|
| Tailwind CSS | `npm install -D tailwindcss postcss autoprefixer` puis `npx tailwindcss init -p` | Installe et initialise Tailwind (framework CSS utilitaire). | Permet de styliser rapidement ton dashboard avec des classes Tailwind. |
| Material UI | `npm install @mui/material @emotion/react @emotion/styled` | Ajoute la bibliothèque de composants Material UI. | Permet d’utiliser des composants déjà designés (Table, Button, Card, etc.). |

---

## 3. Commandes NPM pour lancer et construire l’application

Avec Vite, ton `package.json` contient (en gros) :

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

Les commandes associées sont :

| Commande | Explication | Rôle / Quand l’utiliser |
|----------|-------------|--------------------------|
| `npm run dev` | Lance le serveur de développement Vite, généralement sur `http://localhost:5173`. | Pour travailler sur le projet, voir les pages en temps réel, développement quotidien. |
| `npm run build` | Construit la version de production de l’application (bundle optimisé dans `dist/`). | Avant de déployer l’application sur un serveur (hébergement). |
| `npm run preview` | Lance un petit serveur pour prévisualiser le build de production. | Pour tester en local la version “production” avant un vrai déploiement. |

---

## 4. Récapitulatif rapide des commandes à connaître

### 4.1. Une fois au début

```bash
npm create vite@latest citymate-dashboard -- --template react
cd citymate-dashboard
npm install
```

### 4.2. Installer toutes les dépendances principales

```bash
npm install react-router-dom axios recharts dayjs react-toastify
npm install react-hook-form yup @hookform/resolvers
npm install react-icons
# (optionnel) npm install -D tailwindcss postcss autoprefixer
# (optionnel) npm install @mui/material @emotion/react @emotion/styled
```

### 4.3. Pendant le développement

```bash
npm run dev       # lancer l'app en mode développement
npm run build     # préparer le build de production
npm run preview   # tester le build de production en local
```

---

Si tu veux, je peux maintenant te faire un **petit tableau séparé** qui lie chaque **librairie installée** à **quel fichier de ta structure** va l’utiliser (ex : `axios` → `api/client.js`, `react-router-dom` → `routes/AppRouter.jsx`, etc.), pour que tu saches exactement où les brancher.


npm install react-i18next i18next-browser-languagedetector react-i18next-