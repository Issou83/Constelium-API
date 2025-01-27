// services/articleGenerator.js
const { fetchAllFeeds } = require("./rssService");
const { generateArticleFromSources } = require("./aiService");
const { generateWeb3Image } = require("./aiImageService");
const Article = require("../models/Article");

// Cette fonction renvoie directement l'article créé ou null
async function createOneArticleFromRSS() {
  // 1) Récupérer tous les flux RSS
  const allItems = await fetchAllFeeds();
  if (!allItems || allItems.length < 3) {
    console.log("Pas assez de sources pour générer un article.");
    return null;
  }

  // 2) On prend 3 items (simpliste). Ou un tri par thème, etc.
  const chosenSources = allItems.slice(0, 3);

  // 3) Génération IA
  const { title, text, isDoubtful } = await generateArticleFromSources(
    chosenSources
  );
  if (isDoubtful || !title || !text) {
    console.log("Impossible de générer un article (doute ou erreur IA).");
    return null;
  }

  // 4) Génération image
  const image = await generateWeb3Image(title);
  if (!image) {
    console.log("Impossible de générer une image (erreur IA).");
    return null;
  }

  // 5) Création dans la base
  const newArticle = new Article({
    title,
    text,
    image,
    status: "standby",
  });
  await newArticle.save();

  console.log(
    `Article créé manuellement: ${newArticle._id} - ${newArticle.title}`
  );
  return newArticle;
}

async function generateScheduledArticles() {
  // 1) Récupération de *tous* les items RSS
  const allItems = await fetchAllFeeds();

  // Filtre sur les articles récents, etc. (optionnel)
  // Implementation possible : prise des items 24h
  // grouping them if needed, etc.

  // Pour faire très simple : on prend par ex. 3 items "random"
  // pour générer 1 article (démonstration).
  // Ou on fait un regroupement plus élaboré.
  if (allItems.length < 3) {
    console.log("Pas assez de sources pour générer un article complet.");
    return;
  }
  const chosenSources = allItems.slice(0, 3); // les 3 premiers

  // 2) Génération IA
  const { title, text, isDoubtful } = await generateArticleFromSources(
    chosenSources
  );
  if (isDoubtful || !title || !text) {
    console.log("Impossible de générer un article (doute ou erreur IA).");
    return;
  }

  // 3) Génération de l’image
  const image = await generateWeb3Image(title);

  // 4) Stockage en DB
  const newArticle = new Article({
    title,
    text,
    image,
    status: "standby",
  });
  await newArticle.save();
  console.log(`Article généré: ${newArticle._id} – titre: ${newArticle.title}`);
}

module.exports = {
  createOneArticleFromRSS,
  generateScheduledArticles,
};
