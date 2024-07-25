const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String },
  logo: { type: String },
  source: { type: String, enum: ["admin", "user"], required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Product", ProductSchema);
