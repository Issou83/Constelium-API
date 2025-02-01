require("dotenv").config();
const axios = require("axios");

const APIs = {
  wikimedia: "https://commons.wikimedia.org/w/api.php",
  unsplash: "https://api.unsplash.com/search/photos",
  pexels: "https://api.pexels.com/v1/search",
  metmuseum: "https://collectionapi.metmuseum.org/public/collection/v1",
  cleveland: "https://openaccess-api.clevelandart.org/api/artworks",
  getty: "https://data.getty.edu/",
  europeana: "https://api.europeana.eu/record/v2/search.json",
  parismusees: "https://api.parismusees.paris.fr/api/v1/works",
};

async function fetchFromAPI(apiName, query, filters) {
  if (filters.api && filters.api !== apiName) return []; // Si un filtre API est appliqué, on ignore les autres

  let response;
  switch (apiName) {
    case "wikimedia":
      response = await axios.get(APIs.wikimedia, {
        params: {
          action: "query",
          format: "json",
          prop: "imageinfo",
          gsrsearch: query,
          gsrlimit: 10,
          iiprop: "url",
        },
      });
      return response.data?.query?.pages || [];

    case "unsplash":
      response = await axios.get(APIs.unsplash, {
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}` },
        params: { query, per_page: 10 },
      });
      return response.data?.results || [];

    case "pexels":
      response = await axios.get(APIs.pexels, {
        headers: { Authorization: process.env.PEXELS_API_KEY },
        params: { query, per_page: 10 },
      });
      return response.data?.photos || [];

    case "metmuseum":
      response = await axios.get(`${APIs.metmuseum}/search`, {
        params: { q: query, hasImages: true },
      });
      const objectIDs = response.data.objectIDs?.slice(0, 10) || [];
      return await Promise.all(
        objectIDs.map(
          async (id) =>
            (
              await axios.get(`${APIs.metmuseum}/objects/${id}`)
            ).data
        )
      );

    default:
      return [];
  }
}

async function searchAllAPIs(query, filters) {
  const results = await Promise.allSettled([
    fetchFromAPI("wikimedia", query, filters),
    fetchFromAPI("unsplash", query, filters),
    fetchFromAPI("pexels", query, filters),
    fetchFromAPI("metmuseum", query, filters),
  ]);

  return results.map((result) =>
    result.status === "fulfilled" ? result.value : []
  );
}

module.exports = { searchAllAPIs };
