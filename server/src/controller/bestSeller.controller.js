const Order = require('../model/order.model');
const ProductCard = require('../model/productCard.model');

// Get best sellers sorted by sold count (highest first)
exports.getBestSellersBySales = async (req, res) => {
  try {
    // Aggregate total sold for each product
    const sales = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.productId',
        sold: { $sum: '$items.quantity' }
      }},
      { $sort: { sold: -1 } },
      { $limit: 20 } // limit to top 20 best sellers
    ]);

    // Fetch product details for each best seller
    const productIds = sales.map(s => s._id);
    const products = await ProductCard.find({ _id: { $in: productIds } }).lean();
    // Map sold count to product
    const productsWithSales = productIds.map(pid => {
      const product = products.find(p => p._id.toString() === pid.toString());
      const sold = sales.find(s => s._id.toString() === pid.toString())?.sold || 0;
      return product ? { ...product, sold } : null;
    }).filter(Boolean);

    res.json(productsWithSales);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
};