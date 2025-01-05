const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

// Routes utilisateur
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ success: true, message: "Déconnexion réussie" });
});

router.get("/verify-token", userController.verifyToken);

// Récupérer les informations personnelles de l'utilisateur connecté
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur interne lors de la récupération des données." });
  }
});

router.post("/add-info-or-setting", authMiddleware, async (req, res) => {
  const { type, key, value } = req.body;

  if (!key || !value || !type) {
    return res.status(400).json({ error: "Key, value et type sont requis" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    if (type === "info") {
      user.userInfo.push({ key, value });
    } else if (type === "setting") {
      user.userSettings.push({ key, value });
    } else {
      return res.status(400).json({ error: "Type invalide" });
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: "Erreur interne lors de l'ajout" });
  }
});

router.put("/update-info-or-setting", authMiddleware, async (req, res) => {
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
    res.status(500).json({ error: "Erreur interne lors de la mise à jour" });
  }
});

router.delete("/remove-info-or-setting", authMiddleware, async (req, res) => {
  const { type, key } = req.body;

  if (!key || !type) {
    return res.status(400).json({ error: "Key et type sont requis" });
  }

  try {
    const user = await User.findById(req.user._id);
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
    res.status(500).json({ error: "Erreur interne lors de la suppression" });
  }
});

// Routes administrateur
router.get(
  "/admin/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find().select("-password"); // Exclure les mots de passe
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({
        error: "Erreur interne lors de la récupération des utilisateurs.",
      });
    }
  }
);

router.delete(
  "/admin/user/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user)
        return res.status(404).json({ error: "Utilisateur introuvable." });
      res.status(200).json({
        success: true,
        message: "Utilisateur supprimé avec succès.",
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur interne lors de la suppression." });
    }
  }
);

module.exports = router;
