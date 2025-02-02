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

// 📌 API Wikimedia Commons (Photos & Peintures)
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

// 📌 API Unsplash (Photographies artistiques)
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
    console.error("❌ Erreur Unsplash:", error.response?.data || error.message);
    return [];
  }
};

// 📌 API Pexels (Photographies)
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

// 📌 API Metropolitan Museum of Art (Peintures, Sculptures)
const fetchMetMuseum = async (query) => {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`;
  try {
    const response = await axios.get(url);
    const objectIDs = response.data.objectIDs?.slice(0, 10) || []; // Limite à 10 résultats
    const artworks = await Promise.all(
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
    return artworks;
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

// 📌 API Europeana (Peintures, Sculptures)
const fetchEuropeana = async (query) => {
  const url = `https://api.europeana.eu/record/v2/search.json?wskey=${API_KEYS.europeana}&query=${query}&rows=10`;
  try {
    const response = await axios.get(url);
    return response.data.items.map((art) => ({
      title: art.title[0],
      image: art.edmPreview[0] || "",
      artist: art.dcCreator?.[0] || "Inconnu",
      museum: art.dataProvider[0] || "Europeana",
      source: "Europeana",
    }));
  } catch (error) {
    console.error("❌ Erreur Europeana:", error.message);
    return [];
  }
};

// 📌 API Paris Musées
const fetchParisMusees = async (query) => {
  const url = `https://api.parismusees.paris.fr/api/records/1.0/search?q=${query}&rows=10`;
  try {
    const response = await axios.get(url);
    return response.data.records.map((record) => ({
      title: record.fields?.title || "Sans titre",
      image: record.fields?.illustration?.[0]?.thumbnail_url || "",
      artist: record.fields?.auteur?.join(", ") || "Inconnu",
      museum: "Paris Musées",
      source: "Paris Musées",
    }));
  } catch (error) {
    console.error("❌ Erreur Paris Musées:", error.message);
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
    fetchEuropeana(query),
    fetchParisMusees(query),
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
