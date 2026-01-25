const mongoose = require('mongoose');
const Order = require('../model/order.model');
const ProductCard = require('../model/productCard.model');
/* --------------------------------------------------
   UPDATE ORDER STATUS (ADMIN) - IMPROVED
-------------------------------------------------- */
const { notifyOrderStatusChange } = require('../service/orderNotification.service');
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notifyCustomer = true, adminNotes } = req.body;

    // Validate status strictly against model enum (case-insensitive)
    const validStatuses = [
      'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold',
      'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'ON_HOLD'
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses
      });
    }

    // Find and update order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only send notification if status actually changes
    const prevStatus = order.status;
    const newStatus = status.toLowerCase();
    let notificationResult = null;

    if (prevStatus !== newStatus) {
      order.status = newStatus;
      order.updatedAt = Date.now();
      await order.save();
      console.log(`[OrderController] Updated order status: id=${order._id}, status=${order.status}`);

      // Populate items.productId for full order details
      await order.populate({
        path: 'items.productId',
        model: 'ProductCards',
        select: 'title image price category'
      });

      // Send notification if requested
      if (notifyCustomer) {
        try {
          notificationResult = await notifyOrderStatusChange(order.toObject(), newStatus, order.timeline || []);
        } catch (notifyErr) {
          console.error('[OrderController] Failed to send status update notification:', notifyErr);
        }
      }
    } else {
      // If status is unchanged, do not update or notify
      return res.status(400).json({ error: 'Order status is already set to this value.' });
    }

    // Add orderId field for frontend consistency (always use tx_ref if present)
    const orderObj = order.toObject();
    orderObj.orderId = order.tx_ref;
    if (notificationResult) {
      orderObj.notification = notificationResult;
    }

    res.json({
      success: true,
      order: orderObj
    });
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   GET ORDERS WITH ADVANCED FILTERING
-------------------------------------------------- */
exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user;
    const userRole = req.user?.role || req.user?.userRole || 'customer';
    const {
      status,
      startDate,
      endDate,
      search,
      sortBy = '-createdAt',
      limit = 50,
      page = 1
    } = req.query;

    // Build query
    let query = {};
    if (userRole !== 'admin') {
      query.userId = userId;
    }
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    // Search filter (by order ID, customer name, product name)
    if (search) {
      query.$or = [
        { tx_ref: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Fetch orders with pagination and population
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .populate({
          path: 'items.productId',
          model: 'ProductCards',
          select: 'title image price category'
        })
        .lean(),
      Order.countDocuments(query)
    ]);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    // Process orders
    const processedOrders = orders.map(order => {
      // Calculate total items and process images
      const items = order.items.map(item => {
        let image = '';
        const product = item.productId || {};
        
        if (product.image) {
          image = product.image.startsWith('http')
            ? product.image
            : `https://res.cloudinary.com/${cloudName}/image/upload/w_300,h_300,c_fill/${product.image}`;
        } else if (item.image) {
          image = item.image;
        }

        return {
          productId: product._id || item.productId,
          title: product.title || item.title,
          image,
          quantity: item.quantity,
          price: item.price,
          category: product.category
        };
      });

      const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
      const totalValue = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

      return {
        _id: order._id,
        orderId: order.tx_ref, // Always use tx_ref for orderId
        status: order.status,
        items,
        itemCount,
        totalAmount: order.totalAmount,
        totalValue,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        customerName: order.shippingAddress?.fullName,
        customerEmail: order.customerEmail,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        estimatedDelivery: getEstimatedDelivery(order.status),
        notes: order.notes || []
      };
    });

    // Calculate statistics
    const stats = await calculateOrderStats(userId, query);

    res.json({
      success: true,
      orders: processedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats
    });
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   CREATE ORDER WITH ENHANCED VALIDATION
-------------------------------------------------- */
exports.createOrder = async (req, res, next) => {
    // Debug: log full request body for troubleshooting
    console.log('[OrderController] Incoming order creation req.body:', req.body);
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const { tx_ref, userId, items, shippingAddress, totalAmount, paymentMethod, email: customerEmail, chapaPayload, payload } = req.body;

      // Validate required fields
      const required = { tx_ref, userId, items, totalAmount };
      const missing = Object.entries(required)
        .filter(([_, val]) => !val)
        .map(([key]) => key);
      if (missing.length > 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          error: 'Missing required fields',
          missing,
          received: req.body
        });
      }

      // Validate items array
      if (!Array.isArray(items) || items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ 
          error: 'Items must be a non-empty array' 
        });
      }

      // Check for duplicate order (idempotency)
      const existingOrder = await Order.findOne({ tx_ref }).session(session);
      if (existingOrder) {
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({
          success: true,
          order: existingOrder,
          message: 'Order already exists'
        });
      }

      // Merge duplicate items and validate stock
      const itemMap = new Map();
      const productIds = items.map(item => item.productId);
      // Validate all products exist
      const products = await ProductCard.find({ 
        _id: { $in: productIds } 
      }).session(session);
      const productMap = new Map(products.map(p => [p._id.toString(), p]));
      for (const item of items) {
        const productId = item.productId.toString();
        const product = productMap.get(productId);
        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            error: `Product not found: ${productId}`,
            productId
          });
        }
        // Check stock availability (if implemented)
        if (product.stock !== undefined && product.stock < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            error: `Insufficient stock for ${product.title}`,
            available: product.stock,
            requested: item.quantity
          });
        }
        // Merge quantities
        if (itemMap.has(productId)) {
          const existing = itemMap.get(productId);
          existing.quantity += Number(item.quantity);
        } else {
          itemMap.set(productId, {
            productId,
            quantity: Number(item.quantity),
            price: item.price,
            originalPrice: product.price
          });
        }
      }
      // Prepare final items with product data
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const finalItems = Array.from(itemMap.values()).map(item => {
        const product = productMap.get(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          originalPrice: item.originalPrice,
          title: product.title,
          description: product.description,
          image: product.image 
            ? product.image.startsWith('http')
              ? product.image
              : `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_400,c_fill/${product.image}`
            : '',
          category: product.category,
          sku: product.sku
        };
      });
      // Calculate totals
      const subtotal = finalItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingFee = calculateShippingFee(shippingAddress, finalItems);
      const tax = calculateTax(subtotal, shippingAddress);
      const calculatedTotal = subtotal + shippingFee + tax;
      // Remove total amount mismatch warning and allow order creation to proceed
      // Create order
      const gmail = customerEmail || (chapaPayload && chapaPayload.email) || (payload && payload.email) || (shippingAddress && shippingAddress.email) || undefined;
      const order = await Order.create([{
        tx_ref,
        userId: new mongoose.Types.ObjectId(userId),
        items: finalItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'unknown',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        subtotal,
        shippingFee,
        tax,
        totalAmount: calculatedTotal,
        currency: 'ETB',
        email: gmail,
        payment: {
          provider: 'chapa',
          email: gmail
        },
        notes: [{
          type: 'order_created',
          content: 'Order created successfully',
          timestamp: Date.now()
        }]
      }], { session });
      // Update product stock (if implemented)
      for (const item of finalItems) {
        await ProductCard.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
      await session.commitTransaction();
      session.endSession();
      const createdOrder = order[0];
      // Populate before sending notifications and response
      await createdOrder.populate({
        path: 'items.productId',
        model: 'ProductCards',
        select: 'title image price'
      });

      // Convert items to include product data for notification
      const populatedItems = createdOrder.items.map(item => {
        let product = item.productId;
        if (typeof product === 'object' && product !== null) {
          return {
            ...item.toObject(),
            productId: product,
            title: product.title,
            image: product.image,
            price: item.price
          };
        }
        return item;
      });
      // Clone order for notification with populated items
      const notificationOrder = {
        ...createdOrder.toObject(),
        items: populatedItems
      };

      // Send order confirmation notification (async, don't await)
      const { notifyOrderSuccessWithRetry } = require('../service/orderNotification.service');
      notifyOrderSuccessWithRetry(notificationOrder, shippingAddress).catch(err => {
        console.error('Order notification error:', err);
      });
      res.status(201).json({
        success: true,
        order: notificationOrder,
        totals: {
          subtotal,
          shippingFee,
          tax,
          total: calculatedTotal
        }
      });
      return;
    } catch (err) {
      // Retry on transient transaction error
      if (err.errorLabels && (err.errorLabels.includes('TransientTransactionError') || err.errorLabels.includes('WriteConflict'))) {
        attempts++;
        try { await session.abortTransaction(); } catch {}
        session.endSession();
        if (attempts >= maxAttempts) {
          return next(err);
        }
        continue; // retry
      } else {
        try { await session.abortTransaction(); } catch {}
        session.endSession();
        return next(err);
      }
    }
  }
};

/* --------------------------------------------------
   HELPER FUNCTIONS
-------------------------------------------------- */
function getEstimatedDelivery(status) {
  const estimates = {
    pending: '2-3 business days',
    processing: '1-2 business days',
    shipped: '1-3 business days',
    delivered: 'Delivered',
    cancelled: 'N/A',
    refunded: 'N/A',
    on_hold: 'Pending review'
  };
  return estimates[status] || 'N/A';
}

async function calculateOrderStats(userId, query = {}) {
  const stats = await Order.aggregate([
    { $match: { userId, ...query } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        processing: {
          $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
        },
        shipped: {
          $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
        },
        delivered: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalOrders: 0,
    totalAmount: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };
}

function calculateShippingFee(address, items) {
  // Implement shipping calculation logic
  const baseFee = 50; // ETB base fee
  const weightFee = items.length * 10; // 10 ETB per item
  const distanceFee = address.city === 'Addis Ababa' ? 0 : 100;
  return baseFee + weightFee + distanceFee;
}

function calculateTax(subtotal, address) {
  // Implement tax calculation (e.g., 15% VAT for Ethiopia)
  const taxRate = 0.15;
  return subtotal * taxRate;
}

async function createOrderActivityLog(orderId, activity) {
  try {
    const ActivityLog = require('../model/activityLog.model');
    await ActivityLog.create({
      orderId,
      ...activity,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
  }
}

function sendAdminWebhookNotification(order, previousStatus, newStatus, adminName) {
  if (!process.env.ADMIN_WEBHOOK_URL) return Promise.resolve();
  
  const payload = {
    text: `📦 Order Status Updated`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Order ${order.tx_ref} status updated*`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*From:*\n${previousStatus}`
          },
          {
            type: 'mrkdwn',
            text: `*To:*\n${newStatus}`
          },
          {
            type: 'mrkdwn',
            text: `*By:*\n${adminName || 'System'}`
          },
          {
            type: 'mrkdwn',
            text: `*Amount:*\nETB ${order.totalAmount}`
          }
        ]
      }
    ]
  };

  return fetch(process.env.ADMIN_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function sendOrderConfirmationEmail(order, shippingAddress) {
  const User = require('../model/user.model');
  const user = await User.findById(order.userId);
  if (!user) return;

  const { sendEmail } = require('../service/email.service');
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const html = `
    <h2>Order Confirmed - ${order.tx_ref}</h2>
    <p>Hi ${user.name},</p>
    <p>Your order has been confirmed on ${orderDate}.</p>
    <h3>Order Details:</h3>
    <ul>
      ${order.items.map(item => {
        let imageUrl = '';
        if (item.productId && item.productId.image) {
          imageUrl = item.productId.image.startsWith('http')
            ? item.productId.image
            : `https://res.cloudinary.com/${cloudName}/image/upload/w_150,h_150,c_fill/${item.productId.image}`;
        }
        return `<li style="margin-bottom:10px;">${imageUrl ? `<img src='${imageUrl}' alt='Product Image' style='width:60px;height:60px;object-fit:cover;border-radius:8px;margin-right:8px;vertical-align:middle;' />` : ''}${item.quantity} x ${item.productId && item.productId.title ? item.productId.title : item.productId} @ ${item.price} ETB</li>`;
      }).join('')}
    </ul>
    <p><b>Total:</b> ${order.totalAmount} ETB</p>
    <p><b>Shipping Address:</b> ${shippingAddress.fullName}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.country}</p>
    <p>Estimated Delivery: ${getEstimatedDelivery(order.status)}</p>
    <p>Track your order: <a href="https://afrimart.com/track/${order.tx_ref}">Track Order</a></p>
    <p>Contact support: support@afrimart.com</p>
  `;
  const text = `Order Confirmed - ${order.tx_ref}\nHi ${user.name},\nYour order has been confirmed on ${orderDate}.\nTotal: ${order.totalAmount} ETB`;
  await sendEmail({
    to: user.email,
    subject: `🎉 Order Confirmed - ${order.tx_ref}`,
    html,
    text
  });
}

function generateStatusSMS(status, orderId, customerName) {
  const messages = {
    processing: `Hi ${customerName}, your order ${orderId} is being processed. Expect shipping updates soon.`,
    shipped: `Hi ${customerName}, your order ${orderId} has been shipped! Track: https://afrimart.com/track/${orderId}`,
    delivered: `Hi ${customerName}, your order ${orderId} has been delivered! Thank you for shopping with AfriMart!`,
    cancelled: `Hi ${customerName}, your order ${orderId} has been cancelled. Contact support if needed.`
  };
  return messages[status] || `Order ${orderId} status updated to ${status}`;
}