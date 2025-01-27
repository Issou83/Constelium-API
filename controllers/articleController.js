// controllers/articleController.js

const Article = require("../models/Article");

// **SI** tu as d’autres imports, on les garde ici :
const { fetchAllFeeds } = require("../services/rssService");
const { generateArticleFromSources } = require("../services/aiService");
const { generateWeb3Image } = require("../services/aiImageService");

/**
 * CREATE – Créer un nouvel article
 */
exports.createArticle = async (req, res) => {
  try {
    const { title, text, image } = req.body;
    const newArticle = new Article({ title, text, image });
    const savedArticle = await newArticle.save();
    return res.status(201).json(savedArticle);
  } catch (error) {
    console.error("Erreur createArticle:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * READ – Récupérer tous les articles
 */
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Erreur getAllArticles:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * READ – Récupérer un article par ID
 */
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    return res.status(200).json(article);
  } catch (error) {
    console.error("Erreur getArticleById:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * UPDATE – Mettre à jour un article
 */
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, image, status } = req.body;

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { title, text, image, status },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.status(200).json(updatedArticle);
  } catch (error) {
    console.error("Erreur updateArticle:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE – Supprimer un article
 */
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Erreur deleteArticle:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH – Changer le statut (standby <-> validate)
 */
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // { status: 'validate' } ou 'standby'

    if (!["standby", "validate"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.status(200).json(updatedArticle);
  } catch (error) {
    console.error("Erreur toggleStatus:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * REGENERATE – Relancer la génération IA pour un article
 */
exports.regenerateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Vérifier si l'article existe
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // 2) Récupérer des sources RSS (ou la logique que tu as déjà)
    const allItems = await fetchAllFeeds();
    // Vérif: si allItems est vide, on évite le crash
    if (!allItems || !Array.isArray(allItems) || allItems.length < 3) {
      return res
        .status(400)
        .json({ error: "Pas assez de sources pour régénérer" });
    }

    // 3) Génération du nouveau titre + texte IA
    // (ici, on choisit 3 items, ou ta propre logique plus complexe)
    const chosenSources = allItems.slice(0, 3);
    const { title, text, isDoubtful } = await generateArticleFromSources(
      chosenSources
    );

    if (isDoubtful || !title || !text) {
      return res.status(400).json({
        error: "Impossible de régénérer (information douteuse ou erreur IA)",
      });
    }

    // 4) Génération de l’image
    const image = await generateWeb3Image(title);
    if (!image) {
      return res
        .status(400)
        .json({ error: "Impossible de générer une image (erreur IA)" });
    }

    // 5) Mettre à jour l'article
    article.title = title;
    article.text = text;
    article.image = image;
    article.status = "standby"; // repasse en standby
    await article.save();

    // 6) Réponse
    return res.status(200).json(article);
  } catch (error) {
    console.error("Erreur regenerateArticle:", error);
    return res.status(500).json({ error: error.message });
  }
};
