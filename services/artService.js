const axios = require("axios");

const APIs = {
  wikimedia: "https://commons.wikimedia.org/w/api.php",
  metmuseum: "https://collectionapi.metmuseum.org/public/collection/v1",
  cleveland: "https://openaccess-api.clevelandart.org/api/artworks",
  parismusees: "https://apicollections.parismusees.paris.fr/graphql",
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

// 📌 Récupérer les filtres disponibles pour Paris Musées (artistes, musées, types d'œuvres)
async function fetchParisMuseesFilters() {
  const token = process.env.PARIS_MUSEES_KEY;
  if (!token) {
    console.error("❌ Aucun token trouvé pour l'API Paris Musées !");
    return { artists: [], museums: [], types: [] };
  }

  const graphqlQuery = {
    query: `
      {
        artists: taxonomyTermQuery(filter: {conditions: [{field: "vid", value: "auteurs"}]}) {
          entities { name }
        }
        museums: taxonomyTermQuery(filter: {conditions: [{field: "vid", value: "musees"}]}) {
          entities { name }
        }
        types: taxonomyTermQuery(filter: {conditions: [{field: "vid", value: "types_objet"}]}) {
          entities { name }
        }
      }
    `,
  };

  try {
    const response = await axios.post(APIs.parismusees, graphqlQuery, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
    });

    return {
      artists: response.data.data.artists.entities.map((item) => item.name),
      museums: response.data.data.museums.entities.map((item) => item.name),
      types: response.data.data.types.entities.map((item) => item.name),
    };
  } catch (error) {
    console.error(
      "❌ Erreur récupération filtres Paris Musées:",
      error.message
    );
    return { artists: [], museums: [], types: [] };
  }
}

// 📌 Liste statique des musées pour éviter l'erreur 404
const staticMuseums = [
  { name: "Wikimedia Commons", source: "Wikimedia Commons API" },
  { name: "Metropolitan Museum of Art", source: "Met Museum API" },
  { name: "Cleveland Museum of Art", source: "Cleveland Museum API" },
  { name: "Paris Musées", source: "Paris Musées API" },
];

// 📌 Fonction pour récupérer la liste des musées
async function fetchMuseums() {
  try {
    return staticMuseums; // Renvoie la liste statique pour éviter les erreurs
  } catch (error) {
    console.error("❌ Erreur récupération musées :", error.message);
    return [];
  }
}

// 📌 Vérifier que le token de Paris Musées est bien défini
const getParisMuseesToken = () => {
  const token = process.env.PARIS_MUSEES_KEY;
  if (!token) {
    console.error("❌ Aucun token trouvé pour l'API Paris Musées !");
    throw new Error("❌ Erreur : Token Paris Musées manquant !");
  }
  return token;
};

// 📌 Fonction pour récupérer les filtres disponibles pour Paris Musées
async function fetchParisMuseesFilters() {
  try {
    const token = getParisMuseesToken();
    const graphqlQuery = {
      query: `
        {
          artists: taxonomyTermQuery(filter: {conditions: [{field: "vid", value: "auteurs"}]}) {
            entities { name }
          }
          museums: taxonomyTermQuery(filter: {conditions: [{field: "vid", value: "musees"}]}) {
            entities { name }
          }
          types: taxonomyTermQuery(filter: {conditions: [{field: "vid", value: "types_objet"}]}) {
            entities { name }
          }
        }
      `,
    };

    const response = await axios.post(APIs.parismusees, graphqlQuery, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
    });

    if (!response.data.data) throw new Error("Données non disponibles");

    return {
      artists:
        response.data.data.artists?.entities.map((item) => item.name) || [],
      museums:
        response.data.data.museums?.entities.map((item) => item.name) || [],
      types: response.data.data.types?.entities.map((item) => item.name) || [],
    };
  } catch (error) {
    console.error(
      "❌ Erreur récupération filtres Paris Musées:",
      error.message
    );
    return { artists: [], museums: [], types: [] };
  }
}

// 📌 Fonction pour récupérer les œuvres depuis Paris Musées avec filtres
async function fetchParisMusees(query, artist, museum, type) {
  try {
    const token = getParisMuseesToken();
    let conditions = [{ field: "type", value: "oeuvre" }];
    if (query) conditions.push({ field: "title", value: query });
    if (artist) conditions.push({ field: "field_auteur", value: artist });
    if (museum) conditions.push({ field: "field_musee", value: museum });
    if (type) conditions.push({ field: "field_type_objet", value: type });

    const graphqlQuery = {
      query: `
        {
          nodeQuery(filter: { conditions: ${JSON.stringify(conditions)} }) {
            entities {
              entityUuid
              title
              fieldVisuelsPrincipals { entity { vignette } }
              fieldMusee { entity { name } }
              fieldOeuvreAuteurs { entity { name } }
            }
          }
        }
      `,
    };

    const response = await axios.post(APIs.parismusees, graphqlQuery, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
    });

    if (!response.data.data || !response.data.data.nodeQuery) {
      throw new Error("Données non disponibles");
    }

    return response.data.data.nodeQuery.entities.map((item) => ({
      id: item.entityUuid,
      title: item.title || "Sans titre",
      image: item.fieldVisuelsPrincipals?.entity?.vignette || "",
      artist: item.fieldOeuvreAuteurs?.entity?.name || "Inconnu",
      museum: item.fieldMusee?.entity?.name || "Paris Musées",
      source: "Paris Musées",
    }));
  } catch (error) {
    console.error("❌ Erreur Paris Musées:", error.message);
    return [];
  }
}

// 📌 Fonction de recherche pour toutes les API
async function searchAllAPIs(query) {
  const results = await Promise.allSettled([
    fetchWikimedia(query),
    fetchMetMuseum(query, artist, museum, type),
    fetchClevelandMuseum(query),
    fetchParisMusees(query),
  ]);

  return results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((item) => item !== null);
}

// 📌 Fonction pour rechercher dans un mode spécifique
async function searchArtworks(query, mode = "classic", artist, museum, type) {
  return mode === "classic"
    ? searchAllAPIs(query)
    : fetchParisMusees(query, artist, museum, type);
}

module.exports = {
  searchAllAPIs,
  searchArtworks,
  fetchMuseums,
  fetchParisMuseesFilters,
  fetchParisMusees,
};
