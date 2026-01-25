const OrderCache = require('../model/orderCache.model');

// Save order data to cache before payment
exports.saveOrderCache = async (req, res) => {
  try {
    const { tx_ref, userId, items, shippingAddress, totalAmount } = req.body;
    if (!tx_ref || !userId || !items || !shippingAddress || !totalAmount) {
      return res.status(400).json({ message: 'Missing required order data' });
    }
    await OrderCache.findOneAndUpdate(
      { tx_ref },
      { userId, items, shippingAddress, totalAmount, tx_ref },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Order cache saved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save order cache', error: err.message });
  }
};
