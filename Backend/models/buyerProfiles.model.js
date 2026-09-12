const db = require("../config/db");

async function getAll() {
    try {
        const [data] = await db.query(`
            SELECT bp.*, u.name, u.email, u.phone 
            FROM buyer_profiles bp
            JOIN users u ON bp.buyer_id = u.user_id
        `);
        return data;
    } catch (err) {
        console.error("buyerProfiles.model getAll error:", err);
        return false;
    }
}

async function getByBuyerId(buyerId) {
    try {
        const [data] = await db.query(`
            SELECT bp.*, u.name, u.email, u.phone 
            FROM buyer_profiles bp
            JOIN users u ON bp.buyer_id = u.user_id
            WHERE bp.buyer_id = ?
        `, [buyerId]);
        return data[0] || null;
    } catch (err) {
        console.error("buyerProfiles.model getByBuyerId error:", err);
        return false;
    }
}

async function insert(profileData, client = db) {
    try {
        const { buyer_id, picture, business_name, buyer_type, address, city } = profileData;
        const [result] = await client.query(
            "INSERT INTO buyer_profiles (buyer_id, picture, business_name, buyer_type, address, city) VALUES (?, ?, ?, ?, ?, ?)",
            [buyer_id, picture || null, business_name || null, buyer_type || 'CONSUMER', address || null, city || null]
        );
        return result;
    } catch (err) {
        console.error("buyerProfiles.model insert error:", err);
        throw err;
    }
}

async function update(buyerId, profileData) {
    try {
        const { picture, business_name, buyer_type, address, city } = profileData;
        const [result] = await db.query(
            "UPDATE buyer_profiles SET picture = ?, business_name = ?, buyer_type = ?, address = ?, city = ? WHERE buyer_id = ?",
            [picture || null, business_name || null, buyer_type || 'CONSUMER', address || null, city || null, buyerId]
        );
        return result;
    } catch (err) {
        console.error("buyerProfiles.model update error:", err);
        return false;
    }
}

async function deleteById(buyerId) {
    try {
        const [result] = await db.query("DELETE FROM buyer_profiles WHERE buyer_id = ?", [buyerId]);
        return result;
    } catch (err) {
        console.error("buyerProfiles.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getByBuyerId, insert, update, deleteById };
