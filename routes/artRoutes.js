const express = require("express");
const router = express.Router();
const artController = require("../controllers/artController"); // ✅ Vérification de l'import correct

// Recherche d’œuvres par mot-clé (Input)
router.get("/search", artController.searchArtworks);

// Recherche via menus déroulants (musée + artiste)
router.get("/filter", artController.filterArtworks);

// Récupération des musées et artistes stockés en BDD
router.get("/museums", artController.getMuseums);
router.get("/artists", artController.getArtists);

// Mise à jour des artistes et musées en BDD (Appel API pour enrichir la base)
router.post("/update-art-data", artController.updateArtData);

module.exports = router;
