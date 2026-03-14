const express = require('express');
const router = express.Router();
const bestSellerController = require('../controller/bestSeller.controller');

// GET /api/best-sellers/sales
router.get('/sales', bestSellerController.getBestSellersBySales);

module.exports = router;
