// Router for product card CRUD operations

const express = require('express');
const router = express.Router();

const productCardController = require('../controller/productCard.controller');
const upload = require('../middleware/upload');


// Admin CRUD
router.post('/', upload.single('image'), productCardController.createProductCard);
router.get('/', productCardController.getProductCards);
router.get('/best-sellers', productCardController.getBestSellers);
router.get('/today-deals', productCardController.getTodayDeals);
router.get('/category/:category', productCardController.getByCategory);
router.get('/:id', productCardController.getProductCardById);
router.put('/:id', productCardController.updateProductCard);
router.delete('/:id', productCardController.deleteProductCard);

module.exports = router;
