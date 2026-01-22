
1. **Tout ce qui sera fait dans chaque partie** (chaque page/module du dashboard).  
2. La liste **des entités (tables)** avec leurs **attributs** et **références (FK)**.  
3. Le lien entre **modules** et **tables**.

Je suppose une base relationnelle (PostgreSQL) avec des noms de tables en anglais (plus standard), mais les écrans restent en français.

---

# 1. Ce qui sera fait dans chaque partie de la structure

Je me base sur ta structure React :

```text
pages/
  Dashboard/
  Restaurants/
  Menus/
  Orders/
  Users/
  Customers/
  Promotions/
  Notifications/
  Payments/
  Settings/
```

## 1.1. DashboardPage.jsx (Tableau de bord)

**But :** donner une vue d’ensemble de l’activité pour un restaurant (ou plusieurs) sur une période donnée.

**Fonctionnalités :**

- Sélection d’un **restaurant** et d’une **période** (via le `Header`).
- Affichage de **KPI** :
  - Nombre total de commandes
  - Chiffre d’affaires total
  - Chiffre d’affaires “payé” (encaissements)
  - Panier moyen
  - Nombre de clients uniques
- Graphiques :
  - **CA dans le temps** (par jour/semaine/mois)
  - **Répartition des commandes par statut** (PENDING, DELIVERED, etc.)
- Listes :
  - **Top 5 des plats** les plus vendus
  - **Dernières commandes** (montant, statut, paiement)

**Tables utilisées :**

- `orders` (statut, total_amount, dates)
- `order_items` (pour comptabiliser les plats)
- `meals` (noms de plats)
- `customers` (clients uniques)
- `payments` (CA encaissé)
- `restaurants` (filtre par restaurant)

---

## 1.2. RestaurantsPage.jsx

**But :** gérer les restaurants.

**Fonctionnalités :**

- Liste des restaurants :
  - Voir : nom, adresse, téléphone, email, statut (actif/inactif)
  - Actions : **Créer / Modifier / Supprimer**
- Formulaire de création / modification :
  - Nom, adresse, ville, pays
  - Téléphone, email
  - Horaires d’ouverture
  - Logo (URL)
  - Statut (actif/inactif)

**Tables utilisées :**

- `restaurants` (CRUD principal)
- (indirectement) `payment_settings`, `notification_settings` liés à chaque restaurant

---

## 1.3. MenusPage.jsx (Menus & Repas)

**But :** gérer les catégories (Entrées, Plats, Desserts…) et les repas avec leurs prix.

**Fonctionnalités :**

- Colonne gauche – **Catégories de repas** :
  - Liste des catégories pour le restaurant sélectionné
  - **Ajouter / Modifier / Supprimer** une catégorie
- Colonne droite – **Repas/Plats** :
  - Liste des plats pour la catégorie sélectionnée :
    - Nom, prix, disponibilité
  - **Ajouter / Modifier / Supprimer** un plat :
    - Nom, description
    - Catégorie
    - Prix
    - Disponible oui/non
    - (optionnel) Image

**Tables utilisées :**

- `meal_categories` (CRUD catégories)
- `meals` (CRUD plats)
- `restaurants` (FK restaurant_id sur les deux)

Ces données sont consommées par le mobile via le SDK CityMate.

---

## 1.4. OrdersPage.jsx (Commandes)

**But :** suivre et gérer les commandes.

**Fonctionnalités :**

- Liste des commandes :
  - Filtres : période, restaurant, statut de commande, **statut de paiement**, méthode de paiement
  - Colonnes :
    - N° commande
    - Client
    - Montant total
    - Statut de commande
    - **Statut de paiement**
    - **Méthode de paiement**
    - Date/heure
- Consultation du **détail d’une commande** :
  - Infos client
  - Liste des plats (détail, quantités, prix)
  - Statut de commande (avec éventuellement possibilité de le changer)
  - Historique de paiement (s’il y a plusieurs tentatives)

**Tables utilisées :**

- `orders` (listing + statuts commande/paiement)
- `order_items` (détail des plats commandés)
- `customers` (client lié à la commande)
- `payments` (transactions de paiement)
- `restaurants` (filtre par restaurant)

---

## 1.5. UsersPage.jsx (Utilisateurs internes)

**But :** gérer les comptes internes (admin, restaurateurs, staff).

**Fonctionnalités :**

- Liste des utilisateurs :
  - Nom, email, rôle (ADMIN, RESTAURANT_OWNER, STAFF, DELIVERY)
  - Restaurant associé (pour les restaurateurs)
  - Statut (actif/inactif)
- **Créer / Modifier / Désactiver** un utilisateur :
  - Nom complet
  - Email
  - Mot de passe (ou reset)
  - Rôle
  - Restaurant associé (si rôle restaurateur/staff)

**Tables utilisées :**

- `users` (CRUD utilisateurs)
- `restaurants` (FK restaurant_id pour certains users)

---

## 1.6. CustomersPage.jsx (Clients finaux)

**But :** voir les clients finaux et leurs commandes.

**Fonctionnalités :**

- Liste des clients :
  - Nom, email, téléphone
  - Nombre de commandes
  - Dernière commande
- Détail d’un client :
  - Informations de contact
  - Liste de ses commandes

**Tables utilisées :**

- `customers`
- `orders` (commandes par client)
- `restaurants` (si les clients sont liés à un ou plusieurs restaurants)

---

## 1.7. PromotionsPage.jsx (Promotions & Offres)

**But :** gérer les promotions affichées sur le mobile.

**Fonctionnalités :**

- Liste des promotions :
  - Titre
  - Date début / fin
  - Type de réduction (pourcentage, montant fixe…)
  - Statut (active, expirée, programmée)
- **Créer / Modifier / Supprimer** une promotion :
  - Titre
  - Description
  - Restaurant ciblé
  - Période de validité
  - Type de remise (pourcentage ou montant)
  - Valeur de la remise
  - Montant minimum de commande (optionnel)
  - Code promo (optionnel)
  - Active oui/non

**Tables utilisées :**

- `promotions` (CRUD principal)
- `restaurants` (FK restaurant_id, promotion liée à un resto)

---

## 1.8. NotificationsPage.jsx

**But :** configurer les notifications liées aux commandes et promotions.

**Fonctionnalités :**

- Formulaire de **paramètres de notifications** :
  - Notifier le restaurateur en cas de **nouvelle commande**
  - Notifier le client en cas de **changement de statut** de commande
  - Notifier les clients lors de **nouvelles promotions**
  - Canal(s) supporté(s) (email, push)
- (Optionnel) Liste des dernières notifications envoyées (journal).

**Tables utilisées :**

- `notification_settings` (par restaurant)
- `notifications_log` (journal des notifications, optionnel)
- `restaurants` (FK restaurant_id)

---

## 1.9. PaymentsPage.jsx (Paiements)

**But :** suivre les paiements (transactions) de manière plus “financière” que la simple liste des commandes.

**Fonctionnalités :**

- Liste des paiements :
  - Filtres : période, restaurant, méthode de paiement, statut de paiement
  - Colonnes :
    - ID paiement
    - ID commande
    - Client
    - Montant
    - Devise
    - Méthode de paiement (CB, cash, mobile money)
    - Statut (PENDING, PAID, FAILED, REFUNDED)
    - Fournisseur (Stripe, PayPal…)
    - Date/heure
- Détail d’un paiement (optionnel) :
  - Détail technique (id fournisseur, logs…)

**Tables utilisées :**

- `payments` (transactions)
- `orders` (pour relier à la commande)
- `customers` (client)
- `restaurants` (filtre par restaurant)

---

## 1.10. SettingsPage.jsx (Paramètres & Sécurité)

**But :** gérer les paramètres généraux du compte et du restaurant, notamment la partie paiement.

**Fonctionnalités possibles :**

- **Profil utilisateur** :
  - Nom, email, mot de passe
- **Paramètres du restaurant** (optionnel, si pas déjà ailleurs) :
  - Fuseau horaire, langue…
- **Paramètres de paiement** (via `PaymentSettingsForm.jsx`) :
  - Activer/désactiver :
    - Paiement par carte
    - Paiement à la livraison
    - Mobile money
  - Informations de configuration fournisseur (nom, éventuellement clés publiques)
- **Paramètres de notifications** de haut niveau (ou redirection vers la page dédiée).

**Tables utilisées :**

- `users` (profil)
- `restaurants` (paramètres de base)
- `payment_settings` (paramètres de paiement par restaurant)
- `notification_settings` (optionnel)

---

# 2. Entités (tables) et attributs + références

Je liste maintenant les tables principales avec leurs champs (attributs) et les clés étrangères (FK).

## 2.1. Table `restaurants`

**But :** représenter chaque restaurant.

**Champs :**

- `id` (PK) – identifiant unique
- `name` – nom du restaurant
- `address_line` – adresse
- `city` – ville
- `country` – pays
- `phone` – téléphone
- `email` – email de contact
- `opening_hours` – horaires (texte ou JSON)
- `logo_url` – URL du logo
- `status` – `ACTIVE` / `INACTIVE`
- `created_at`
- `updated_at`

**Référencée par :**

- `users.restaurant_id`
- `meal_categories.restaurant_id`
- `meals.restaurant_id`
- `orders.restaurant_id`
- `promotions.restaurant_id`
- `payments.restaurant_id`
- `payment_settings.restaurant_id`
- `notification_settings.restaurant_id`

---

## 2.2. Table `users` (utilisateurs internes)

**But :** comptes admin, restaurateurs, staff.

**Champs :**

- `id` (PK)
- `full_name`
- `email` (unique)
- `password_hash`
- `role` – ENUM : `ADMIN`, `RESTAURANT_OWNER`, `STAFF`, `DELIVERY`
- `restaurant_id` (FK, nullable) – si l’utilisateur est lié à un restaurant spécifique
- `is_active` (bool)
- `created_at`
- `updated_at`

**FK :**

- `restaurant_id` → `restaurants.id` (nullable pour un admin global)

---

## 2.3. Table `customers` (clients finaux)

**But :** clients des applis mobiles / commandes.

**Champs :**

- `id` (PK)
- `first_name`
- `last_name`
- `email` (nullable selon besoin)
- `phone` (nullable)
- `default_address` (texte ou JSON)
- `created_at`
- `updated_at`

**Référencée par :**

- `orders.customer_id`
- (optionnel) `notifications_log.customer_id`

---

## 2.4. Table `meal_categories`

**But :** catégories de repas (Entrées, Plats, Desserts…).

**Champs :**

- `id` (PK)
- `restaurant_id` (FK)
- `name` – ex: "Desserts"
- `description` (nullable)
- `sort_order` (int, ordre d’affichage)
- `is_active` (bool)
- `created_at`
- `updated_at`

**FK :**

- `restaurant_id` → `restaurants.id`

**Référencée par :**

- `meals.category_id`

---

## 2.5. Table `meals` (repas / plats)

**But :** plats proposés par un restaurant.

**Champs :**

- `id` (PK)
- `restaurant_id` (FK)
- `category_id` (FK)
- `name`
- `description` (nullable)
- `price` (DECIMAL)
- `image_url` (nullable)
- `is_available` (bool)
- `created_at`
- `updated_at`

**FK :**

- `restaurant_id` → `restaurants.id`
- `category_id` → `meal_categories.id`

**Référencée par :**

- `order_items.meal_id` (si on pointe vers le plat d’origine)

---

## 2.6. Table `orders` (commandes)

**But :** commandes passées par les clients.

**Champs :**

- `id` (PK)
- `restaurant_id` (FK)
- `customer_id` (FK)
- `source` – ENUM: `MOBILE`, `WEB`, `OTHER`
- `status` – ENUM: `PENDING`, `IN_PREPARATION`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`
- `total_amount` (DECIMAL)
- `payment_status` – ENUM: `PENDING`, `PAID`, `FAILED`, `REFUNDED`
- `payment_method` – ENUM: `CARD`, `CASH_ON_DELIVERY`, `MOBILE_MONEY`, `OTHER`
- `created_at`
- `updated_at`

**FK :**

- `restaurant_id` → `restaurants.id`
- `customer_id` → `customers.id`

**Référencée par :**

- `order_items.order_id`
- `payments.order_id`
- (écrans : Dashboard, Orders, Payments, Customers)

---

## 2.7. Table `order_items` (lignes de commande)

**But :** détail des plats commandés dans une commande.

**Champs :**

- `id` (PK)
- `order_id` (FK)
- `meal_id` (FK, nullable si plat supprimé ensuite)
- `meal_name_snapshot` – nom du plat au moment de la commande
- `unit_price` (DECIMAL)
- `quantity` (int)
- `total_price` (DECIMAL)
- `created_at`

**FK :**

- `order_id` → `orders.id`
- `meal_id` → `meals.id` (nullable si on veut garder l’historique même si le plat disparait)

---

## 2.8. Table `promotions`

**But :** promotions et offres spéciales.

**Champs :**

- `id` (PK)
- `restaurant_id` (FK)
- `title`
- `description`
- `start_date`
- `end_date`
- `is_active` (bool)
- `discount_type` – ENUM: `PERCENTAGE`, `FIXED_AMOUNT`, `FREE_DELIVERY`
- `discount_value` (DECIMAL, pourcentage ou montant)
- `min_order_amount` (DECIMAL, nullable)
- `promo_code` (nullable)
- `created_at`
- `updated_at`

**FK :**

- `restaurant_id` → `restaurants.id`

---

## 2.9. Table `payments` (transactions de paiement)

**But :** historique des paiements (surtout pour la page Payments).

**Champs :**

- `id` (PK)
- `order_id` (FK)
- `restaurant_id` (FK)
- `amount` (DECIMAL)
- `currency` (ex: "EUR")
- `method` – ENUM: `CARD`, `CASH_ON_DELIVERY`, `MOBILE_MONEY`, `OTHER`
- `status` – ENUM: `PENDING`, `PAID`, `FAILED`, `REFUNDED`
- `provider` – nom du prestataire (ex: "Stripe")
- `provider_payment_id` – identifiant transaction fournisseur
- `created_at`
- `updated_at`

**FK :**

- `order_id` → `orders.id`
- `restaurant_id` → `restaurants.id`

---

## 2.10. Table `payment_settings`

**But :** configuration des moyens de paiement par restaurant.

**Champs :**

- `id` (PK)
- `restaurant_id` (FK)
- `enable_card_payments` (bool)
- `enable_cash_on_delivery` (bool)
- `enable_mobile_money` (bool)
- `provider_name` (nullable, ex: "Stripe")
- `provider_public_key` (nullable)
- `provider_secret_key` (nullable, ou stockée ailleurs)
- `created_at`
- `updated_at`

**FK :**

- `restaurant_id` → `restaurants.id`

---

## 2.11. Table `notification_settings`

**But :** paramètres de notifications par restaurant.

**Champs :**

- `id` (PK)
- `restaurant_id` (FK)
- `notify_new_order_restaurant` (bool)
- `notify_order_status_customer` (bool)
- `notify_new_promotion_customer` (bool)
- `email_sender` (nullable)
- `created_at`
- `updated_at`

**FK :**

- `restaurant_id` → `restaurants.id`

---

## 2.12. Table `notifications_log` (optionnelle)

**But :** journal des notifications envoyées.

**Champs :**

- `id` (PK)
- `restaurant_id` (FK)
- `user_id` (FK, nullable)
- `customer_id` (FK, nullable)
- `channel` – ENUM: `EMAIL`, `PUSH`, `SMS`
- `type` – ENUM: `NEW_ORDER`, `ORDER_STATUS`, `PROMOTION`
- `status` – `SENT`, `FAILED`
- `payload` (JSON ou texte)
- `created_at`

**FK :**

- `restaurant_id` → `restaurants.id`
- `user_id` → `users.id` (si notifié)
- `customer_id` → `customers.id` (si notifié)

---

# 3. Récapitulatif : tables par module

Pour t’aider dans ton rapport, voici un résumé :

- **DashboardPage**
  - Tables : `orders`, `order_items`, `meals`, `customers`, `payments`, `restaurants`

- **RestaurantsPage**
  - Tables : `restaurants`, (et lecture de `payment_settings`, `notification_settings` en arrière-plan)

- **MenusPage**
  - Tables : `meal_categories`, `meals`, `restaurants`

- **OrdersPage**
  - Tables : `orders`, `order_items`, `customers`, `payments`, `restaurants`

- **UsersPage**
  - Tables : `users`, `restaurants`

- **CustomersPage**
  - Tables : `customers`, `orders`, `restaurants`

- **PromotionsPage**
  - Tables : `promotions`, `restaurants`

- **NotificationsPage**
  - Tables : `notification_settings`, (`notifications_log` en option), `restaurants`

- **PaymentsPage**
  - Tables : `payments`, `orders`, `customers`, `restaurants`

- **SettingsPage**
  - Tables : `users` (profil),
             `restaurants` (paramètres de base),
             `payment_settings`,
             `notification_settings`.

---
