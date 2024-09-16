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
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "defaultSecret"
    );
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
};

// Connexion ou inscription via OAuth
exports.oauthLogin = async (req, res) => {
  const { email, name } = req.body; // Données récupérées via OAuth

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Si l'utilisateur n'existe pas, on le crée
      user = new User({
        username: name, // Utiliser le nom d'utilisateur récupéré via OAuth
        email,
      });
      await user.save();
    }

    // Génération d'un token JWT pour l'utilisateur OAuth
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "defaultSecret"
    );
    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la connexion via OAuth" });
  }
};
