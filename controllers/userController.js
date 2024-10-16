const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Inscription utilisateur traditionnel
exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'utilisateur" });
  }
};

// Connexion utilisateur traditionnel
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Nom d'utilisateur ou mot de passe incorrect",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Nom d'utilisateur ou mot de passe incorrect",
        });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "defaultSecret",
      { expiresIn: "1h" }
    );

    // Renvoie uniquement les données nécessaires
    const userWithoutPassword = await User.findById(user._id).select(
      "-password"
    );

    res.status(200).json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error.message);
    res.status(500).json({ success: false, message: "Erreur serveur" });
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
      { expiresIn: "1h" }
    );
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la connexion via OAuth" });
  }
};

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Vérifier la validité du token JWT
exports.verifyToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Récupérer le token après 'Bearer'

  if (!token) {
    console.log("Token manquant ou mal formé:", req.headers.authorization);
    return res
      .status(400)
      .json({ success: false, message: "Token manquant ou mal formé" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultSecret"
    );

    // Utiliser async/await au lieu d'un callback pour trouver l'utilisateur
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      console.log("Utilisateur non trouvé avec l'ID du token:", decoded._id);
      return res.status(401).json({
        success: false,
        message: "Token invalide ou utilisateur non trouvé",
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Erreur lors de la vérification du token:", error.message);
    return res.status(400).json({
      success: false,
      message: "Token invalide",
      error: error.message,
    });
  }
};
