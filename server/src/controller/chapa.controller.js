const chapa = require('../service/cahapa.service')
const { chapaPaymentSchema, validateChapaPayment } = require('../utils/validator')
const { logger } = require('../utils/chapa')
const ChapaPayment = require('../model/chapa.model')

// Controller for initiating a payment
exports.initiatePayment = async (req, res) => {
  try {
    // Validate payment data
    const { error, value } = validateChapaPayment(req.body)
    if (error) {
      logger.warn({ type: 'validation', error: error.details, body: req.body })
      return res.status(400).json({ message: error.details[0].message, details: error.details, body: req.body })
    }
    // Save payment request to DB with valid status
    // Default status to 'pending' to match enum in schema
    const initialStatus = 'pending';
    const paymentRecord = await ChapaPayment.create({ ...value, status: initialStatus })
    logger.info({ type: 'chapa_payment_request', tx_ref: value.tx_ref, payload: value })
    const result = await chapa.initiatePayment(value)
    logger.info({ type: 'chapa_payment_response', tx_ref: value.tx_ref, chapaResult: result })
    // Update DB with Chapa response and valid status
    let chapaStatus = result.status;
    // Only set status if it's a valid enum value, else fallback to 'pending'
    const validStatuses = ['pending', 'success', 'failed'];
    if (!validStatuses.includes(chapaStatus)) {
      chapaStatus = 'pending';
    }
    paymentRecord.chapa_response = result;
    paymentRecord.status = chapaStatus;
    await paymentRecord.save();
    logger.info({ type: 'payment_initiated', tx_ref: value.tx_ref, result });
    if (!result || !result.data || !result.data.checkout_url) {
      logger.error({ type: 'chapa_redirect_error', tx_ref: value.tx_ref, result });
    }
    res.status(200).json(result);
  } catch (error) {
    logger.error({ type: 'payment_error', error: error.message, stack: error.stack, body: req.body })
    res
      .status(500)
      .json({ message: 'Payment initiation failed', error: error.message, stack: error.stack, body: req.body })
  }
}

// Controller for verifying a payment
exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.query
    const result = await chapa.verifyPayment(tx_ref)
    // Update DB with verification result and valid status
    let chapaStatus = result.status;
    const validStatuses = ['pending', 'success', 'failed'];
    if (!validStatuses.includes(chapaStatus)) {
      chapaStatus = 'pending';
    }
    await ChapaPayment.findOneAndUpdate(
      { tx_ref },
      { status: chapaStatus, chapa_response: result },
      { new: true },
    );
    logger.info({ type: 'payment_verified', tx_ref, result })
    res.status(200).json(result)
  } catch (error) {
    logger.error({ type: 'verify_error', error: error.message })
    res
      .status(500)
      .json({ message: 'Payment verification failed', error: error.message })
  }
}

// Webhook handler for Chapa notifications
exports.webhook = async (req, res) => {
  try {
    logger.info({ type: 'webhook_received', body: req.body })
    const { tx_ref, status } = req.body
    // Update payment status in DB with valid status
    let chapaStatus = status;
    const validStatuses = ['pending', 'success', 'failed'];
    if (!validStatuses.includes(chapaStatus)) {
      chapaStatus = 'pending';
    }
    await ChapaPayment.findOneAndUpdate(
      { tx_ref },
      { status: chapaStatus, chapa_response: req.body },
      { new: true },
    );
    res.status(200).json({ message: 'Webhook received' })
  } catch (error) {
    logger.error({ type: 'webhook_error', error: error.message })
    res
      .status(500)
      .json({ message: 'Webhook handling failed', error: error.message })
  }
}