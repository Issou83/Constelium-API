const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Ajoutez ceci pour lire les cookies
const connectDB = require("./db");
const nftRoutes = require("./routes/nftRoutes");
const userRoutes = require("./routes/userRoutes");
// const articleRoutes = require("./routes/articleRoutes");
require("dotenv").config();

const app = express();
const port = 3001;

connectDB();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser()); // Middleware pour les cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/nfts", nftRoutes);
// app.use("/api/articles", articleRoutes);

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
