const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // On s'assure de récupérer le token après "Bearer"

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    // Utilisation de jsonwebtoken au lieu de jwt-simple
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultSecret"
    );
    const user = await User.findById(decodedToken._id);

    if (!user) {
      return res.status(401).json({ error: "Token invalide" });
    }

    req.user = user; // Ajout de l'utilisateur à la requête
    next();
  } catch (error) {
    res.status(400).json({ error: "Token invalide" });
  }
};

module.exports = authMiddleware;
