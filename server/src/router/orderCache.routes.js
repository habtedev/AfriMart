const express = require('express');
const router = express.Router();
const { saveOrderCache } = require('../controller/orderCache.controller');

// POST /api/order-cache
router.post('/', saveOrderCache);

module.exports = router;
