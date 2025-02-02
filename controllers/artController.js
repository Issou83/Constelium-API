const { searchAllAPIs } = require("../services/artService");

const {
  fetchParisMuseesFilters,
  fetchParisMusees,
} = require("../services/artService");

// 📌 Route pour récupérer les filtres Paris Musées
exports.getParisMuseesFilters = async (req, res) => {
  try {
    const filters = await fetchParisMuseesFilters();
    res.json(filters);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération filtres" });
  }
};

// 📌 Route pour rechercher des œuvres Paris Musées avec filtres
exports.searchParisMusees = async (req, res) => {
  const { query, artist, museum, type } = req.query;
  try {
    const artworks = await fetchParisMusees(query, artist, museum, type);
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: "Erreur recherche Paris Musées" });
  }
};

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
