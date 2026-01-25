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
    color: { type: String, default: "#ffffff" }, // HEX or CSS class
    shopping: { type: Boolean, default: false },
    size: { type: String, default: "" }, // Optional size field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);