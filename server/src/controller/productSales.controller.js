// Controller for product sales and unique buyers
const Order = require('../model/order.model');

// Get total sold and unique buyers for a product
exports.getProductSalesStats = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('[ProductSales] Checking sales for productId:', productId);
    // Find all orders that include this product
    const orders = await Order.find({ 'items.productId': productId });
    console.log(`[ProductSales] Found ${orders.length} orders with this productId in items.`);
    let totalSales = 0;
    const uniqueBuyers = new Set();
    orders.forEach(order => {
      order.items.forEach(item => {
        console.log('[ProductSales] Order item:', {itemProductId: item.productId?.toString?.(), match: item.productId?.toString?.() === productId, quantity: item.quantity});
        if (item.productId?.toString?.() === productId) {
          totalSales += item.quantity;
          uniqueBuyers.add(order.userId.toString());
        }
      });
    });
    console.log(`[ProductSales] Total sold: ${totalSales}, Unique buyers: ${uniqueBuyers.size}`);
    res.json({
      productId,
      sold: totalSales,
      uniqueBuyers: uniqueBuyers.size
    });
  } catch (err) {
    console.error('[ProductSales] Error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
};
