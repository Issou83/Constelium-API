const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  // On vérifie que l'en-tête Authorization contient bien "Bearer" suivi du token
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(400).json({ error: "Token manquant ou mal formé" });
  }

  const token = authorizationHeader.split(" ")[1]; // On s'assure de récupérer le token après "Bearer"

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    // Utilisation de jsonwebtoken pour vérifier et décoder le token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultSecret"
    );
    const user = await User.findById(decodedToken._id);

    if (!user) {
      return res.status(401).json({ error: "Token invalide" });
    }

    req.user = user; // Ajout de l'utilisateur à la requête pour les prochaines étapes
    next();
  } catch (error) {
    res.status(400).json({ error: "Token invalide", message: error.message }); // Ajout du message d'erreur pour plus de détails
  }
};

module.exports = authMiddleware;
