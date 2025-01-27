// routes/articleRoutes.js

const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// CREATE
router.post("/", authMiddleware, articleController.createArticle);

// READ
router.get("/", authMiddleware, articleController.getAllArticles);
router.get("/:id", authMiddleware, articleController.getArticleById);

// UPDATE
router.put("/:id", authMiddleware, articleController.updateArticle);

// DELETE
router.delete("/:id", authMiddleware, articleController.deleteArticle);

// PATCH – mise à jour du statut
router.patch("/:id/status", authMiddleware, articleController.toggleStatus);

module.exports = router;
