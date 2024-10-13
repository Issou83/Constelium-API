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
  origin: "*", // Autoriser les requêtes depuis cette origine spécifique
  methods: ["GET", "POST", "PUT", "DELETE", "UPDATE"], // Définir les méthodes HTTP autorisées
  credentials: true, // Autoriser l'envoi de cookies, le cas échéant
};
app.use(cors(corsOptions));

app.use(express.json());

let logs = []; // Variable pour stocker les logs

// Middleware pour capturer les logs
app.use((req, res, next) => {
  logs.push(`Request to ${req.url} at ${new Date().toISOString()}`);
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
