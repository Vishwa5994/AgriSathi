const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function authMiddleware(req, res, next) {
    try {
        if (req.url.toString().indexOf('login') > -1 || req.url.toString().indexOf('register') > -1) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({
                error: true,
                message: "Unauthorized: Missing or invalid authorization token"
            });
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || process.env.secret || "super_secret_sih_farmer_market_key_2026";
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({
            error: true,
            message: "Unauthorized: Invalid or expired token"
        });
    }
}

function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const secret = process.env.JWT_SECRET || process.env.secret || "super_secret_sih_farmer_market_key_2026";
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
        }
    } catch (err) {
        // Silently continue without authenticated user context
    }
    next();
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).send({
                error: true,
                message: `Forbidden: Access restricted to roles [${allowedRoles.join(", ")}]`
            });
        }
        next();
    };
}

module.exports = { authMiddleware, optionalAuthMiddleware, authorizeRoles };

