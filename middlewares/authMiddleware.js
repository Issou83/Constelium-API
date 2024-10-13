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

    req.user = user; // Ajout de l'utilisateur à la requête pour les prochaines étapes
    next();
  } catch (error) {
    console.log("Erreur lors de la vérification du token:", error.message);
    return res
      .status(400)
      .json({ error: "Token invalide", message: error.message });
  }
};

module.exports = authMiddleware;
