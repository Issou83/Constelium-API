// controllers/articleController.js

const Article = require("../models/Article");

// CREATE – Créer un nouvel article
exports.createArticle = async (req, res) => {
  try {
    const { title, text, image } = req.body;
    const newArticle = new Article({ title, text, image });
    const savedArticle = await newArticle.save();
    return res.status(201).json(savedArticle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// READ – Récupérer tous les articles
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    return res.status(200).json(articles);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// READ – Récupérer un article par ID
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    return res.status(200).json(article);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE – Mettre à jour un article
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, text, image, status } = req.body;

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { title, text, image, status },
      { new: true } // renvoie l'article après mise à jour
    );

    if (!updatedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.status(200).json(updatedArticle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// DELETE – Supprimer un article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }
    return res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// PATCH – Changer le statut (standby/validate)
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // exemple : { status: 'validate' }

    // On vérifie que le status est bien dans l'énum
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
    return res.status(500).json({ error: error.message });
  }
};
