const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token =
    req.cookies.authToken || req.headers.authorization?.split(" ")[1]; // Lire le token depuis le cookie
  console.log("Token reçu :", token);
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

    console.log("Token décodé :", req.cookies?.authToken);

    const user = await User.findById(decodedToken._id);
    if (!user) {
      console.log(
        "Utilisateur non trouvé avec l'ID du token:",
        decodedToken._id
      );
      return res.status(401).json({ error: "Token invalide" });
    }

    req.user = user;
    console.log("Utilisateur connecté avec _id :", req.user._id);
    next();
  } catch (error) {
    console.log("Erreur lors de la vérification du token:", error.message);
    return res
      .status(401)
      .json({ error: "Token invalide", message: error.message });
  }
};

module.exports = authMiddleware;
