const axios = require("axios");

const APIs = {
  wikimedia: "https://commons.wikimedia.org/w/api.php",
  metmuseum: "https://collectionapi.metmuseum.org/public/collection/v1",
  cleveland: "https://openaccess-api.clevelandart.org/api/artworks",
  parismusees: "https://api.parismusees.paris.fr/api/v1/works",
};

// 📌 Convertir les URLs de Wikimedia en images exploitables
const formatWikimediaImageUrl = (title) => {
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${title.charAt(
    0
  )}/${title.replace(/ /g, "_")}/800px-${title.replace(/ /g, "_")}.jpg`;
};

// 📌 Fonction pour récupérer les œuvres depuis Wikimedia Commons
async function fetchWikimedia(query) {
  try {
    const response = await axios.get(APIs.wikimedia, {
      params: {
        action: "query",
        format: "json",
        list: "search",
        srsearch: query,
      },
    });

    return response.data.query.search.map((item) => ({
      id: item.pageid,
      title: item.title,
      image: formatWikimediaImageUrl(item.title),
      artist: "Inconnu",
      museum: "Wikimedia Commons",
      source: "Wikimedia Commons",
    }));
  } catch (error) {
    console.error("❌ Erreur Wikimedia:", error.message);
    return [];
  }
}

// 📌 Fonction pour récupérer les œuvres depuis le Metropolitan Museum of Art
async function fetchMetMuseum(query) {
  try {
    const response = await axios.get(`${APIs.metmuseum}/search`, {
      params: { q: query, hasImages: true },
    });

    const objectIDs = response.data.objectIDs?.slice(0, 10) || [];
    return await Promise.all(
      objectIDs.map(async (id) => {
        const artResponse = await axios.get(`${APIs.metmuseum}/objects/${id}`);
        const imageUrl = artResponse.data.primaryImage || "";

        // ✅ Exclure les entrées sans image
        if (!imageUrl) return null;

        return {
          id: artResponse.data.objectID,
          title: artResponse.data.title,
          image: imageUrl,
          artist: artResponse.data.artistDisplayName || "Inconnu",
          museum: artResponse.data.repository || "Metropolitan Museum of Art",
          source: "Metropolitan Museum of Art",
        };
      })
    );
  } catch (error) {
    console.error("❌ Erreur MET:", error.message);
    return [];
  }
}

// 📌 Fonction pour récupérer les œuvres depuis le Cleveland Museum of Art
async function fetchClevelandMuseum(query) {
  try {
    const response = await axios.get(APIs.cleveland, {
      params: { q: query, limit: 10 },
    });

    return response.data.data.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.images?.web?.url || "",
      artist: item.creators?.[0]?.description || "Inconnu",
      museum: "Cleveland Museum of Art",
      source: "Cleveland Museum of Art",
    }));
  } catch (error) {
    console.error("❌ Erreur Cleveland Museum:", error.message);
    return [];
  }
}

// 📌 Fonction pour récupérer les œuvres depuis Paris Musées
async function fetchParisMusees(query) {
  try {
    const response = await axios.get(APIs.parismusees, {
      params: { q: query },
    });

    return response.data.records.map((item) => ({
      id: item.recordid,
      title: item.fields?.title || "Sans titre",
      image: item.fields?.illustration?.[0]?.thumbnail_url || "",
      artist: item.fields?.auteur?.join(", ") || "Inconnu",
      museum: "Paris Musées",
      source: "Paris Musées",
    }));
  } catch (error) {
    console.error("❌ Erreur Paris Musées:", error.message);
    return [];
  }
}

// 📌 Fonction pour rechercher dans toutes les API et harmoniser les données
async function searchAllAPIs(query) {
  const results = await Promise.allSettled([
    fetchWikimedia(query),
    fetchMetMuseum(query),
    fetchClevelandMuseum(query),
    fetchParisMusees(query),
  ]);

  return results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((item) => item !== null); // Supprime les entrées vides
}

module.exports = { searchAllAPIs };
