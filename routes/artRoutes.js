const express = require("express");
const router = express.Router();
const artController = require("../controllers/artController");

router.get("/artworks", artController.getArtworks);

module.exports = router;
