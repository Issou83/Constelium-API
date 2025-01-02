const express = require("express");
const router = express.Router();
const User = require("../models/User");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

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
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
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

module.exports = router;
