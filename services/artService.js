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

async function fetchWikimedia(query) {
  const params = {
    action: "query",
    format: "json",
    prop: "imageinfo",
    generator: "search",
    gsrsearch: query,
    gsrlimit: 10,
    iiprop: "url",
  };

  const response = await axios.get(APIs.wikimedia, { params });
  return response.data?.query?.pages || [];
}

async function fetchUnsplash(query) {
  const response = await axios.get(APIs.unsplash, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}` },
    params: { query, per_page: 10 },
  });
  return response.data?.results || [];
}

async function fetchPexels(query) {
  const response = await axios.get(APIs.pexels, {
    headers: { Authorization: process.env.PEXELS_API_KEY },
    params: { query, per_page: 10 },
  });
  return response.data?.photos || [];
}

async function fetchMetMuseum(query) {
  const response = await axios.get(`${APIs.metmuseum}/search`, {
    params: { q: query, hasImages: true },
  });

  const objectIDs = response.data.objectIDs?.slice(0, 10) || [];
  const artworks = await Promise.all(
    objectIDs.map(async (id) => {
      const res = await axios.get(`${APIs.metmuseum}/objects/${id}`);
      return res.data;
    })
  );

  return artworks;
}

async function fetchCleveland(query) {
  const response = await axios.get(APIs.cleveland, {
    params: { q: query, limit: 10 },
  });
  return response.data.data || [];
}

async function fetchEuropeana(query) {
  const response = await axios.get(APIs.europeana, {
    params: { wskey: process.env.EUROPEANA_API_KEY, query, rows: 10 },
  });
  return response.data.items || [];
}

async function fetchParisMusees(query) {
  const response = await axios.get(APIs.parismusees, {
    params: { title: query, per_page: 10 },
  });
  return response.data.data || [];
}

async function searchAllAPIs(query) {
  const results = await Promise.allSettled([
    fetchWikimedia(query),
    fetchUnsplash(query),
    fetchPexels(query),
    fetchMetMuseum(query),
    fetchCleveland(query),
    fetchEuropeana(query),
    fetchParisMusees(query),
  ]);

  return results.map((result) =>
    result.status === "fulfilled" ? result.value : []
  );
}

module.exports = { searchAllAPIs };
