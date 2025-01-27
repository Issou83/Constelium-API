// services/rssService.js
const Parser = require("rss-parser");
const parser = new Parser();

const feedUrls = [
  "https://coinjournal.net/fr/actualites/feed/",
  "https://fr.cointelegraph.com/rss",
  "https://coinacademy.fr/tag/analyse-crypto/feed/",
  // ... etc. (tu complètes avec tous les flux de la liste)
];

async function fetchRSSFeedItems(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items;
  } catch (error) {
    console.error(`Erreur lors du parsing RSS de ${url}:`, error);
    return [];
  }
}

/**
 * Récupère tous les items de tous les flux
 */
async function fetchAllFeeds() {
  let allItems = [];
  for (const url of feedUrls) {
    const items = await fetchRSSFeedItems(url);
    allItems = allItems.concat(items);
  }
  return allItems;
}

module.exports = { fetchAllFeeds };
