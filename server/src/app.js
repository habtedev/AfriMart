const authRoutes = require("./router/auth.routes");

const express = require("express");
const app = express();

const carouselRoutes = require("./router/carousel.routes");
const productRoutes = require("./router/product-categories.routes");
const productCategoryCardRoutes = require("./router/product-category-card.routes");
const productCardRoutes = require("./router/productCard.router");

const cors = require('cors');

app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
}));
app.use(express.json());

// Health checker enndpoint
app.get("/api/test", (req, res) => {
	res.json({ message: "API is working" });
});



// Auth API
app.use("/api/auth", authRoutes);

// Carousel API
app.use("/api/carousel", carouselRoutes);
// Product-category API
app.use("/api/products", productRoutes);
// Product-category-card API
app.use("/api/product-category-card", productCategoryCardRoutes);
// Product card API
app.use("/api/product-cards", productCardRoutes);


// Global error handler (must be last)
app.use((err, req, res, next) => {
	console.error('Global error:', err);
	res.status(err.status || 500).json({
		message: err.message || 'Internal server error',
		error: err.stack || err
	});
});

module.exports = app;
