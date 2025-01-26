// routes/articleRoutes.js

const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

// CREATE
router.post("/", articleController.createArticle);

// READ
router.get("/", articleController.getAllArticles);
router.get("/:id", articleController.getArticleById);

// UPDATE
router.put("/:id", articleController.updateArticle);

// DELETE
router.delete("/:id", articleController.deleteArticle);

// PATCH – mise à jour du statut
router.patch("/:id/status", articleController.toggleStatus);

module.exports = router;
