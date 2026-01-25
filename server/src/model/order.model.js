const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tx_ref: { type: String, required: true }, // Chapa transaction reference
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  totalAmount: { type: Number, required: true },
  email: { type: String },
  payment: {
    provider: { type: String },
    email: { type: String }
  },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'ON_HOLD'], default: 'pending' },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Order', orderSchema);
