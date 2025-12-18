const express = require("express");
const router = express.Router();
const productController = require("../controller/product-categories.controller");
const upload = require("../utils/multer");

router.post("/", upload.single("image"), productController.createProduct);
router.get("/", productController.getProducts);
router.put("/:id", upload.single("image"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
