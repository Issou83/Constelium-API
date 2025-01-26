// models/Article.js
const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String, // on peut stocker l'URL de l'image générée
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["standby", "validate"],
    default: "standby",
  },
});

module.exports = mongoose.model("Article", ArticleSchema);
