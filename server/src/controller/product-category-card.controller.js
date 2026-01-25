// Get a single product card by id with ObjectId validation
const mongoose = require("mongoose");
exports.getProductCardById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product card ID" });
    }
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
    // Debug: log all received fields and file
    console.log('[DEBUG][createProductCard] req.body:', req.body);
    console.log('[DEBUG][createProductCard] req.file:', req.file);
    // Parse JSON fields if sent as strings
    if (typeof req.body.color === "string") req.body.color = JSON.parse(req.body.color);
    if (typeof req.body.size === "string") req.body.size = JSON.parse(req.body.size);
    if (typeof req.body.variants === "string") req.body.variants = JSON.parse(req.body.variants);

    const {
      title,
      category,
      price,
      offPrice,
      description,
      stock,
      isBestSeller,
      isTodayDeal,
      shippingPrice,
      shippingPercent,
      color,
      size,
      variants
    } = req.body;
    const image = getImageUrl(req);
    // Debug: log what will be saved
    console.log('[DEBUG][createProductCard] To save:', {
      title,
      image,
      category,
      price,
      offPrice,
      description,
      stock,
      isBestSeller,
      isTodayDeal,
      shippingPrice,
      shippingPercent,
      color,
      size,
      variants
    });
    const productCard = await ProductCard.create({
      title,
      image,
      category,
      price,
      offPrice,
      description,
      stock,
      isBestSeller,
      isTodayDeal,
      shippingPrice,
      shippingPercent,
      color,
      size,
      variants
    });
    // Debug: log result
    console.log('[DEBUG][createProductCard] Created:', productCard);
    res.status(201).json({ message: "Product card created", productCard });
  } catch (err) {
    console.error('[DEBUG][createProductCard] Error:', err);
    res.status(500).json({ message: err.message, error: err });
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
    // Debug: log what is received for image
    console.log('[DEBUG] req.file:', req.file);
    console.log('[DEBUG] req.body.image:', req.body.image);
  try {
    const { id } = req.params;
    // Parse JSON fields if sent as strings
    if (typeof req.body.color === "string") req.body.color = JSON.parse(req.body.color);
    if (typeof req.body.size === "string") req.body.size = JSON.parse(req.body.size);
    if (typeof req.body.variants === "string") req.body.variants = JSON.parse(req.body.variants);

    const {
      title,
      category,
      price,
      offPrice,
      description,
      stock,
      isBestSeller,
      isTodayDeal,
      shippingPrice,
      shippingPercent,
      color,
      size,
      variants
    } = req.body;
    const image = getImageUrl(req);
    const update = {
      title,
      category,
      price,
      offPrice,
      description,
      stock,
      isBestSeller,
      isTodayDeal,
      shippingPrice,
      shippingPercent,
      color,
      size,
      variants
    };
    if (req.file && image) {
      update.image = image; // new file uploaded
    } else if (typeof req.body.image === 'string' && req.body.image.trim() !== '') {
      update.image = req.body.image; // keep existing image
    }
    // If image is empty string or not sent, do not update the image field
    const productCard = await ProductCard.findByIdAndUpdate(id, update, { new: true });
    if (!productCard) return res.status(404).json({ message: "Product card not found" });
    res.json({ message: "Product card updated", productCard });
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
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
