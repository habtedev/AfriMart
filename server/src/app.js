
const express = require("express");
const app = express();

const carouselRoutes = require("./router/carousel.routes");
const productRoutes = require("./router/product-categories.routes");


const cors = require('cors');
app.use(cors());
app.use(express.json());

// Health checker enndpoint
app.get("/api/test", (req, res) => {
	res.json({ message: "API is working" });
});


// Carousel API
app.use("/api/carousel", carouselRoutes);

// Product API
app.use("/api/products", productRoutes);

module.exports = app;
