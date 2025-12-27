const mongoose = require('mongoose')

const chapaPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ETB' },

    email: { type: String, required: true, index: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },

    tx_ref: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },

    callback_url: { type: String, required: true },
    return_url: { type: String },

    customization: {
      title: String,
      description: String,
      logo: String,
    },

    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true,
    },

    chapa_response: { type: Object },

    verified_at: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ChapaPayment', chapaPaymentSchema)
