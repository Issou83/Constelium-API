const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

// CREATE: Ajouter un nouvel utilisateur
router.post("/create", async (req, res) => {
  const newUser = new User(req.body);
  try {
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

// REGISTER: Enregistrer un nouvel utilisateur
router.post("/register", userController.register);

// LOGIN: Se connecter en tant qu'utilisateur
router.post("/login", userController.login);

// Connexion ou inscription via OAuth
router.post("/oauth-login", userController.oauthLogin);

// Deconnxion de l'utilisateur
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

// READ: Obtenir tous les utilisateurs (protégé par authMiddleware)
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).send(users);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

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

// READ: Obtenir un utilisateur par ID (protégé par authMiddleware)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// UPDATE: Mettre à jour un utilisateur par ID (protégé par authMiddleware)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).send();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// DELETE: Supprimer un utilisateur par ID (protégé par authMiddleware)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// UPDATE: Mettre à jour les NFTs associés à un utilisateur (protégé par authMiddleware)
router.put("/updateNFTs/:id", authMiddleware, async (req, res) => {
  try {
    const { selectedNFTs } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { selectedNFTs },
      { new: true }
    );
    if (!user) return res.status(404).send();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Ajouter une information ou un paramètre utilisateur
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

// Modifier une information ou un paramètre utilisateur
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

// Supprimer une information ou un paramètre utilisateur
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

// ROUTES PROTÉGÉES POUR L'ADMINISTRATEUR

// Obtenir tous les utilisateurs (ADMIN uniquement)
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

// Supprimer un utilisateur (ADMIN uniquement)
router.delete(
  "/admin/user/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user)
        return res.status(404).json({ error: "Utilisateur introuvable." });
      res
        .status(200)
        .json({ success: true, message: "Utilisateur supprimé avec succès." });
    } catch (error) {
      res.status(500).json({ error: "Erreur interne lors de la suppression." });
    }
  }
);

module.exports = router;
