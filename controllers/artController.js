const axios = require("axios");
const { Museum } = require("../models/ArtData");

// Clés API stockées dans .env
const API_KEYS = {
  unsplash: process.env.UNSPLASH_KEY,
  pexels: process.env.PEXELS_KEY,
  getty: process.env.GETTY_KEY,
  rmn: process.env.RMN_KEY,
  europeana: process.env.EUROPEANA_KEY,
};

// 📌 API Wikimedia Commons
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
      source: "Wikimedia Commons",
    }));
  } catch (error) {
    console.error("❌ Erreur Wikimedia:", error.message);
    return [];
  }
};

// 📌 API Unsplash
const fetchUnsplash = async (query) => {
  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=10`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Client-ID ${API_KEYS.unsplash}` },
    });

    return response.data.results.map((photo) => ({
      title: photo.description || "Sans titre",
      image: photo.urls.small,
      artist: photo.user.name,
      artist_profile: photo.user.links.html,
      museum: "Unsplash",
      source: "Unsplash",
    }));
  } catch (error) {
    console.error("❌ Erreur Unsplash:", error.message);
    return [];
  }
};

// 📌 API Pexels
const fetchPexels = async (query) => {
  const url = `https://api.pexels.com/v1/search?query=${query}&per_page=10`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: API_KEYS.pexels },
    });

    return response.data.photos.map((photo) => ({
      title: photo.alt,
      image: photo.src.medium,
      artist: "Inconnu",
      museum: "Pexels",
      source: "Pexels",
    }));
  } catch (error) {
    console.error("❌ Erreur Pexels:", error.message);
    return [];
  }
};

// 📌 API Metropolitan Museum of Art
const fetchMetMuseum = async (query) => {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`;
  try {
    const response = await axios.get(url);
    const objectIDs = response.data.objectIDs?.slice(0, 10) || [];
    return await Promise.all(
      objectIDs.map(async (id) => {
        const artResponse = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );
        return {
          title: artResponse.data.title,
          image: artResponse.data.primaryImageSmall || "",
          artist: artResponse.data.artistDisplayName || "Inconnu",
          museum: "Metropolitan Museum of Art",
          source: "Metropolitan Museum",
        };
      })
    );
  } catch (error) {
    console.error("❌ Erreur MET:", error.message);
    return [];
  }
};

// 📌 API Cleveland Museum of Art
const fetchClevelandMuseum = async (query) => {
  const url = `https://openaccess-api.clevelandart.org/api/artworks/?q=${query}&limit=10`;
  try {
    const response = await axios.get(url);
    return response.data.data.map((art) => ({
      title: art.title,
      image: art.images?.web?.url || "",
      artist:
        art.creators?.map((creator) => creator.description).join(", ") ||
        "Inconnu",
      museum: "Cleveland Museum of Art",
      source: "Cleveland Museum",
    }));
  } catch (error) {
    console.error("❌ Erreur Cleveland Museum:", error.message);
    return [];
  }
};

// 📌 API Getty Foundation
const fetchGetty = async (query) => {
  const url = `https://api.getty.edu/v1/search?apikey=${API_KEYS.getty}&query=${query}`;
  try {
    const response = await axios.get(url);
    return response.data.items.map((art) => ({
      title: art.title || "Sans titre",
      image: art.image_url || "",
      artist: art.creator || "Inconnu",
      museum: "Getty Foundation",
      source: "Getty Foundation",
    }));
  } catch (error) {
    console.error("❌ Erreur Getty:", error.message);
    return [];
  }
};

// 📌 Fonction centralisée pour regrouper tous les résultats
exports.searchArtworks = async (req, res) => {
  const { query } = req.query;
  let results = [];

  const allPromises = [
    fetchWikimedia(query),
    fetchUnsplash(query),
    fetchPexels(query),
    fetchMetMuseum(query),
    fetchClevelandMuseum(query),
    fetchGetty(query),
  ];

  try {
    const allResults = await Promise.all(allPromises);
    results = allResults.flat();
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'agrégation des résultats:",
      error.message
    );
  }

  res.json(results);
};

// 📌 Récupération des musées stockés en BDD
exports.getMuseums = async (req, res) => {
  try {
    const museums = await Museum.find();
    res.json(museums);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération musées" });
  }
};
