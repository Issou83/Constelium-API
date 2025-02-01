const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  source: { type: String, required: true }, // Ex: "Wikimedia", "Met Museum"
});

const MuseumSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  source: { type: String, required: true },
});

const Artist = mongoose.model("Artist", ArtistSchema);
const Museum = mongoose.model("Museum", MuseumSchema);

module.exports = { Artist, Museum };
