### Documentation de l'API Constelium

## Endpoints Utilisateur

### Inscription

- **URL** : `/user/register`
- **Méthode** : `POST`
- **Description** : Enregistrer un nouvel utilisateur.
- **Corps de la requête** :
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Réponses** :
  - `201` : Utilisateur créé avec succès.
  - `400` : Champs obligatoires manquants ou email déjà utilisé.
  - `500` : Erreur interne.

### Connexion

- **URL** : `/user/login`
- **Méthode** : `POST`
- **Description** : Se connecter en tant qu'utilisateur.
- **Corps de la requête** :
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Réponses** :
  - `200` : Connexion réussie avec le token JWT.
  - `400` : Erreur lors de la connexion.
  - `404` : Utilisateur non trouvé.
  - `501` : Erreur interne.

### Déconnexion

- **URL** : `/user/logout`
- **Méthode** : `POST`
- **Description** : Déconnecter l'utilisateur.
- **Réponses** :
  - `200` : Déconnexion réussie.

### Vérification du Token

- **URL** : `/user/verify-token`
- **Méthode** : `GET`
- **Description** : Vérifier la validité du token JWT.
- **Réponses** :
  - `200` : Token valide.
  - `400` : Token manquant ou mal formé.
  - `401` : Token invalide ou utilisateur non trouvé.

### Ajouter une Information ou un Paramètre Utilisateur (Admin)

- **URL** : `/user/add-info-or-setting`
- **Méthode** : `POST`
- **Description** : Ajouter une information ou un paramètre utilisateur (Admin uniquement).
- **Corps de la requête** :
  ```json
  {
    "userId": "string",
    "type": "string",
    "key": "string",
    "value": "string"
  }
  ```
- **Réponses** :
  - `200` : Information ou paramètre ajouté avec succès.
  - `400` : Champs obligatoires manquants.
  - `403` : Accès interdit.
  - `404` : Utilisateur non trouvé.
  - `500` : Erreur interne.

### Modifier une Information ou un Paramètre Utilisateur

- **URL** : `/user/update-info-or-setting`
- **Méthode** : `POST`
- **Description** : Modifier une information ou un paramètre utilisateur.
- **Corps de la requête** :
  ```json
  {
    "type": "string",
    "key": "string",
    "value": "string"
  }
  ```
- **Réponses** :
  - `200` : Information ou paramètre modifié avec succès.
  - `400` : Champs obligatoires manquants.
  - `404` : Utilisateur ou élément non trouvé.
  - `500` : Erreur interne.

### Supprimer une Information ou un Paramètre Utilisateur (Admin)

- **URL** : `/user/remove-info-or-setting`
- **Méthode** : `POST`
- **Description** : Supprimer une information ou un paramètre utilisateur (Admin uniquement).
- **Corps de la requête** :
  ```json
  {
    "userId": "string",
    "type": "string",
    "key": "string"
  }
  ```
- **Réponses** :
  - `200` : Information ou paramètre supprimé avec succès.
  - `400` : Champs obligatoires manquants.
  - `403` : Accès interdit.
  - `404` : Utilisateur non trouvé.
  - `500` : Erreur interne.

### Récupérer Tous les Utilisateurs (Admin)

- **URL** : `/user/admin/users`
- **Méthode** : `GET`
- **Description** : Récupérer tous les utilisateurs (Admin uniquement).
- **Réponses** :
  - `200` : Liste des utilisateurs.
  - `403` : Accès interdit.
  - `500` : Erreur interne.

### Modifier un Utilisateur (Admin)

- **URL** : `/user/admin/update-user`
- **Méthode** : `POST`
- **Description** : Modifier un utilisateur (Admin uniquement).
- **Corps de la requête** :
  ```json
  {
    "userId": "string",
    "updates": "object"
  }
  ```
- **Réponses** :
  - `200` : Utilisateur modifié avec succès.
  - `400` : Champs obligatoires manquants.
  - `403` : Accès interdit.
  - `404` : Utilisateur non trouvé.
  - `500` : Erreur interne.

### Supprimer un Utilisateur (Admin)

- **URL** : `/user/admin/delete-user`
- **Méthode** : `POST`
- **Description** : Supprimer un utilisateur (Admin uniquement).
- **Corps de la requête** :
  ```json
  {
    "userId": "string"
  }
  ```
- **Réponses** :
  - `200` : Utilisateur supprimé avec succès.
  - `400` : Champs obligatoires manquants.
  - `403` : Accès interdit.
  - `404` : Utilisateur non trouvé.
  - `500` : Erreur interne.

## Endpoints NFT

### Récupérer les NFTs d'un Utilisateur

- **URL** : `/nfts/user/:userId`
- **Méthode** : `GET`
- **Description** : Récupérer les NFTs d'un utilisateur.
- **Réponses** :
  - `200` : Liste des NFTs.
  - `400` : Erreur lors de la récupération des NFTs.

---

Créez un fichier nommé

API_DOCUMENTATION.md

à la racine de votre projet et copiez-y le contenu ci-dessus.
