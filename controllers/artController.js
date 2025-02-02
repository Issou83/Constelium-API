const { searchAllAPIs } = require("../services/artService");

// 📌 Route pour rechercher des œuvres dans les 4 API
exports.searchArtworks = async (req, res) => {
  if (!req.query.query) {
    return res
      .status(400)
      .json({ error: "Veuillez fournir un paramètre `query`." });
  }

  try {
    const artworks = await searchAllAPIs(req.query.query);
    res.json(artworks);
  } catch (error) {
    console.error("❌ Erreur lors de la recherche d'œuvres :", error.message);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
