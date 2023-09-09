const express = require('express');
const cors = require('cors'); // Ajoutez cette ligne
const connectDB = require('./db');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const app = express();
const port = 3001;

connectDB();

app.use(cors()); // Utilisez cors comme middleware

app.use(express.json());
app.use('/user', userRoutes);

app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
