const express = require('express');
const router = express.Router();
const arifpayController = require('../controller/arifpay.controller');
const auth = require('../middleware/auth.middleware');

// Initiate ArifPay payment (user must be logged in)
router.post('/initiate', auth.verifyToken, arifpayController.initiateArifPayPayment);


// Webhook endpoint for ArifPay payment notifications
const arifpayWebhook = require('../webhook/arifpay.webhook');
router.post('/webhook', arifpayWebhook.handleWebhook);


// Payment status check endpoint
router.get('/status/:orderId', auth.verifyToken, arifpayController.checkStatus);

// Add more ArifPay routes as needed

module.exports = router;
