const authRoutes = require("./router/auth.routes");
const shippingRoutes = require("./router/shipping.routes");
const paymentRoutes = require("./router/payment.routes");

const orderRoutes = require("./router/order.routes");

const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const chapaRoutes = require('./router/chapa.router');
const carouselRoutes = require("./router/carousel.routes");
const productRoutes = require("./router/product-categories.routes");
const productCategoryCardRoutes = require("./router/product-category-card.routes");
const productCardRoutes = require("./router/productCard.router");
const customerRoutes = require("./router/customer.routes");



const session = require('express-session');
const passport = require('./passport');
const socialAuthRoutes = require("./router/social-auth.routes");
const cors = require('cors');

// Parse cookies before everything else
app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
	console.log('[CORS DEBUG] Origin:', req.headers.origin);
	console.log('[COOKIES DEBUG] Incoming cookies:', req.headers.cookie);
	next();
});
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
	   origin: function (origin, callback) {
		   // allow requests with no origin (like mobile apps, curl, etc.)
		   if (!origin) return callback(null, true);
		   if (allowedOrigins.includes(origin)) {
			   return callback(null, true);
		   } else {
			   return callback(new Error('Not allowed by CORS'));
		   }
	   },
	   credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'X-Requested-With', 'x-otp-attempt'],
	   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	   exposedHeaders: ['Set-Cookie'],
}));

app.use(session({
	secret: process.env.SESSION_SECRET || 'your-session-secret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		secure: false, // For local development (HTTP). Use true for HTTPS.
		sameSite: 'lax', // Use 'none' for HTTPS with secure: true
		maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
	}
}));
// Debug outgoing cookies after login
app.use((req, res, next) => {
	const originalSetHeader = res.setHeader;
	res.setHeader = function (name, value) {
		if (name.toLowerCase() === 'set-cookie') {
			console.log('[COOKIES DEBUG] Outgoing Set-Cookie:', value);
		}
		return originalSetHeader.apply(this, arguments);
	};
	next();
});

app.use(passport.initialize());
app.use(passport.session());


// Social Auth API
app.use("/api/social-auth", socialAuthRoutes);

// Health checker enndpoint
app.get("/api/test", (req, res) => {
	res.json({ message: "API is working" });
});



// Auth API
app.use("/api/auth", authRoutes);
// Resend verification email API
const resendVerificationRoutes = require("./router/resendVerification.routes");
resendVerificationRoutes(app._router || app.router || app);


// Carousel API
app.use("/api/carousel", carouselRoutes);
// Product-category API
app.use("/api/products", productRoutes);
// Product-category-card API
app.use("/api/product-category-card", productCategoryCardRoutes);
// Product card API
app.use("/api/product-cards", productCardRoutes);

// Customer Review API
const customerReviewRoutes = require("./router/customerReview.routes");
app.use("/api/customer-reviews", customerReviewRoutes);

// Shipping address API
app.use("/api/shipping", shippingRoutes);

// Payment method API
app.use("/api/payment", paymentRoutes);

// Customer API
app.use("/api/admin/customers", customerRoutes);

// Order API (for testing)
app.use("/api/order", orderRoutes);
app.use("/api/orders", orderRoutes);

// Order cache API (for payment flow)
const orderCacheRoutes = require('./router/orderCache.routes');
app.use('/api/order-cache', orderCacheRoutes);

// Product sales API (sales count, seller count)
const productSalesRoutes = require('./router/productSales.routes');
app.use('/api/product-sales', productSalesRoutes);

// Best sellers by sales API
const bestSellerRoutes = require('./router/bestSeller.routes');
app.use('/api/best-sellers', bestSellerRoutes);

// Chapa payment API
app.use('/api/chapa', chapaRoutes);



// Global error handler (must be last)
app.use((err, req, res, next) => {
	console.error('Global error:', err);
	res.status(err.status || 500).json({
		message: err.message || 'Internal server error',
		error: err.stack || err
	});
});

module.exports = app;
