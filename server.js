const express = require("express");
const cors = require("cors"); // Ajoutez cette ligne
const connectDB = require("./db");
const nftRoutes = require("./routes/nftRoutes"); // Nouvel import
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const app = express();
const port = 3001;

connectDB();

app.use(cors()); // Utilisez cors comme middleware

app.use(express.json());
app.use("/user", userRoutes);
app.use("/nfts", nftRoutes); // Nouvelle route pour les NFTs

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
