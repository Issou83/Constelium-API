// routes/articleRoutes.js

const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

// CREATE
router.post("/", articleController.createArticle);

// NOUVELLE ROUTE : générer un article immédiatement
router.post("/generate-now", articleController.generateNow);

// READ – tous les articles
router.get("/", articleController.getAllArticles);

// READ – un article par ID
router.get("/:id", articleController.getArticleById);

// UPDATE
router.put("/:id", articleController.updateArticle);

// DELETE
router.delete("/:id", articleController.deleteArticle);

// PATCH – changer le statut (standby <-> validate)
router.patch("/:id/status", articleController.toggleStatus);

// POST – régénérer un article
router.post("/:id/regenerate", articleController.regenerateArticle);

module.exports = router;
