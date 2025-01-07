const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  photo: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
});

// Schéma pour les informations utilisateur (flexible)
const userInfoSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

// Schéma pour les paramètres utilisateur (flexible)
const userSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  products: { type: [productSchema], default: [] },
  userInfo: { type: [userInfoSchema], default: [] }, // Informations dynamiques
  userSettings: { type: [userSettingsSchema], default: [] }, // Paramètres dynamiques
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Gestion des rôles
});

const User = mongoose.model("User", userSchema);

module.exports = User;
