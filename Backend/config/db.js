const { createPool } = require("mysql2/promise");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const buildSslConfig = () => {
    const isSslEnabled = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' || process.env.DB_SSL === true;
    if (!isSslEnabled) {
        return undefined;
    }

    const ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    };

    if (process.env.DB_SSL_CA_PATH) {
        try {
            if (fs.existsSync(process.env.DB_SSL_CA_PATH)) {
                ssl.ca = fs.readFileSync(process.env.DB_SSL_CA_PATH);
            }
        } catch (err) {
            console.warn(`Warning: Could not read DB_SSL_CA_PATH file: ${err.message}`);
        }
    }

    return ssl;
};

const sslConfig = buildSslConfig();

const db = createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "farmer",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...(sslConfig ? { ssl: sslConfig } : {})
});

// Startup check: run SELECT 1 against pool on server boot
(async () => {
    try {
        await db.query("SELECT 1");
        console.log("✅ Connected to TiDB Cloud");
    } catch (err) {
        console.error(`❌ Failed to connect to TiDB Cloud: ${err.message}`);
    }
})();

module.exports = db;
