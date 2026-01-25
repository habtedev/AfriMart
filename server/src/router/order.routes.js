
const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');
const auth = require('../middleware/auth.middleware');

// Update order status (admin)
router.patch('/:id', orderController.updateOrderStatus);



// Get all orders
// Accept either JWT or session for admin authentication
router.get('/', (req, res, next) => {
	// If session user is present and is admin, allow
	if (req.session && req.session.user && req.session.user.role === 'admin') {
		// Attach user info for controller
		req.user = req.session.user;
		return orderController.getOrders(req, res, next);
	}
	// Otherwise, fallback to JWT
	return auth.verifyToken(req, res, () => orderController.getOrders(req, res, next));
});

// Create order (frontend after payment)
router.post('/', auth.verifyToken, orderController.createOrder);


module.exports = router;
