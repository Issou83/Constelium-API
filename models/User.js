const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    selectedNFTs: { type: [String], default: [] }  // Ce champ stockera les URLs des NFTs sélectionnés
});

const User = mongoose.model('User', userSchema);

module.exports = User;

