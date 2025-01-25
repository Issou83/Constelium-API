const express = require("express");
const router = express.Router();
const User = require("../models/User");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// REGISTER: Enregistrer un nouvel utilisateur
router.post("/register", userController.register);

// LOGIN: Se connecter en tant qu'utilisateur
router.post("/login", userController.login);

// Déconnexion de l'utilisateur
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ success: true, message: "Déconnexion réussie" });
});

// Route pour vérifier le token JWT
router.get("/verify-token", userController.verifyToken);

// Ajouter une information ou un paramètre pour tous les utilisateurs (ADMIN uniquement)
router.post("/add-info-or-setting", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Accès interdit : rôle admin requis" });
  }

  const { type, key, value } = req.body;
  if (!key || !value || !type) {
    return res.status(400).json({ error: "key, value et type sont requis" });
  }

  try {
    // Mettre à jour les informations ou paramètres de tous les utilisateurs
    const updateField =
      type === "info"
        ? { $push: { userInfo: { key, value } } }
        : { $push: { userSettings: { key, value } } };

    await User.updateMany({}, updateField);
    res.status(200).json({
      success: true,
      message: "Information ajoutée à tous les utilisateurs",
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'information : ", error);
    res.status(500).json({ error: "Erreur interne" });
  }
});

// Modifier une information ou un paramètre utilisateur (ACCESSIBLE À L'UTILISATEUR)
router.post("/update-info-or-setting", authMiddleware, async (req, res) => {
  const { type, key, value } = req.body;
  if (!key || !value || !type) {
    return res.status(400).json({ error: "Key, value et type sont requis" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const targetArray = type === "info" ? user.userInfo : user.userSettings;
    const item = targetArray.find((item) => item.key === key);

    if (!item) return res.status(404).json({ error: "Élément non trouvé" });

    item.value = value;

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Erreur interne" });
  }
});

// Supprimer une information ou un paramètre utilisateur (ADMIN uniquement)
// Supprimer une information ou un paramètre pour tous les utilisateurs (ADMIN uniquement)
router.post("/remove-info-or-setting", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Accès interdit : rôle admin requis" });
  }

  const { type, key } = req.body;
  if (!key || !type) {
    return res.status(400).json({ error: "key et type sont requis" });
  }

  try {
    // Supprimer les informations ou paramètres de tous les utilisateurs
    const updateField =
      type === "info"
        ? { $pull: { userInfo: { key } } }
        : { $pull: { userSettings: { key } } };

    await User.updateMany({}, updateField);
    res.status(200).json({
      success: true,
      message: "Information supprimée pour tous les utilisateurs",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'information : ", error);
    res.status(500).json({ error: "Erreur interne" });
  }
});

// Recherche d'un utilisateur par son ID (disponible pour les admins et les utilisateurs eux-mêmes)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // Vérifie si l'utilisateur est admin ou s'il demande ses propres informations
    const userIdToFetch = req.params.id;
    if (req.user.role !== "admin" && req.user.id !== userIdToFetch) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Recherche de l'utilisateur par ID
    const user = await User.findOne({ _id: userIdToFetch }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(
      "Erreur lors de la recherche de l'utilisateur :",
      error.message
    );
    res.status(500).json({ error: "Erreur interne" });
  }
});

// Mise à jour des informations utilisateur avec conservation des données existantes et prévention des doublons
router.post("/update", authMiddleware, async (req, res) => {
  try {
    const { userId, updates } = req.body;

    // Validation des paramètres
    if (!userId || !updates) {
      return res.status(400).json({ error: "userId et updates sont requis" });
    }

    // Vérification des permissions
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Récupérer l'utilisateur actuel
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Mise à jour des champs simples (comme username et email)
    if (updates.username) user.username = updates.username;
    if (updates.email) user.email = updates.email;

    // Mise à jour de userSettings
    if (updates.userSettings) {
      updates.userSettings.forEach((newSetting) => {
        const existingSetting = user.userSettings.find(
          (setting) => setting.key === newSetting.key
        );
        if (existingSetting) {
          // Mise à jour de la valeur existante
          existingSetting.value = newSetting.value;
        } else {
          // Ajout uniquement si la clé n'existe pas encore
          if (
            !user.userSettings.some((setting) => setting.key === newSetting.key)
          ) {
            user.userSettings.push(newSetting);
          }
        }
      });
    }

    // Mise à jour de userInfo
    if (updates.userInfo) {
      updates.userInfo.forEach((newInfo) => {
        const existingInfo = user.userInfo.find(
          (info) => info.key === newInfo.key
        );
        if (existingInfo) {
          // Mise à jour de la valeur existante
          existingInfo.value = newInfo.value;
        } else {
          // Ajout uniquement si la clé n'existe pas encore
          if (!user.userInfo.some((info) => info.key === newInfo.key)) {
            user.userInfo.push(newInfo);
          }
        }
      });
    }

    // Sauvegarde des modifications
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    res.status(500).json({ error: "Erreur interne" });
  }
});

// ADMIN: Récupérer tous les utilisateurs
router.get("/admin/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur interne" });
  }
});

// ADMIN: Modifier un utilisateur
router.post("/admin/update-user", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  const { userId, updates } = req.body;
  if (!userId || !updates) {
    return res.status(400).json({ error: "userId et updates sont requis" });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Erreur interne" });
  }
});

// ADMIN: Supprimer un utilisateur
router.post("/admin/delete-user", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId est requis" });
  }

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.status(200).json({ success: true, message: "Utilisateur supprimé" });
  } catch (error) {
    res.status(500).json({ error: "Erreur interne" });
  }
});

module.exports = router;
