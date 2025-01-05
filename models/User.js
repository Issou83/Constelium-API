const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  photo: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  products: { type: [productSchema], default: [] },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
