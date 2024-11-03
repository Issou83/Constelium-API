const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const nftRoutes = require("./routes/nftRoutes");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const app = express();
const port = 3001;

connectDB();

// Configuration du middleware CORS pour autoriser les requêtes depuis le front-end local
const corsOptions = {
  origin: ["http://localhost:5173"], // Spécifier les origines autorisées
  methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes HTTP autorisées
  allowedHeaders: ["Content-Type", "Authorization"], // En-têtes autorisés
  credentials: true, // Autoriser les cookies et en-têtes sensibles
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Répondre aux requêtes préflight (OPTIONS)

// Modification des headers de sécurité
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(express.json());

let logs = []; // Variable pour stocker les logs

// Middleware pour capturer les logs
app.use((req, res, next) => {
  console.log = function (message) {
    logs.push(message); // Stocker chaque log
    process.stdout.write(message + "\n"); // Afficher dans la console
  };
  next();
});

app.use("/user", userRoutes);
app.use("/nfts", nftRoutes);

// Route pour obtenir les logs
app.get("/logs", (req, res) => {
  res.json({ logs });
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
