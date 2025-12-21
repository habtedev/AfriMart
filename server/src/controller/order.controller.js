const Order = require('../model/order.model');

// Create a new order (for testing ArifPay)
exports.createOrder = async (req, res, next) => {
  try {
    const { orderId, userId, items, shippingAddress, totalAmount } = req.body;
    if (!orderId || !userId || !items || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const order = await Order.create({
      orderId,
      userId,
      items,
      shippingAddress,
      totalAmount,
      paymentStatus: 'PENDING',
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};
