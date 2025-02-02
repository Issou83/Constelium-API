const mongoose = require("mongoose");
const { Museum } = require("../models/ArtData");
require("dotenv").config();

// Connexion à la base MongoDB
const connectDB = require("../db");

// Liste des musées à insérer
const museumsData = [
  { name: "Wikimedia Commons", source: "Wikimedia Commons API" },
  { name: "Unsplash", source: "Unsplash API" },
  { name: "Pexels", source: "Pexels API" },
  { name: "Metropolitan Museum of Art", source: "Met Museum API" },
  { name: "Cleveland Museum of Art", source: "Cleveland Museum API" },
  { name: "Getty Foundation", source: "Getty Foundation API" },
  { name: "RMN-Grand Palais", source: "RMN API" },
  { name: "Europeana", source: "Europeana API" },
  { name: "Paris Musées", source: "Paris Musées API" },
];

// Fonction pour insérer les musées
const insertMuseums = async () => {
  await connectDB();

  try {
    // Vérifier si la collection contient déjà des données
    const existingMuseums = await Museum.find();
    if (existingMuseums.length > 0) {
      console.log(
        "ℹ️ Les musées existent déjà en BDD. Suppression et réinsertion..."
      );
      await Museum.deleteMany({});
    }

    // Insérer les nouveaux musées
    await Museum.insertMany(museumsData);
    console.log("✅ Liste des musées insérée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion des musées :", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Exécuter l'insertion
insertMuseums();
