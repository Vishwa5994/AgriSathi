const db = require("../config/db");

/**
 * GET /api/dashboard/farmer
 * Fetches real SQL-aggregated stats for the authenticated farmer
 */
async function getFarmerDashboard(req, res) {
    try {
        const farmerId = req.query.farmer_id || req.user?.user_id;

        if (!farmerId) {
            return res.status(400).json({
                error: true,
                message: "Missing farmer ID"
            });
        }

        // Run SQL aggregation queries in parallel
        const [
            [listingsAgg],
            [ordersAgg],
            [paymentsAgg],
            [reviewsAgg],
            [notifsAgg],
            [recentOrders]
        ] = await Promise.all([
            // 1. Listings Aggregates
            db.query(`
                SELECT 
                    COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) as total_active_listings,
                    COUNT(*) as total_listings
                FROM listings 
                WHERE farmer_id = ?
            `, [farmerId]),

            // 2. Orders Aggregates (JOIN listings to filter by farmer)
            db.query(`
                SELECT 
                    COUNT(o.order_id) as total_orders_received,
                    COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
                    COUNT(CASE WHEN o.status NOT IN ('COMPLETED', 'CANCELLED') THEN 1 END) as pending_orders,
                    COUNT(CASE WHEN o.status = 'COMPLETED' THEN 1 END) as completed_orders,
                    COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.quantity ELSE 0 END), 0) as total_quantity_sold
                FROM orders o
                JOIN listings l ON o.listing_id = l.listing_id
                WHERE l.farmer_id = ?
            `, [farmerId]),

            // 3. Pending Payments (joined through orders -> listings)
            db.query(`
                SELECT 
                    COALESCE(SUM(p.amount), 0) as pending_payments,
                    COALESCE(SUM(CASE WHEN p.payment_status = 'PAID' THEN p.amount ELSE 0 END), 0) as completed_payments
                FROM payments p
                JOIN orders o ON p.order_id = o.order_id
                JOIN listings l ON o.listing_id = l.listing_id
                WHERE l.farmer_id = ? AND p.payment_status = 'PENDING'
            `, [farmerId]),

            // 4. Reviews & Rating
            db.query(`
                SELECT 
                    COALESCE(AVG(rating), 0) as average_rating,
                    COUNT(review_id) as total_reviews
                FROM reviews
                WHERE reviewee_id = ?
            `, [farmerId]),

            // 5. Unread Notifications
            db.query(`
                SELECT 
                    COUNT(*) as unread_notifications
                FROM notifications
                WHERE user_id = ? AND (is_read IN ('False', '0', 'false') OR is_read = 0 OR is_read IS FALSE)
            `, [farmerId]),

            // 6. Recent 5 Orders for farmer's listings
            db.query(`
                SELECT 
                    o.order_id, o.listing_id, o.buyer_id, o.quantity, o.price_per_unit, o.total_amount, o.status, o.order_date,
                    p.product_name, p.category, p.unit, p.picture,
                    u_buyer.name as buyer_name, u_buyer.phone as buyer_phone,
                    bp.business_name as buyer_business, bp.city as buyer_city,
                    pay.payment_status, pay.payment_method
                FROM orders o
                JOIN listings l ON o.listing_id = l.listing_id
                JOIN products p ON l.product_id = p.product_id
                JOIN users u_buyer ON o.buyer_id = u_buyer.user_id
                LEFT JOIN buyer_profiles bp ON u_buyer.user_id = bp.buyer_id
                LEFT JOIN payments pay ON o.order_id = pay.order_id
                WHERE l.farmer_id = ?
                ORDER BY o.order_id DESC
                LIMIT 5
            `, [farmerId])
        ]);

        const avgRating = Number(reviewsAgg[0]?.average_rating || 0);

        const responseData = {
            total_active_listings: Number(listingsAgg[0]?.total_active_listings || 0),
            total_listings: Number(listingsAgg[0]?.total_listings || 0),
            total_orders_received: Number(ordersAgg[0]?.total_orders_received || 0),
            total_revenue: Number(ordersAgg[0]?.total_revenue || 0),
            pending_orders: Number(ordersAgg[0]?.pending_orders || 0),
            completed_orders: Number(ordersAgg[0]?.completed_orders || 0),
            total_quantity_sold: Number(ordersAgg[0]?.total_quantity_sold || 0),
            pending_payments: Number(paymentsAgg[0]?.pending_payments || 0),
            completed_payments: Number(paymentsAgg[0]?.completed_payments || 0),
            average_rating: avgRating > 0 ? Number(avgRating.toFixed(1)) : 0,
            total_reviews: Number(reviewsAgg[0]?.total_reviews || 0),
            unread_notifications: Number(notifsAgg[0]?.unread_notifications || 0),
            recent_orders: recentOrders.map(ord => ({
                ...ord,
                order_id: Number(ord.order_id),
                quantity: Number(ord.quantity),
                price_per_unit: Number(ord.price_per_unit),
                total_amount: Number(ord.total_amount),
                payment: {
                    payment_status: ord.payment_status || 'PENDING',
                    payment_method: ord.payment_method || null
                }
            }))
        };

        return res.status(200).json({
            error: false,
            data: responseData
        });
    } catch (err) {
        console.error("getFarmerDashboard error:", err);
        return res.status(500).json({
            error: true,
            message: "Failed to fetch farmer dashboard statistics: " + err.message
        });
    }
}

/**
 * GET /api/dashboard/buyer
 * Fetches real SQL-aggregated stats for the authenticated buyer
 */
async function getBuyerDashboard(req, res) {
    try {
        const buyerId = req.query.buyer_id || req.user?.user_id;

        if (!buyerId) {
            return res.status(400).json({
                error: true,
                message: "Missing buyer ID"
            });
        }

        // Run SQL aggregation queries in parallel
        const [
            [ordersAgg],
            [offersAgg],
            [paymentsAgg],
            [notifsAgg],
            [recentOrders]
        ] = await Promise.all([
            // 1. Buyer Orders Aggregates
            db.query(`
                SELECT 
                    COUNT(*) as total_orders_placed,
                    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) as total_spent,
                    COUNT(CASE WHEN status NOT IN ('COMPLETED', 'CANCELLED') THEN 1 END) as pending_orders,
                    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_orders
                FROM orders
                WHERE buyer_id = ?
            `, [buyerId]),

            // 2. Buyer Offers Aggregates
            db.query(`
                SELECT 
                    COUNT(*) as total_offers_made,
                    COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_offers,
                    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_offers,
                    COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_offers
                FROM buyer_offers
                WHERE buyer_id = ?
            `, [buyerId]),

            // 3. Payments Aggregates
            db.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN p.payment_status = 'PAID' THEN p.amount ELSE 0 END), 0) as payments_made,
                    COALESCE(SUM(CASE WHEN p.payment_status = 'PENDING' THEN p.amount ELSE 0 END), 0) as pending_payments
                FROM payments p
                JOIN orders o ON p.order_id = o.order_id
                WHERE o.buyer_id = ?
            `, [buyerId]),

            // 4. Unread Notifications
            db.query(`
                SELECT 
                    COUNT(*) as unread_notifications
                FROM notifications
                WHERE user_id = ? AND (is_read IN ('False', '0', 'false') OR is_read = 0 OR is_read IS FALSE)
            `, [buyerId]),

            // 5. Recent 5 Orders placed by buyer
            db.query(`
                SELECT 
                    o.order_id, o.listing_id, o.buyer_id, o.quantity, o.price_per_unit, o.total_amount, o.status, o.order_date,
                    p.product_name, p.category, p.unit, p.picture,
                    u_farmer.name as farmer_name, u_farmer.phone as farmer_phone,
                    l.location as pickup_location,
                    pay.payment_status, pay.payment_method
                FROM orders o
                JOIN listings l ON o.listing_id = l.listing_id
                JOIN products p ON l.product_id = p.product_id
                JOIN users u_farmer ON l.farmer_id = u_farmer.user_id
                LEFT JOIN payments pay ON o.order_id = pay.order_id
                WHERE o.buyer_id = ?
                ORDER BY o.order_id DESC
                LIMIT 5
            `, [buyerId])
        ]);

        const responseData = {
            total_orders_placed: Number(ordersAgg[0]?.total_orders_placed || 0),
            total_spent: Number(ordersAgg[0]?.total_spent || 0),
            pending_orders: Number(ordersAgg[0]?.pending_orders || 0),
            completed_orders: Number(ordersAgg[0]?.completed_orders || 0),
            total_offers_made: Number(offersAgg[0]?.total_offers_made || 0),
            accepted_offers: Number(offersAgg[0]?.accepted_offers || 0),
            pending_offers: Number(offersAgg[0]?.pending_offers || 0),
            rejected_offers: Number(offersAgg[0]?.rejected_offers || 0),
            payments_made: Number(paymentsAgg[0]?.payments_made || 0),
            pending_payments: Number(paymentsAgg[0]?.pending_payments || 0),
            unread_notifications: Number(notifsAgg[0]?.unread_notifications || 0),
            recent_orders: recentOrders.map(ord => ({
                ...ord,
                order_id: Number(ord.order_id),
                quantity: Number(ord.quantity),
                price_per_unit: Number(ord.price_per_unit),
                total_amount: Number(ord.total_amount),
                payment: {
                    payment_status: ord.payment_status || 'PENDING',
                    payment_method: ord.payment_method || null
                }
            }))
        };

        return res.status(200).json({
            error: false,
            data: responseData
        });
    } catch (err) {
        console.error("getBuyerDashboard error:", err);
        return res.status(500).json({
            error: true,
            message: "Failed to fetch buyer dashboard statistics: " + err.message
        });
    }
}

/**
 * GET /api/dashboard/admin
 * Fetches platform-wide real SQL-aggregated stats (Admin role restricted)
 */
async function getAdminDashboard(req, res) {
    try {
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                error: true,
                message: "Forbidden: Access restricted to ADMIN role"
            });
        }

        // Run platform-wide SQL aggregate queries in parallel
        const [
            [usersAgg],
            [listingsAgg],
            [ordersAgg],
            [paymentsAgg],
            [deliveriesAgg],
            [reviewsAgg],
            [topFarmers],
            [signupTrend]
        ] = await Promise.all([
            // 1. Users Breakdown
            db.query(`
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN role = 'FARMER' THEN 1 END) as total_farmers,
                    COUNT(CASE WHEN role = 'BUYER' THEN 1 END) as total_buyers,
                    COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as total_admins
                FROM users
            `),

            // 2. Listings Breakdown
            db.query(`
                SELECT 
                    COUNT(*) as total_listings,
                    COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) as available_listings,
                    COUNT(CASE WHEN status = 'SOLD' THEN 1 END) as sold_listings,
                    COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) as expired_listings
                FROM listings
            `),

            // 3. Orders Breakdown & Platform Revenue
            db.query(`
                SELECT 
                    COUNT(*) as total_orders,
                    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_orders,
                    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_orders,
                    COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_orders,
                    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_orders,
                    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) as total_platform_revenue,
                    COALESCE(AVG(CASE WHEN status = 'COMPLETED' THEN total_amount END), 0) as average_order_value
                FROM orders
            `),

            // 4. Payments Aggregates
            db.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END), 0) as total_payments_processed,
                    COALESCE(SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END), 0) as pending_payments,
                    COUNT(payment_id) as total_payments_count
                FROM payments
            `),

            // 5. Deliveries Aggregates
            db.query(`
                SELECT 
                    COUNT(*) as total_deliveries,
                    COUNT(CASE WHEN delivery_status = 'DELIVERED' THEN 1 END) as delivered_count,
                    COUNT(CASE WHEN delivery_status = 'PENDING' THEN 1 END) as pending_delivery_count,
                    COUNT(CASE WHEN delivery_status = 'IN_TRANSIT' THEN 1 END) as in_transit_count
                FROM delivery_logistics
            `),

            // 6. Platform Reviews & Ratings
            db.query(`
                SELECT 
                    COALESCE(AVG(rating), 0) as average_platform_rating,
                    COUNT(*) as total_reviews
                FROM reviews
            `),

            // 7. Top 5 Farmers by Completed Orders Revenue
            db.query(`
                SELECT 
                    l.farmer_id,
                    u.name as farmer_name,
                    u.email as farmer_email,
                    fp.district, fp.state,
                    COALESCE(SUM(o.total_amount), 0) as total_revenue,
                    COUNT(o.order_id) as total_orders_completed,
                    COALESCE(SUM(o.quantity), 0) as total_quantity_sold
                FROM orders o
                JOIN listings l ON o.listing_id = l.listing_id
                JOIN users u ON l.farmer_id = u.user_id
                LEFT JOIN farmer_profiles fp ON u.user_id = fp.farmer_id
                WHERE o.status = 'COMPLETED'
                GROUP BY l.farmer_id, u.name, u.email, fp.district, fp.state
                ORDER BY total_revenue DESC
                LIMIT 5
            `),

            // 8. User Signups Trend (Last 14 days)
            db.query(`
                SELECT 
                    DATE(created_at) as signup_date,
                    COUNT(*) as count,
                    COUNT(CASE WHEN role = 'FARMER' THEN 1 END) as farmers,
                    COUNT(CASE WHEN role = 'BUYER' THEN 1 END) as buyers
                FROM users
                WHERE created_at IS NOT NULL
                GROUP BY DATE(created_at)
                ORDER BY signup_date DESC
                LIMIT 14
            `)
        ]);

        const platformAvgRating = Number(reviewsAgg[0]?.average_platform_rating || 0);

        const responseData = {
            users: {
                total_users: Number(usersAgg[0]?.total_users || 0),
                total_farmers: Number(usersAgg[0]?.total_farmers || 0),
                total_buyers: Number(usersAgg[0]?.total_buyers || 0),
                total_admins: Number(usersAgg[0]?.total_admins || 0)
            },
            listings: {
                total_listings: Number(listingsAgg[0]?.total_listings || 0),
                available_listings: Number(listingsAgg[0]?.available_listings || 0),
                sold_listings: Number(listingsAgg[0]?.sold_listings || 0),
                expired_listings: Number(listingsAgg[0]?.expired_listings || 0)
            },
            orders: {
                total_orders: Number(ordersAgg[0]?.total_orders || 0),
                completed_orders: Number(ordersAgg[0]?.completed_orders || 0),
                pending_orders: Number(ordersAgg[0]?.pending_orders || 0),
                confirmed_orders: Number(ordersAgg[0]?.confirmed_orders || 0),
                cancelled_orders: Number(ordersAgg[0]?.cancelled_orders || 0),
                total_platform_revenue: Number(ordersAgg[0]?.total_platform_revenue || 0),
                average_order_value: Number(Number(ordersAgg[0]?.average_order_value || 0).toFixed(2))
            },
            payments: {
                total_payments_processed: Number(paymentsAgg[0]?.total_payments_processed || 0),
                pending_payments: Number(paymentsAgg[0]?.pending_payments || 0),
                total_payments_count: Number(paymentsAgg[0]?.total_payments_count || 0)
            },
            deliveries: {
                total_deliveries: Number(deliveriesAgg[0]?.total_deliveries || 0),
                delivered_count: Number(deliveriesAgg[0]?.delivered_count || 0),
                pending_delivery_count: Number(deliveriesAgg[0]?.pending_delivery_count || 0),
                in_transit_count: Number(deliveriesAgg[0]?.in_transit_count || 0)
            },
            reviews: {
                average_platform_rating: platformAvgRating > 0 ? Number(platformAvgRating.toFixed(2)) : 0,
                total_reviews: Number(reviewsAgg[0]?.total_reviews || 0)
            },
            top_farmers: topFarmers.map(f => ({
                farmer_id: Number(f.farmer_id),
                farmer_name: f.farmer_name,
                farmer_email: f.farmer_email,
                district: f.district || 'N/A',
                state: f.state || 'N/A',
                total_revenue: Number(f.total_revenue),
                total_orders_completed: Number(f.total_orders_completed),
                total_quantity_sold: Number(f.total_quantity_sold)
            })),
            user_signups_trend: signupTrend.map(s => ({
                signup_date: s.signup_date,
                count: Number(s.count),
                farmers: Number(s.farmers),
                buyers: Number(s.buyers)
            }))
        };

        return res.status(200).json({
            error: false,
            data: responseData
        });
    } catch (err) {
        console.error("getAdminDashboard error:", err);
        return res.status(500).json({
            error: true,
            message: "Failed to fetch admin dashboard statistics: " + err.message
        });
    }
}

module.exports = {
    getFarmerDashboard,
    getBuyerDashboard,
    getAdminDashboard
};
