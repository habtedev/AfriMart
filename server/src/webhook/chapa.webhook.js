const crypto = require('crypto')

exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-chapa-signature']
    const expected = crypto
      .createHmac('sha256', process.env.CHAPA_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex')

    if (signature !== expected) {
      return res.status(401).json({ message: 'Invalid signature' })
    }

    const { tx_ref, status } = req.body

    if (status === 'success') {
      await ChapaPayment.findOneAndUpdate(
        { tx_ref, status: 'pending' },
        { status: 'success', verified_at: new Date() }
      )
    }

    return res.status(200).json({ message: 'Webhook accepted' })
  } catch (err) {
    return res.status(500).json({ message: 'Webhook error' })
  }
}
