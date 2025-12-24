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
    enum: {
      values: ['best-seller', 'coffees', 'shoose', "today's deals"],
      message: 'Category must be one of: best seller, coffes, food, today\'s deals.'
    },
    required: [true, 'Category is required']
  },
  isBestSeller: { type: Boolean, default: false },
  isTodayDeal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.ProductCards || mongoose.model('ProductCards', productCardSchema);
