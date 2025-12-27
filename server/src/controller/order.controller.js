
// Get all orders with product details populated
exports.getOrders = async (req, res, next) => {
  try {
    // Only return orders for the authenticated user
    const userId = req.user && req.user.id ? req.user.id : req.user;
    console.log('[Order:getOrders] userId from token:', userId);
    const orders = await Order.find({ userId }).populate({
      path: 'items.productId',
      model: 'ProductCards',
      select: 'title image price',
    });
    // Map orders to include summary info and product image
    const ordersWithSummary = orders.map(order => {
      const itemCount = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const items = order.items
        .map(item => {
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME ;
          const image = item.productId?.image
            ? item.productId.image.startsWith('http')
              ? item.productId.image
              : `https://res.cloudinary.com/${cloudName}/image/upload/${item.productId.image}`
            : '';
          return {
            quantity: item.quantity,
            price: item.price,
            product: {
              id: item.productId?._id || item.productId,
              title: item.productId?.title || '',
              image,
            }
          };
        })
        .filter(item => item.product.image && item.product.image.includes('cloudinary.com'));
      return {
        _id: order._id,
        orderId: order.orderId,
        userId: order.userId,
        items,
        itemCount,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });
    res.json(ordersWithSummary);
  } catch (err) {
    next(err);
  }
};
const Order = require('../model/order.model');

// Create a new order (for testing ArifPay)
exports.createOrder = async (req, res, next) => {
  try {
    console.log('[Order:createOrder] Incoming request body:', req.body);
    const { orderId, userId, items, shippingAddress, totalAmount } = req.body;
    const mongoose = require('mongoose');
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    console.log('[Order:createOrder] Parsed fields:', { orderId, userId, items, shippingAddress, totalAmount });
    console.log('[Order:createOrder] Incoming items array:', items);
    if (!orderId || !userId || !items || !totalAmount) {
      console.error('[Order:createOrder] Missing required fields:', { orderId, userId, items, totalAmount });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Validate productId in items
    const isValidObjectId = (id) => typeof id === 'string' && id.match(/^[a-fA-F0-9]{24}$/);
    if (!Array.isArray(items)) {
      console.error('[Order:createOrder] items is not an array:', items);
      return res.status(400).json({ error: 'Items must be an array' });
    }
    const invalidProductIds = items.filter(item => !isValidObjectId(item.productId));
    if (invalidProductIds.length > 0) {
      console.error('[Order:createOrder] Invalid productId(s) in items:', invalidProductIds);
      return res.status(400).json({
        error: 'Invalid productId in items. Each productId must be a valid 24-character hex string.',
        invalidProductIds
      });
    }
    // Deduplicate items by productId (as string) and sum quantities
    const dedupedItemsMap = new Map();
    for (const item of items) {
      const pid = typeof item.productId === 'string' ? item.productId : String(item.productId);
      if (!dedupedItemsMap.has(pid)) {
        dedupedItemsMap.set(pid, { ...item, productId: pid });
      } else {
        dedupedItemsMap.get(pid).quantity += item.quantity;
      }
    }
    const dedupedItems = Array.from(dedupedItemsMap.values());

    // Populate product image URL for each deduped item
    const ProductCard = require('../model/productCard.model');
    const itemsWithImage = await Promise.all(
      dedupedItems.map(async (item) => {
        const product = await ProductCard.findById(item.productId);
        let image = '';
        if (product && product.image) {
          const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '<your-cloud-name>';
          image = product.image.startsWith('http')
            ? product.image
            : `https://res.cloudinary.com/${cloudName}/image/upload/${product.image}`;
        }
        return {
          ...item,
          image,
        };
      })
    );
    const order = await Order.create({
      orderId,
      userId: userObjectId,
      items: itemsWithImage,
      shippingAddress,
      totalAmount,
      paymentStatus: 'PENDING',
    });
    console.log('[Order:createOrder] Order created:', order);
    res.status(201).json(order);
  } catch (err) {
    console.error('[Order:createOrder] Error:', err);
    next(err);
  }
};
