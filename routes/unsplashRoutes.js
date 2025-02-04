// routes/unsplashRoutes.js
const express = require("express");
const router = express.Router();
const unsplashService = require("../services/unsplashService");

// Endpoint pour rechercher des photos
// Exemple d'URL : /unsplash/photos/search?query=art&page=1&per_page=10&orientation=landscape
router.get("/photos/search", async (req, res) => {
  const { query, page, per_page, orientation } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Le paramètre 'query' est requis." });
  }
  try {
    const data = await unsplashService.searchPhotos(
      query,
      page,
      per_page,
      orientation
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la recherche des photos." });
  }
});

// Endpoint pour récupérer une photo par son ID
router.get("/photos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await unsplashService.getPhoto(id);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la photo." });
  }
});

// Endpoint pour récupérer des collections
router.get("/collections", async (req, res) => {
  const { page, per_page } = req.query;
  try {
    const data = await unsplashService.getCollections(page, per_page);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des collections." });
  }
});

// Endpoint pour récupérer les photos d'une collection spécifique
router.get("/collections/:id/photos", async (req, res) => {
  const { id } = req.params;
  const { page, per_page } = req.query;
  try {
    const data = await unsplashService.getCollectionPhotos(id, page, per_page);
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des photos de la collection.",
      });
  }
});

module.exports = router;
