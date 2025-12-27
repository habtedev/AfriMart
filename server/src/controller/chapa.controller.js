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
      logger.warn({ type: 'validation', error: error.details })
      return res.status(400).json({ message: error.details[0].message })
    }
    // Save payment request to DB
    const paymentRecord = await ChapaPayment.create({ ...value })
    const result = await chapa.initiatePayment(value)
    // Update DB with Chapa response
    paymentRecord.chapa_response = result
    paymentRecord.status = result.status || 'pending'
    await paymentRecord.save()
    logger.info({ type: 'payment_initiated', tx_ref: value.tx_ref, result })
    res.status(200).json(result)
  } catch (error) {
    logger.error({ type: 'payment_error', error: error.message })
    res
      .status(500)
      .json({ message: 'Payment initiation failed', error: error.message })
  }
}

// Controller for verifying a payment
exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.query
    const result = await chapa.verifyPayment(tx_ref)
    // Update DB with verification result
    await ChapaPayment.findOneAndUpdate(
      { tx_ref },
      { status: result.status, chapa_response: result },
      { new: true },
    )
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
    // Update payment status in DB
    await ChapaPayment.findOneAndUpdate(
      { tx_ref },
      { status, chapa_response: req.body },
      { new: true },
    )
    res.status(200).json({ message: 'Webhook received' })
  } catch (error) {
    logger.error({ type: 'webhook_error', error: error.message })
    res
      .status(500)
      .json({ message: 'Webhook handling failed', error: error.message })
  }
}