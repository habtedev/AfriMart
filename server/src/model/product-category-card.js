// Mongoose model for product card

const mongoose = require('mongoose');

const productCardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: String,
  price: { type: Number },
  offPrice: { type: Number },
  description: { type: String },
  stock: { type: Number, default: 20 },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  sku: { type: String },
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
  isBestSeller: { type: Boolean, default: false },
  isTodayDeal: { type: Boolean, default: false },
  shippingDate: { type: Date },
  shippingPrice: { type: Number },
  shippingPercent: { type: Number },
  color: { type: [String] }, // Optional array of colors
  size: { type: [String] },  // Optional array of sizes
  variants: [
    {
      color: { type: String },
      size: { type: String },
      stock: { type: Number, default: 0 },
      sku: { type: String },
      priceAdjustment: { type: Number }
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.ProductCategoryCard || mongoose.model('ProductCategoryCard', productCardSchema);
