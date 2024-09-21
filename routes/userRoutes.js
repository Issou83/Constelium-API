const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcrypt");
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
// Comme cette route fait la même chose que le contrôleur, il est préférable d'utiliser le contrôleur pour éviter la redondance
router.post("/register", userController.register);

// LOGIN: Se connecter en tant qu'utilisateur
router.post("/login", userController.login);

// READ: Obtenir tous les utilisateurs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Route pour vérifier le token
router.get("/verify-token", userController.verifyToken);

// READ: Obtenir un utilisateur par ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// UPDATE: Mettre à jour un utilisateur par ID
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

// DELETE: Supprimer un utilisateur par ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

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
