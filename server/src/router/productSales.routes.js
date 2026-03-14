const express = require('express');
const router = express.Router();
const productSalesController = require('../controller/productSales.controller');

// GET /api/product-sales/:productId
router.get('/:productId', productSalesController.getProductSalesStats);

module.exports = router;
