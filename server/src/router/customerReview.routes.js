const express = require('express');
const router = express.Router();
const customerReviewController = require('../../controller/customerReview.controller');

// Create review
router.post('/', customerReviewController.createReview);

// Get reviews for a product
router.get('/:productId', customerReviewController.getProductReviews);

module.exports = router;
