const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Cette route simule la récupération des NFTs pour un utilisateur donné.
// Vous pouvez l'ajuster en fonction de vos besoins réels (par ex. communiquer avec une blockchain ou une autre base de données).
router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        // Logique pour récupérer les NFTs de l'utilisateur
        const nfts = [
            // Exemple de données, à remplacer par vos données réelles
            { imageUrl: "url1" },
            { imageUrl: "url2" }
        ];
        res.status(200).send(nfts);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
