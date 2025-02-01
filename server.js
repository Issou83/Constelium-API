const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Ajoutez ceci pour lire les cookies
const connectDB = require("./db");
const nftRoutes = require("./routes/nftRoutes");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const artRoutes = require("./routes/artRoutes"); // Ajout des nouvelles routes
const cron = require("node-cron");
const { generateScheduledArticles } = require("./services/articleGenerator");

require("dotenv").config();

const app = express();
// 🔽 Port ajusté pour Render ou autre hébergeur, sinon fallback sur 3001
const port = process.env.PORT || 3001;
connectDB();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// 🚀 Planification quotidienne des mises à jour (03:00 AM pour artistes et musées, 08:00 AM pour les articles)
cron.schedule("0 3 * * *", async () => {
  console.log("🔄 Mise à jour automatique des artistes et musées...");
  try {
    await updateArtData();
    console.log("✅ Mise à jour réussie !");
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error.message);
  }
});

cron.schedule("0 8 * * *", async () => {
  console.log("📌 Début de la génération automatique d’articles (08h00)...");
  try {
    await generateScheduledArticles();
    console.log("✅ Génération d’articles terminée !");
  } catch (error) {
    console.error(
      "❌ Erreur lors de la génération d’articles :",
      error.message
    );
  }
});

// Planification quotidienne à 08h00 (modifier si besoin)
cron.schedule("0 8 * * *", async () => {
  console.log("Début de la génération automatique d’articles (08h00) ...");
  try {
    await generateScheduledArticles();
    console.log("Fin de la génération");
  } catch (error) {
    console.error("Erreur lors de la génération automatique:", error);
  }
});

app.use(cors(corsOptions));
app.use(cookieParser()); // Middleware pour les cookies
app.use((req, res, next) => {
  req.setTimeout(60000); // Timeout de 60 secondes pour toutes les requêtes
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/nfts", nftRoutes);
app.use("/articles", articleRoutes);
app.use("/art", artRoutes); // Ajout des routes de l'API art

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
