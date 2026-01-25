require('dotenv').config();
const mongoose = require('mongoose');
const ProductCard = require('../model/product-category-card');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in .env');
  await mongoose.connect(uri);
  const product = await ProductCard.create({
    _id: '6950343d4ffe80b187208ba0',
    title: 'Test Product',
    image: '/images/test-product.jpg',
    category: 'electronics',
    price: 99.99,
    description: 'A test product for debugging.',
    stock: 10
  });
  console.log('Seeded product:', product);
  await mongoose.disconnect();
}

seed().catch(console.error);
