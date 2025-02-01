const axios = require("axios");
const { Artist, Museum } = require("../models/ArtData");

// Clés API stockées dans .env
const API_KEYS = {
  unsplash: process.env.UNSPLASH_KEY,
  pexels: process.env.PEXELS_KEY,
  getty: process.env.GETTY_KEY,
  rmn: process.env.RMN_KEY,
  europeana: process.env.EUROPEANA_KEY,
};

// Appel API Wikimedia Commons
const fetchWikimedia = async (query) => {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${query}`;
  try {
    const response = await axios.get(url);
    return response.data.query.search.map((item) => ({
      title: item.title,
      image: `https://commons.wikimedia.org/wiki/Special:FilePath/${item.title.replace(
        / /g,
        "_"
      )}`,
      artist: "Inconnu",
      museum: "Wikimedia Commons",
    }));
  } catch (error) {
    console.error("Erreur Wikimedia:", error.message);
    return [];
  }
};

// Appel API Unsplash
const fetchUnsplash = async (query) => {
  const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${API_KEYS.unsplash}`;
  try {
    const response = await axios.get(url);
    return response.data.results.map((photo) => ({
      title: photo.description || "Sans titre",
      image: photo.urls.small,
      artist: photo.user.name,
      museum: "Unsplash",
    }));
  } catch (error) {
    console.error("Erreur Unsplash:", error.message);
    return [];
  }
};

// Appel API Pexels
const fetchPexels = async (query) => {
  const url = `https://api.pexels.com/v1/search?query=${query}`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: API_KEYS.pexels },
    });
    return response.data.photos.map((photo) => ({
      title: photo.alt,
      image: photo.src.medium,
      artist: "Inconnu",
      museum: "Pexels",
    }));
  } catch (error) {
    console.error("Erreur Pexels:", error.message);
    return [];
  }
};

// Appel API Metropolitan Museum of Art
const fetchMetMuseum = async (query) => {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`;
  try {
    const response = await axios.get(url);
    const objectIDs = response.data.objectIDs.slice(0, 10); // Limite à 10 résultats
    const artworks = await Promise.all(
      objectIDs.map(async (id) => {
        const artResponse = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );
        return {
          title: artResponse.data.title,
          image: artResponse.data.primaryImageSmall,
          artist: artResponse.data.artistDisplayName || "Inconnu",
          museum: "Metropolitan Museum of Art",
        };
      })
    );
    return artworks;
  } catch (error) {
    console.error("Erreur MET:", error.message);
    return [];
  }
};

// Fonction centralisée pour regrouper les résultats
exports.searchArtworks = async (req, res) => {
  const { query } = req.query;
  let results = [];

  // Exécuter toutes les recherches en parallèle
  const allPromises = [
    fetchWikimedia(query),
    fetchUnsplash(query),
    fetchPexels(query),
    fetchMetMuseum(query),
  ];

  try {
    const allResults = await Promise.all(allPromises);
    results = allResults.flat(); // Fusionner les résultats
  } catch (error) {
    console.error("Erreur lors de l'agrégation des résultats:", error.message);
  }

  res.json(results);
};
