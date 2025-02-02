const { searchArtworks } = require("../services/artService");

// 📌 Route pour rechercher des œuvres d'art
exports.searchArtworks = async (req, res) => {
  const { query, mode } = req.query;
  if (!query) {
    return res
      .status(400)
      .json({ error: "Veuillez fournir un paramètre `query`." });
  }

  try {
    const artworks = await searchArtworks(query, mode);
    res.json(artworks);
  } catch (error) {
    console.error("❌ Erreur lors de la recherche d'œuvres :", error.message);
    res.status(500).json({ error: "Erreur serveur." });
  }
};
