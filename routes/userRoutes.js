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

// Ajouter une information ou un paramètre utilisateur (ADMIN uniquement)
router.post("/add-info-or-setting", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  const { userId, type, key, value } = req.body;
  if (!userId || !key || !value || !type) {
    return res
      .status(400)
      .json({ error: "userId, key, value et type sont requis" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const targetArray = type === "info" ? user.userInfo : user.userSettings;
    targetArray.push({ key, value });

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
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
router.post("/remove-info-or-setting", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }

  const { userId, type, key } = req.body;
  if (!userId || !key || !type) {
    return res.status(400).json({ error: "userId, key et type sont requis" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (type === "info") {
      user.userInfo = user.userInfo.filter((item) => item.key !== key);
    } else if (type === "setting") {
      user.userSettings = user.userSettings.filter((item) => item.key !== key);
    } else {
      return res.status(400).json({ error: "Type invalide" });
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Erreur interne" });
  }
});

// Récupérer les informations de l'utilisateur connecté
router.get("/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclure le mot de passe
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.status(200).json(user);
  } catch (error) {
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
