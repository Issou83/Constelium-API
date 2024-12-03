const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Inscription utilisateur traditionnel
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
    res.status(201).json({ message: "Utilisateur créé avec succès" });
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
      process.env.JWT_SECRET || "defaultSecret"
      // ,
      // { expiresIn: "1h" }
    );
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(501).json({ error: "Erreur lors de la connexion" });
  }
};

// Connexion ou inscription via OAuth
exports.oauthLogin = async (req, res) => {
  const { email, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name,
        email,
      });
      await user.save();
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "7d" }
    );
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la connexion via OAuth" });
  }
};

// Vérifier la validité du token JWT
exports.verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Récupérer le token après 'Bearer'

  if (!token) {
    console.log("Token manquant ou mal formé");
    return res
      .status(400)
      .json({ success: false, message: "Token manquant ou mal formé" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultSecret"
    );
    console.log("Token décodé:", decoded);

    User.findById(decoded._id, (err, user) => {
      if (err || !user) {
        console.log(
          "Utilisateur non trouvé pour l'ID décodé:",
          decoded._id,
          "Erreur:",
          err
        );
        return res.status(401).json({
          success: false,
          message: "Token invalide ou utilisateur non trouvé",
        });
      }
      res.status(200).json({ success: true, user });
    });
  } catch (error) {
    console.log("Erreur lors de la vérification du token:", error.message);
    return res.status(400).json({
      success: false,
      message: "Token invalide",
      error: error.message,
    });
  }
};
