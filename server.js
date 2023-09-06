const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('API fonctionne');
});

const users = []; // Simule une base de données en mémoire

app.use(express.json()); // Pour parser le JSON dans les requêtes entrantes

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Vérification simple
  if (!username || !password) {
    return res.status(400).send('Nom d\'utilisateur et mot de passe requis');
  }

  // Simule l'ajout à la base de données
  users.push({ username, password });
  
  res.status(201).send('Inscrit avec succès');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vérification simple
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).send('Non autorisé');
  }

  res.status(200).send('Connecté avec succès');
});


app.listen(port, () => {
  console.log(`Serveur fonctionne sur http://localhost:${port}`);
});
