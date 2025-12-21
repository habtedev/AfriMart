const express = require('express');
const router = express.Router();
const shippingController = require('../controller/shipping.controller');
const auth = require('../middleware/auth.middleware');

// Save or update shipping address (user must be logged in)
router.post('/', auth.verifyToken, shippingController.saveShippingAddress);

// Get shipping address for logged-in user
router.get('/', auth.verifyToken, shippingController.getShippingAddress);

module.exports = router;
