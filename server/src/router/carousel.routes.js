const express = require("express");
const router = express.Router();
const carouselController = require("../controller/carousel.controller");
const upload = require("../utils/multer");

router.get("/", carouselController.getAllCarousel);
router.post("/", upload.single("image"), carouselController.addCarousel);
router.put("/:id", carouselController.updateCarousel);
router.delete("/:id", carouselController.deleteCarousel);

module.exports = router;
