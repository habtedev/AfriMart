const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['paypal', 'strapi', 'chapa', 'telebirr', 'mpesa',],
    required: true,
  },
  cardNumber: { type: String },
  cardHolder: { type: String },
  expiry: { type: String },
  cvc: { type: String },
  paypalEmail: { type: String },
  bankAccount: { type: String },
  mobileNumber: { type: String },
  telebirrAccount: { type: String },
  mpesaAccount: { type: String },
  cbeBirrAccount: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
