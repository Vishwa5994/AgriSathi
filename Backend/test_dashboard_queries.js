require('dotenv').config();
const db = require('./config/db');

async function testAll() {
  try {
    // 1. Find top farmers with orders
    const [farmerIds] = await db.query(`
      SELECT l.farmer_id, COUNT(o.order_id) as orders_count 
      FROM listings l 
      JOIN orders o ON l.listing_id = o.listing_id 
      GROUP BY l.farmer_id 
      ORDER BY orders_count DESC 
      LIMIT 3
    `);
    console.log('Top farmers with orders:', farmerIds);
    const farmerId = farmerIds[0]?.farmer_id || 10002;

    // Test Farmer Dashboard Queries
    console.log('\n=== TESTING FARMER DASHBOARD FOR ID:', farmerId);
    const [listingsAgg] = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) as total_active_listings,
        COUNT(*) as total_listings
      FROM listings 
      WHERE farmer_id = ?
    `, [farmerId]);
    console.log('Listings agg:', listingsAgg[0]);

    const [ordersAgg] = await db.query(`
      SELECT 
        COUNT(o.order_id) as total_orders_received,
        COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN o.status NOT IN ('COMPLETED', 'CANCELLED') THEN 1 END) as pending_orders,
        COALESCE(SUM(CASE WHEN o.status = 'COMPLETED' THEN o.quantity ELSE 0 END), 0) as total_quantity_sold
      FROM orders o
      JOIN listings l ON o.listing_id = l.listing_id
      WHERE l.farmer_id = ?
    `, [farmerId]);
    console.log('Orders agg:', ordersAgg[0]);

    const [pendingPay] = await db.query(`
      SELECT 
        COALESCE(SUM(p.amount), 0) as pending_payments
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      JOIN listings l ON o.listing_id = l.listing_id
      WHERE l.farmer_id = ? AND p.payment_status = 'PENDING'
    `, [farmerId]);
    console.log('Pending pay:', pendingPay[0]);

    const [ratingsAgg] = await db.query(`
      SELECT 
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(review_id) as total_reviews
      FROM reviews
      WHERE reviewee_id = ?
    `, [farmerId]);
    console.log('Ratings agg:', ratingsAgg[0]);

    const [notifAgg] = await db.query(`
      SELECT 
        COUNT(*) as unread_notifications
      FROM notifications
      WHERE user_id = ? AND (is_read IN ('False', '0', 'false') OR is_read = 0 OR is_read IS FALSE)
    `, [farmerId]);
    console.log('Notif agg:', notifAgg[0]);

    const [recentOrders] = await db.query(`
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
    `, [farmerId]);
    console.log('Farmer recent orders count:', recentOrders.length);

    // 2. Find a buyer
    const [buyerIds] = await db.query(`
      SELECT buyer_id, COUNT(*) as orders_count 
      FROM orders 
      GROUP BY buyer_id 
      ORDER BY orders_count DESC 
      LIMIT 3
    `);
    console.log('\nTop buyers with orders:', buyerIds);
    const buyerId = buyerIds[0]?.buyer_id || 1;

    console.log('\n=== TESTING BUYER DASHBOARD FOR ID:', buyerId);
    const [buyerOrdersAgg] = await db.query(`
      SELECT 
        COUNT(*) as total_orders_placed,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) as total_spent,
        COUNT(CASE WHEN status NOT IN ('COMPLETED', 'CANCELLED') THEN 1 END) as pending_orders
      FROM orders
      WHERE buyer_id = ?
    `, [buyerId]);
    console.log('Buyer orders agg:', buyerOrdersAgg[0]);

    const [buyerOffersAgg] = await db.query(`
      SELECT 
        COUNT(*) as total_offers_made,
        COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_offers
      FROM buyer_offers
      WHERE buyer_id = ?
    `, [buyerId]);
    console.log('Buyer offers agg:', buyerOffersAgg[0]);

    const [buyerPayAgg] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN p.payment_status = 'PAID' THEN p.amount ELSE 0 END), 0) as payments_made,
        COALESCE(SUM(CASE WHEN p.payment_status = 'PENDING' THEN p.amount ELSE 0 END), 0) as pending_payments
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      WHERE o.buyer_id = ?
    `, [buyerId]);
    console.log('Buyer pay agg:', buyerPayAgg[0]);

    const [buyerRecentOrders] = await db.query(`
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
    `, [buyerId]);
    console.log('Buyer recent orders count:', buyerRecentOrders.length);

    // 3. Admin Dashboard
    console.log('\n=== TESTING ADMIN DASHBOARD ===');
    const [usersAdmin] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'FARMER' THEN 1 END) as total_farmers,
        COUNT(CASE WHEN role = 'BUYER' THEN 1 END) as total_buyers,
        COUNT(CASE WHEN role = 'ADMIN' THEN 1 END) as total_admins
      FROM users
    `);
    console.log('Admin users:', usersAdmin[0]);

    const [listingsAdmin] = await db.query(`
      SELECT 
        COUNT(*) as total_listings,
        COUNT(CASE WHEN status = 'AVAILABLE' THEN 1 END) as available_listings,
        COUNT(CASE WHEN status = 'SOLD' THEN 1 END) as sold_listings,
        COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) as expired_listings
      FROM listings
    `);
    console.log('Admin listings:', listingsAdmin[0]);

    const [ordersAdmin] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) as total_platform_revenue,
        COALESCE(AVG(CASE WHEN status = 'COMPLETED' THEN total_amount END), 0) as average_order_value
      FROM orders
    `);
    console.log('Admin orders:', ordersAdmin[0]);

    const [paymentsAdmin] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END), 0) as total_payments_processed,
        COALESCE(SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END), 0) as pending_payments,
        COUNT(payment_id) as total_payments_count
      FROM payments
    `);
    console.log('Admin payments:', paymentsAdmin[0]);

    const [deliveryAdmin] = await db.query(`
      SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN delivery_status = 'DELIVERED' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN delivery_status = 'PENDING' THEN 1 END) as pending_delivery_count,
        COUNT(CASE WHEN delivery_status = 'IN_TRANSIT' THEN 1 END) as in_transit_count
      FROM delivery_logistics
    `);
    console.log('Admin deliveries:', deliveryAdmin[0]);

    const [ratingAdmin] = await db.query(`
      SELECT 
        COALESCE(AVG(rating), 0) as average_platform_rating,
        COUNT(*) as total_reviews
      FROM reviews
    `);
    console.log('Admin rating:', ratingAdmin[0]);

    const [topFarmers] = await db.query(`
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
    `);
    console.log('Top farmers:', topFarmers);

    const [signupTrend] = await db.query(`
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
    `);
    console.log('Signup trend (last few):', signupTrend.slice(0, 5));

    console.log('\nALL QUERIES EXECUTED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testAll();
