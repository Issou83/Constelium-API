const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware d'authentification
const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.authToken; // Lire le token depuis le cookie

  if (!token) {
    console.log("Token manquant");
    return res.status(401).json({ error: "Accès non autorisé" });
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
      .status(401)
      .json({ error: "Token invalide", message: error.message });
  }
};

// Middleware pour vérifier le rôle administrateur
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit." });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
