// services/rssService.js
const Parser = require("rss-parser");
const parser = new Parser();

const feedUrls = [
  "https://coinjournal.net/fr/actualites/feed/",
  "https://fr.cointelegraph.com/rss",
  "https://coinacademy.fr/tag/analyse-crypto/feed/",
  "https://coinacademy.fr/tag/analyse-nft/feed/",
  "https://coinacademy.fr/actu/gn",
  "https://flipboard.com/topic/fr-nft.rss",
  "https://flux.saynete.com/encart_rss_informatique_emonnaie_fr.xml",
  "https://news.google.com/rss/search?tbm=nws&q=when:24h+nft&oq=nft&scoring=n&hl=fr&gl=FR&ceid=FR:fr",
  "https://news.google.com/rss/search?tbm=nws&q=cryptographie&oq=cryptographie&scoring=n&hl=fr&gl=FR&ceid=FR:fr",
  "https://news.google.com/rss/search?tbm=nws&q=blockchain&oq=blockchain&scoring=n&hl=fr&gl=FR&ceid=FR:fr",
  "https://flipboard.com/topic/fr-cryptographie.rss",
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
