const db = require("../config/db");

async function getAll() {
    try {
        const [data] = await db.query(`
            SELECT bo.*, l.farmer_id, l.product_id, p.product_name, u_buyer.name as buyer_name, u_farmer.name as farmer_name 
            FROM buyer_offers bo
            JOIN listings l ON bo.listing_id = l.listing_id
            JOIN products p ON l.product_id = p.product_id
            JOIN users u_buyer ON bo.buyer_id = u_buyer.user_id
            JOIN users u_farmer ON l.farmer_id = u_farmer.user_id
            ORDER BY bo.offer_id DESC
        `);
        return data;
    } catch (err) {
        console.error("buyerOffers.model getAll error:", err);
        return false;
    }
}

async function getById(id) {
    try {
        const [data] = await db.query(`
            SELECT bo.*, l.farmer_id, l.product_id, l.status as listing_status, p.product_name, u_buyer.name as buyer_name, u_farmer.name as farmer_name 
            FROM buyer_offers bo
            JOIN listings l ON bo.listing_id = l.listing_id
            JOIN products p ON l.product_id = p.product_id
            JOIN users u_buyer ON bo.buyer_id = u_buyer.user_id
            JOIN users u_farmer ON l.farmer_id = u_farmer.user_id
            WHERE bo.offer_id = ?
        `, [id]);
        return data[0] || null;
    } catch (err) {
        console.error("buyerOffers.model getById error:", err);
        return false;
    }
}

async function getByListingId(listingId) {
    try {
        const [data] = await db.query(`
            SELECT bo.*, u_buyer.name as buyer_name, u_buyer.phone as buyer_phone 
            FROM buyer_offers bo
            JOIN users u_buyer ON bo.buyer_id = u_buyer.user_id
            WHERE bo.listing_id = ?
            ORDER BY bo.offer_id DESC
        `, [listingId]);
        return data;
    } catch (err) {
        console.error("buyerOffers.model getByListingId error:", err);
        return false;
    }
}

async function getByBuyerId(buyerId) {
    try {
        const [data] = await db.query(`
            SELECT bo.*, p.product_name, u_farmer.name as farmer_name 
            FROM buyer_offers bo
            JOIN listings l ON bo.listing_id = l.listing_id
            JOIN products p ON l.product_id = p.product_id
            JOIN users u_farmer ON l.farmer_id = u_farmer.user_id
            WHERE bo.buyer_id = ?
            ORDER BY bo.offer_id DESC
        `, [buyerId]);
        return data;
    } catch (err) {
        console.error("buyerOffers.model getByBuyerId error:", err);
        return false;
    }
}

async function insert(offerData, client = db) {
    try {
        const { listing_id, buyer_id, offered_price, quantity, message, status } = offerData;
        const [result] = await client.query(
            "INSERT INTO buyer_offers (listing_id, buyer_id, offered_price, quantity, message, status) VALUES (?, ?, ?, ?, ?, ?)",
            [listing_id, buyer_id, offered_price, quantity, message || null, status || 'PENDING']
        );
        return result;
    } catch (err) {
        console.error("buyerOffers.model insert error:", err);
        throw err;
    }
}

async function updateStatus(id, status, client = db) {
    try {
        const [result] = await client.query(
            "UPDATE buyer_offers SET status = ? WHERE offer_id = ?",
            [status, id]
        );
        return result;
    } catch (err) {
        console.error("buyerOffers.model updateStatus error:", err);
        throw err;
    }
}

async function update(id, offerData) {
    try {
        const { offered_price, quantity, message, status } = offerData;
        const [result] = await db.query(
            "UPDATE buyer_offers SET offered_price = ?, quantity = ?, message = ?, status = ? WHERE offer_id = ?",
            [offered_price, quantity, message || null, status, id]
        );
        return result;
    } catch (err) {
        console.error("buyerOffers.model update error:", err);
        return false;
    }
}

async function deleteById(id) {
    try {
        const [result] = await db.query("DELETE FROM buyer_offers WHERE offer_id = ?", [id]);
        return result;
    } catch (err) {
        console.error("buyerOffers.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getById, getByListingId, getByBuyerId, insert, updateStatus, update, deleteById };
