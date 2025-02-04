// services/unsplashService.js
const axios = require("axios");

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_ACCESS_KEY) {
  console.error(
    "La variable d'environnement UNSPLASH_ACCESS_KEY n'est pas définie !"
  );
  process.exit(1);
}

const unsplashApi = axios.create({
  baseURL: "https://api.unsplash.com",
  headers: {
    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
  },
});

/**
 * Recherche des photos en fonction d’un mot-clé
 * @param {string} query Le terme de recherche
 * @param {number} [page=1] Numéro de page
 * @param {number} [per_page=10] Nombre de résultats par page
 * @param {string} [orientation] (optionnel) Orientation de l'image ('landscape', 'portrait', 'squarish')
 */
async function searchPhotos(
  query,
  page = 1,
  per_page = 10,
  orientation = null
) {
  try {
    const params = { query, page, per_page };
    if (orientation) params.orientation = orientation;

    const response = await unsplashApi.get("/search/photos", { params });
    return response.data;
  } catch (error) {
    console.error("Erreur dans searchPhotos :", error.message);
    throw error;
  }
}

/**
 * Récupère les détails d'une photo
 * @param {string} photoId L'ID de la photo
 */
async function getPhoto(photoId) {
  try {
    const response = await unsplashApi.get(`/photos/${photoId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur dans getPhoto :", error.message);
    throw error;
  }
}

/**
 * Récupère des collections d’images
 * @param {number} [page=1] Numéro de page
 * @param {number} [per_page=10] Nombre de collections par page
 */
async function getCollections(page = 1, per_page = 10) {
  try {
    const response = await unsplashApi.get("/collections", {
      params: { page, per_page },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur dans getCollections :", error.message);
    throw error;
  }
}

/**
 * Récupère les photos d'une collection spécifique
 * @param {string} collectionId L'ID de la collection
 * @param {number} [page=1] Numéro de page
 * @param {number} [per_page=10] Nombre de photos par page
 */
async function getCollectionPhotos(collectionId, page = 1, per_page = 10) {
  try {
    const response = await unsplashApi.get(
      `/collections/${collectionId}/photos`,
      { params: { page, per_page } }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur dans getCollectionPhotos :", error.message);
    throw error;
  }
}

module.exports = {
  searchPhotos,
  getPhoto,
  getCollections,
  getCollectionPhotos,
};
