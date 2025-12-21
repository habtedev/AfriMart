const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShippingAddress', shippingAddressSchema);
