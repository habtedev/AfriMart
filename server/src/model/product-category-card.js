const mongoose = require("mongoose");

const productCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'clothing',
        'electronics',
        'handcraft',
        'home-goods'
      ],
      required: true,
    },
    price: { type: Number, required: true },
    description: { type: String },
    stock: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductCard", productCardSchema);
