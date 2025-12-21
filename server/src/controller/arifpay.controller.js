// Check payment status by orderId (production-ready)
exports.checkStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.status(200).json({
      orderId,
      status: payment.status,
      transactionId: payment.transactionId,
    });
  } catch (err) {
    next(err);
  }
};


const { validateArifpayPayment } = require('../utils/validator');
const Payment = require('../model/payment.model');
const Order = require('../model/order.model');
const Arifpay = require('arifpay-express-plugin');

// Initialize ArifPay client with API key and expiration date
const arifpay = new Arifpay(
  process.env.ARIFPAY_API_KEY,
  process.env.ARIFPAY_SESSION_EXPIRY || '2027-02-01T03:45:27'
);

// Initiate ArifPay payment
exports.initiateArifPayPayment = async (req, res, next) => {
  try {
    // Validate input using Joi schema
    const { error, value } = validateArifpayPayment(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }
    const { phone, orderId, description } = value;

    // Fetch order and calculate amount server-side
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const amount = order.totalAmount;

    // Check for existing payment (idempotency)
    const existing = await Payment.findOne({ orderId });
    if (existing && existing.status !== 'FAILED') {
      return res.status(409).json({ error: 'Payment already initiated' });
    }

    // Save pending payment before calling ArifPay
    const pendingPayment = await Payment.create({
      orderId,
      amount,
      phone,
      status: 'PENDING',
      provider: 'ARIFPAY',
    });

    // Build ArifPay paymentInfo for plugin
    const paymentInfo = {
      cancelUrl: process.env.ARIFPAY_CANCEL_URL || 'https://example.com/cancel',
      errorUrl: process.env.ARIFPAY_ERROR_URL || 'http://example.com/error',
      notifyUrl: process.env.ARIFPAY_CALLBACK_URL,
      successUrl: process.env.ARIFPAY_SUCCESS_URL || 'http://example.com/success',
      phone,
      amount,
      nonce: `arifpay-nonce-${orderId}-${Date.now()}`,
      paymentMethods: ["ARIFPAY"],
      items: [
        {
          name: description || 'Order',
          quantity: 1,
          price: amount
        }
      ]
    };

    // Call ArifPay plugin
    const response = await arifpay.Make_payment(paymentInfo);
    const result = JSON.parse(response);

    if (!result.error && result.data && result.data.paymentUrl) {
      // Respond with payment URL and sessionId
      res.status(200).json({
        message: 'ArifPay payment initiated',
        paymentUrl: result.data.paymentUrl,
        sessionId: result.data.sessionId,
        status: result.data.status
      });
    } else {
      // Error handling
      res.status(500).json({
        error: true,
        msg: result.msg || 'ArifPay API error',
      });
    }
  } catch (err) {
    next(err);
  }
};
