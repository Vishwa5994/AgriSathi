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

const app = express();

// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

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
