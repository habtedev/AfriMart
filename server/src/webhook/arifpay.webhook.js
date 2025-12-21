// ArifPay Webhook Handler
// This file handles payment notifications from ArifPay


const Payment = require('../model/payment.model');
const Order = require('../model/order.model');
const crypto = require('crypto');

// Example signature verification (adjust as per ArifPay docs)
function verifyArifpaySignature(payload, signature, publicKey) {
  // Remove signature field from payload
  const filtered = { ...payload };
  delete filtered.signature;
  // Sort keys and build canonical string
  const canonicalString = Object.keys(filtered)
    .sort()
    .map(key => `${key}=${filtered[key]}`)
    .join('&');
  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(canonicalString);
    verifier.end();
    return verifier.verify(publicKey, Buffer.from(signature, 'base64'));
  } catch (err) {
    return false;
  }
}

exports.handleWebhook = async (req, res, next) => {
  try {
    const { transactionId, orderId, status, signature } = req.body;
    const publicKey = process.env.ARIFPAY_PUBLIC_KEY;

    // Verify signature if required by ArifPay
    if (publicKey && signature && !verifyArifpaySignature(req.body, signature, publicKey)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update payment status in DB
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    payment.status = status === 'SUCCESS' ? 'PAID' : 'FAILED';
    payment.transactionId = transactionId;
    await payment.save();

    // Update order paymentStatus in DB
    await Order.findOneAndUpdate(
      { orderId },
      { paymentStatus: payment.status }
    );

    // Respond to ArifPay
    res.status(200).json({ message: 'Webhook received', orderId, status: payment.status });
  } catch (err) {
    next(err);
  }
};
