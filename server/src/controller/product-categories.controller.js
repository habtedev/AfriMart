const Product = require("../model/product-category");
const { upload } = require("../utils/cloudinary");

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { title, category, color, shopping } = req.body;
    // Restrict: Only one product per category
    const existing = await Product.findOne({ category });
    if (existing) {
      return res.status(400).json({ message: `A product for category '${category}' already exists.` });
    }
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path;
    }
    const product = await Product.create({ title, image: imageUrl, category, color, shopping });
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all categories  prodcuts
exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) {
      filter.category = category;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this category.", products: [] });
    }
    res.json({ message: "Products fetched", products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, color, shopping } = req.body;
    let update = { title };
    if (category) update.category = category;
    if (color !== undefined) update.color = color;
    if (shopping !== undefined) update.shopping = shopping;
    if (req.file) {
      update.image = req.file.path;
    }
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
