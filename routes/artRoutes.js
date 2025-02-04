const express = require("express");
const router = express.Router();
const artController = require("../controllers/artController");

// ✅ Vérifier que chaque fonction appelée existe bien dans `artController.js`
if (!artController.searchArtworks) {
  throw new Error(
    "🚨 Erreur : `searchArtworks` n'est pas défini dans `artController.js` !"
  );
}

if (!artController.filterArtworks) {
  throw new Error(
    "🚨 Erreur : `filterArtworks` n'est pas défini dans `artController.js` !"
  );
}

if (!artController.getMuseums) {
  throw new Error(
    "🚨 Erreur : `getMuseums` n'est pas défini dans `artController.js` !"
  );
}

if (!artController.updateArtData) {
  throw new Error(
    "🚨 Erreur : `updateArtData` n'est pas défini dans `artController.js` !"
  );
}

// ✅ Routes sécurisées avec vérification des imports
router.get("/search", artController.searchArtworks);
router.get("/filter", artController.filterArtworks);
router.get("/museums", artController.getMuseums);
router.post("/update-art-data", artController.updateArtData);
// 🔹 Recherche avancée pour Paris Musées
router.get("/paris-filters", artController.getParisMuseesFilters);
router.get("/paris-search", artController.searchParisMusees);

module.exports = router;
