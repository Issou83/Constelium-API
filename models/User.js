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
  role: { type: String, enum: ["user", "admin"], default: "user" },
  products: { type: [productSchema], default: [] },
  userInfo: [
    {
      key: { type: String, required: false },
      value: { type: String, required: false },
    },
  ],
  userSettings: [
    {
      key: { type: String, required: false },
      value: { type: String, required: false },
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
