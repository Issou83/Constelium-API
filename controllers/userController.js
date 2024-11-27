// userController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Inscription utilisateur traditionnel
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifier si tous les champs obligatoires sont présents
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Champs obligatoires manquants" });
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // Hasher le mot de passe avant de l'enregistrer
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer un nouvel utilisateur avec le modèle défini
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      products: [], // Initialise le champ "products" comme un tableau vide
    });

    await newUser.save();

    // Créer un token sans expiration pour l'utilisateur
    const token = jwt.sign(
      { _id: newUser._id },
      process.env.JWT_SECRET || "defaultSecret"
    );

    // Répondre avec le token pour éviter un nouveau login
    res.status(201).json({ message: "Utilisateur créé avec succès", token });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    res
      .status(500)
      .json({ error: "Erreur interne lors de la création de l'utilisateur" });
  }
};

// Connexion utilisateur traditionnel
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "1h" }
    );
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(501).json({ error: "Erreur lors de la connexion" });
  }
};

// authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    console.log(
      "En-tête Authorization incorrect ou absent:",
      authorizationHeader
    );
    return res.status(400).json({ error: "Token manquant ou mal formé" });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    console.log("Token absent après 'Bearer'");
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultSecret"
    );
    console.log("Token décodé avec succès:", decodedToken);

    const user = await User.findById(decodedToken._id);

    if (!user) {
      console.log(
        "Utilisateur non trouvé avec l'ID du token:",
        decodedToken._id
      );
      return res.status(401).json({ error: "Token invalide" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Erreur lors de la vérification du token:", error.message);
    return res
      .status(400)
      .json({ error: "Token invalide", message: error.message });
  }
};

module.exports = authMiddleware;
