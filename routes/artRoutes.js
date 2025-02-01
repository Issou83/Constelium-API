const express = require("express");
const router = express.Router();
const artController = require("../controllers/artController");

router.get("/search", artController.searchArtworks);
router.get("/museums", artController.getMuseums);
router.get("/artists", artController.getArtists);
router.post("/update-art-data", artController.updateArtData);

module.exports = router;
