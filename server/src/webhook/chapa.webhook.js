const crypto = require('crypto')

exports.webhook = async (req, res) => {
  try {
    console.log('[Chapa Webhook] Incoming request:', JSON.stringify(req.body));
    const signature = req.headers['x-chapa-signature'];
    const expected = crypto
      .createHmac('sha256', process.env.CHAPA_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expected) {
      console.warn('[Chapa Webhook] Invalid signature:', signature, 'Expected:', expected);
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const { tx_ref, status } = req.body;
    console.log(`[Chapa Webhook] tx_ref: ${tx_ref}, status: ${status}`);

    if (status !== 'success') {
      console.log('[Chapa Webhook] Payment not successful, no order created.');
      return res.status(200).json({ message: 'Payment not successful, no order created' });
    }

    // Best practice: fetch payment record and update order with email if missing
    const ChapaPayment = require('../model/chapa.model');
    const Order = require('../model/order.model');
    const paymentRecord = await ChapaPayment.findOne({ tx_ref });
    const order = await Order.findOne({ tx_ref });
    if (order && paymentRecord && paymentRecord.email) {
      let updated = false;
      if (!order.email) {
        order.email = paymentRecord.email;
        updated = true;
      }
      if (!order.payment) order.payment = {};
      if (!order.payment.email) {
        order.payment.email = paymentRecord.email;
        updated = true;
      }
      if (updated) {
        await order.save();
        console.log(`[Chapa Webhook] Order updated with customer email for tx_ref ${tx_ref}: ${paymentRecord.email}`);
      }
    } else {
      console.warn(`[Chapa Webhook] No order or customer email found for tx_ref ${tx_ref}`);
    }
    return res.status(200).json({ message: 'Payment successful, order email updated if needed', email: paymentRecord?.email });
  } catch (err) {
    console.error('[Chapa Webhook] Error:', err);
    return res.status(500).json({ message: 'Webhook error', error: err.message });
  }
};
