const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');
const auth = require('../middleware/auth.middleware');

// Save or update payment method (user must be logged in)
router.post('/', auth.verifyToken, paymentController.savePaymentMethod);

// Get all payment methods for logged-in user
router.get('/', auth.verifyToken, paymentController.getPaymentMethods);

module.exports = router;
