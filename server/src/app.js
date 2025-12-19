
const express = require("express");
const app = express();

const carouselRoutes = require("./router/carousel.routes");
const productRoutes = require("./router/product-categories.routes");
const productCategoryCardRoutes = require("./router/product-category-card.routes");
const productCardRoutes = require("./router/productCard.router");

const cors = require('cors');

app.use(cors());
app.use(express.json());

// Health checker enndpoint
app.get("/api/test", (req, res) => {
	res.json({ message: "API is working" });
});


// Carousel API
app.use("/api/carousel", carouselRoutes);

// Product-category API
app.use("/api/products", productRoutes);

// Product-category-card API
app.use("/api/product-category-card", productCategoryCardRoutes);
// Product card API
app.use("/api/product-cards", productCardRoutes);

module.exports = app;
