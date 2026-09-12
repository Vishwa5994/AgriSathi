const db = require("../config/db");

async function getAll() {
    try {
        const [data] = await db.query(`
            SELECT fp.*, u.name, u.email, u.phone 
            FROM farmer_profiles fp
            JOIN users u ON fp.farmer_id = u.user_id
        `);
        return data;
    } catch (err) {
        console.error("farmerProfiles.model getAll error:", err);
        return false;
    }
}

async function getByFarmerId(farmerId) {
    try {
        const [data] = await db.query(`
            SELECT fp.*, u.name, u.email, u.phone 
            FROM farmer_profiles fp
            JOIN users u ON fp.farmer_id = u.user_id
            WHERE fp.farmer_id = ?
        `, [farmerId]);
        return data[0] || null;
    } catch (err) {
        console.error("farmerProfiles.model getByFarmerId error:", err);
        return false;
    }
}

async function insert(profileData, client = db) {
    try {
        const { farmer_id, picture, village, district, state, land_area } = profileData;
        const [result] = await client.query(
            "INSERT INTO farmer_profiles (farmer_id, picture, village, district, state, land_area) VALUES (?, ?, ?, ?, ?, ?)",
            [farmer_id, picture || null, village || null, district || null, state || null, land_area || 0]
        );
        return result;
    } catch (err) {
        console.error("farmerProfiles.model insert error:", err);
        throw err;
    }
}

async function update(farmerId, profileData) {
    try {
        const { picture, village, district, state, land_area } = profileData;
        const [result] = await db.query(
            "UPDATE farmer_profiles SET picture = ?, village = ?, district = ?, state = ?, land_area = ? WHERE farmer_id = ?",
            [picture || null, village || null, district || null, state || null, land_area || 0, farmerId]
        );
        return result;
    } catch (err) {
        console.error("farmerProfiles.model update error:", err);
        return false;
    }
}

async function deleteById(farmerId) {
    try {
        const [result] = await db.query("DELETE FROM farmer_profiles WHERE farmer_id = ?", [farmerId]);
        return result;
    } catch (err) {
        console.error("farmerProfiles.model deleteById error:", err);
        return false;
    }
}

module.exports = { getAll, getByFarmerId, insert, update, deleteById };
