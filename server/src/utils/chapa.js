const winston = require('winston')

// Build Chapa payment payload
exports.buildChapaPayload = (data) => {
  const payload = {
    amount: data.amount ? data.amount.toString() : undefined, // Chapa expects string
    currency: data.currency || 'ETB',
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    tx_ref: data.tx_ref,
    callback_url: data.callback_url,
    return_url: data.return_url,
    customization: {
      title: data.customization_title || 'Payment',
      description: data.custom_description || '',
      logo: data.custom_logo || ''
    }
  }
  exports.logger.info({ layer: 'chapa_payload_debug', payload })
  return payload
}

// Get Chapa API headers
exports.getChapaHeaders = () => {
  return {
    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json',
  }
}

// Winston logger setup
exports.logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    // You can add file transport here
  ],
})