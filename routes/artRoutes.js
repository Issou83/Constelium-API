const express = require("express");
const router = express.Router();
const artController = require("../controllers/artController");

router.get("/search", artController.searchArtworks);

module.exports = router;
