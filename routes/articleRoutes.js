// routes/articleRoutes.js

const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const authMiddleware = require("../middlewares/authMiddleware");

// CREATE
router.post("/", articleController.createArticle);

// READ
router.get("/", articleController.getAllArticles);

// READ by ID
router.get("/:id", articleController.getArticleById);

// UPDATE
router.put("/:id", articleController.updateArticle);

// DELETE
router.delete("/:id", articleController.deleteArticle);

// PATCH – mise à jour du statut
router.patch("/:id/status", articleController.toggleStatus);

// POST – régénérer un article
router.post(
  "/:id/regenerate",
  authMiddleware,
  articleController.regenerateArticle
);

module.exports = router;
