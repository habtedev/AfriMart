// Get a single product card by id
exports.getProductCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const productCard = await ProductCard.findById(id);
    if (!productCard) return res.status(404).json({ message: "Product card not found" });
    res.json({ productCard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const ProductCard = require("../model/product-category-card");

const getImageUrl = (req) => req.file && req.file.path ? req.file.path : (req.body.image || null);

// Create a new product card
exports.createProductCard = async (req, res) => {
  try {
    const { title, category, price, description, stock, isBestSeller, isTodaysDeal } = req.body;
    const image = getImageUrl(req);
    const productCard = await ProductCard.create({
      title,
      image,
      category,
      price,
      description,
      stock,
      isBestSeller,
      isTodaysDeal
    });
    res.status(201).json({ message: "Product card created", productCard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all product cards (optionally filter by category)
exports.getProductCards = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) filter.category = category;
    const productCards = await ProductCard.find(filter).sort({ createdAt: -1 });
    res.json({ message: "Product cards fetched", productCards });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a product card
exports.updateProductCard = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    const image = getImageUrl(req);
    if (image) update.image = image;
    const productCard = await ProductCard.findByIdAndUpdate(id, update, { new: true });
    if (!productCard) return res.status(404).json({ message: "Product card not found" });
    res.json({ message: "Product card updated", productCard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a product card
exports.deleteProductCard = async (req, res) => {
  try {
    const { id } = req.params;
    const productCard = await ProductCard.findByIdAndDelete(id);
    if (!productCard) return res.status(404).json({ message: "Product card not found" });
    res.json({ message: "Product card deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
