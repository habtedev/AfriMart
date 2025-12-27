const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');
const auth = require('../middleware/auth.middleware');


// Get all orders
router.get('/', auth.verifyToken, orderController.getOrders);

// Create order (for testing)
router.post('/create', auth.verifyToken, orderController.createOrder);

module.exports = router;
