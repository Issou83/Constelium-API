const mongoose = require("mongoose");

// ✅ Schéma pour les musées (stockés en BDD)
const MuseumSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  source: { type: String, required: true },
});

const Museum = mongoose.model("Museum", MuseumSchema);

module.exports = { Museum };
