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
  origin: "*", // Autoriser les requêtes depuis cette origine
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Route pour obtenir les logs
app.get("/logs", (req, res) => {
  res.json({ logs });
});

app.use(express.json());
app.use("/user", userRoutes);
app.use("/nfts", nftRoutes);

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
