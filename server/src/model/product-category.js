const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    category: {
      type: String,
      enum: ['handcraft', 'home-goods', 'electronics', 'best-seller', 'clothing',],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);