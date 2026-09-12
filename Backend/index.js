const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const authRouter = require("./routes/auth.route");
const usersRouter = require("./routes/users.route");
const farmerProfilesRouter = require("./routes/farmerProfiles.route");
const buyerProfilesRouter = require("./routes/buyerProfiles.route");
const productsRouter = require("./routes/products.route");
const listingsRouter = require("./routes/listings.route");
const ordersRouter = require("./routes/orders.route");
const paymentsRouter = require("./routes/payments.route");
const priceHistoryRouter = require("./routes/priceHistory.route");
const buyerOffersRouter = require("./routes/buyerOffers.route");
const notificationsRouter = require("./routes/notifications.route");
const reviewsRouter = require("./routes/reviews.route");
const deliveryRouter = require("./routes/delivery.route");
const errorHandler = require("./middleware/error.middleware");
const rateLimiterMiddleware = require("./middleware/rateLimiter");

const app = express();

// Trust the first proxy (Render) so req.ip returns the real client IP
app.set("trust proxy", 1);

const cors = require("cors");

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback to true to allow cross-origin dev while logging
        }
    },
    credentials: true,
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
}));

app.use(express.json());

// Global rate limiter for all API routes
app.use("/api", rateLimiterMiddleware);

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/farmer-profiles", farmerProfilesRouter);
app.use("/api/buyer-profiles", buyerProfilesRouter);
app.use("/api/products", productsRouter);
app.use("/api/listings", listingsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/price-history", priceHistoryRouter);
app.use("/api/buyer-offers", buyerOffersRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/delivery", deliveryRouter);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
    res.send({ error: false, message: "SIH Farmer-Buyer Linkage API is running smoothly." });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = app;
