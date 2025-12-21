const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');
const auth = require('../middleware/auth.middleware');

// Create order (for testing)
router.post('/create', auth.verifyToken, orderController.createOrder);

module.exports = router;
