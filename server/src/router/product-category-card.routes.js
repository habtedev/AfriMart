const express = require("express");
const router = express.Router();
const productCategoryCardController = require("../controller/product-category-card.controller");
const upload = require("../utils/multer");


// CRUD routes for product-category-card with image upload
router.post("/", upload.single("image"), productCategoryCardController.createProductCard);
router.get("/", productCategoryCardController.getProductCards);
router.get("/:id", productCategoryCardController.getProductCardById);
router.put("/:id", upload.single("image"), productCategoryCardController.updateProductCard);
router.delete("/:id", productCategoryCardController.deleteProductCard);

module.exports = router;
