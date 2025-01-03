const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Ajoutez ceci pour lire les cookies
const connectDB = require("./db");
const nftRoutes = require("./routes/nftRoutes");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();
const port = 3001;

connectDB();

const corsOptions = {
  origin: ["https://constelium.netlify.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser()); // Middleware pour les cookies
app.use(express.json());

app.use("/user", userRoutes);
app.use("/nfts", nftRoutes);

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
