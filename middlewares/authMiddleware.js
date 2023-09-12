const jwt = require('jwt-simple');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    try {
        const decodedToken = jwt.decode(token, 'votreSecret');
        const user = await User.findById(decodedToken._id);

        if (!user) {
            return res.status(401).json({ error: 'Token invalide' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token invalide' });
    }
};

module.exports = authMiddleware;


