const { searchAllAPIs } = require("../services/artService");

exports.getArtworks = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res
        .status(400)
        .json({ error: "Veuillez entrer un mot-clé de recherche." });
    }

    const artworks = await searchAllAPIs(query);

    res.json({ artworks });
  } catch (error) {
    console.error("Erreur lors de la récupération des œuvres:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
