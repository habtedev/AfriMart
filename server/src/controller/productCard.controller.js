

const ProductCard = require('../model/productCard.model');

// Helper: Validate Cloudinary image URL
function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.startsWith('https://res.cloudinary.com/');
}

// Create a new product card
exports.createProductCard = async (req, res) => {
  try {
    let data = req.body;
    // If image was uploaded, set image field to Cloudinary URL
    if (req.file && req.file.path) {
      data = { ...data, image: req.file.path };
    } else if (data.image && !isCloudinaryUrl(data.image)) {
      return res.status(400).json({ error: 'Image URL must be a valid Cloudinary URL.' });
    }
    const product = new ProductCard(data);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({
      error: err.message || 'Unknown error',
      details: err.errors || err
    });
  }
};

// Get all product cards, with optional filters for category, best seller, today deals
exports.getProductCards = async (req, res) => {
  try {
    const { category, bestSeller, todayDeal } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (bestSeller === 'true') filter.isBestSeller = true;
    if (todayDeal === 'true') filter.isTodayDeal = true;
    const products = await ProductCard.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Unknown error',
      details: err.errors || err
    });
  }
};

// Get a single product card by ID
exports.getProductCardById = async (req, res) => {
  try {
    const product = await ProductCard.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Add mock/optional fields for frontend compatibility
    const detailedProduct = {
      _id: product._id,
      title: product.title,
      image: product.image,
      price: product.price,
      originalPrice: product.offPrice || undefined,
      description: product.description || 'No description provided.',
      stock: product.stock !== undefined ? product.stock : 20, // fallback
      rating: product.rating !== undefined ? product.rating : 4.5,
      reviewCount: product.reviewCount !== undefined ? product.reviewCount : 0,
      sku: product.sku || product._id,
      category: product.category,
      createdAt: product.createdAt,
      isBestSeller: product.isBestSeller,
      isTodayDeal: product.isTodayDeal
    };
    res.json(detailedProduct);
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Unknown error',
      details: err.errors || err
    });
  }
};

// Update a product card by ID
exports.updateProductCard = async (req, res) => {
  try {
    const { image } = req.body;
    if (image && !isCloudinaryUrl(image)) {
      return res.status(400).json({ error: 'Image URL must be a valid Cloudinary URL.' });
    }
    const product = await ProductCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({
      error: err.message || 'Unknown error',
      details: err.errors || err
    });
  }
};

// Delete a product card by ID
exports.deleteProductCard = async (req, res) => {
  try {
    const product = await ProductCard.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Unknown error',
      details: err.errors || err
    });
  }
};

// Extra: Get best sellers
exports.getBestSellers = async (req, res) => {
  try {
    const products = await ProductCard.find({ isBestSeller: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Unknown error',
      details: err.errors || err
    });
  }
};

// Extra: Get today deals
exports.getTodayDeals = async (req, res) => {
  try {
    const products = await ProductCard.find({ isTodayDeal: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Unknown error',
      details: err.errors || err
    });
  }
};

// Extra: Browse by category
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await ProductCard.find({ category }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({
      error: err.message || 'Unknown error',
      details: err.errors || err
    });
  }
};
