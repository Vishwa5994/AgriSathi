const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../config/db");
const usersModel = require("../models/users.model");
const farmerProfilesModel = require("../models/farmerProfiles.model");
const buyerProfilesModel = require("../models/buyerProfiles.model");

dotenv.config();

async function register(req, res) {
    const { name, email, phone, password, role, picture, village, district, state, land_area, business_name, buyer_type, address, city } = req.body;

    if (!name || !email || !phone || !password || !role) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: name, email, phone, password, and role are required"
        });
    }

    const validRoles = ["FARMER", "BUYER", "ADMIN"];
    if (!validRoles.includes(role.toUpperCase())) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: role must be FARMER, BUYER, or ADMIN"
        });
    }

    const existingUser = await usersModel.getByEmail(email);
    if (existingUser) {
        return res.status(400).send({
            error: true,
            message: "User with this email already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const userResult = await usersModel.insert({
            name,
            email,
            phone,
            password: hashedPassword,
            picture: picture || null,
            role: role.toUpperCase()
        }, connection);

        const userId = userResult.insertId;

        if (role.toUpperCase() === "FARMER") {
            await farmerProfilesModel.insert({
                farmer_id: userId,
                picture: picture || null,
                village: village || null,
                district: district || null,
                state: state || null,
                land_area: land_area || 0
            }, connection);
        } else if (role.toUpperCase() === "BUYER") {
            await buyerProfilesModel.insert({
                buyer_id: userId,
                picture: picture || null,
                business_name: business_name || null,
                buyer_type: buyer_type ? buyer_type.toUpperCase() : "CONSUMER",
                address: address || null,
                city: city || null
            }, connection);
        }

        await connection.commit();

        return res.status(201).send({
            error: false,
            data: { user_id: userId, name, email, phone, role: role.toUpperCase() },
            message: "User registered successfully with profile created transactionally"
        });
    } catch (err) {
        await connection.rollback();
        console.error("Transactional registration failed:", err);
        return res.status(500).send({
            error: true,
            message: `Registration failed: ${err.message}`
        });
    } finally {
        connection.release();
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: email and password are required"
        });
    }

    const user = await usersModel.getByEmail(email);
    if (!user) {
        return res.status(401).send({
            error: true,
            message: "Invalid email or password"
        });
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && user.password === password) {
        isMatch = true;
    }
    if (!isMatch) {
        return res.status(401).send({
            error: true,
            message: "Invalid email or password"
        });
    }

    const payload = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const secret = process.env.JWT_SECRET || process.env.secret || "super_secret_sih_farmer_market_key_2026";
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    const token = jwt.sign(payload, secret, { expiresIn });

    return res.send({
        error: false,
        token,
        user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            picture: user.picture
        },
        message: "Login successful"
    });
}

async function getMe(req, res) {
    const userId = req.user.user_id;
    const user = await usersModel.getById(userId);

    if (!user) {
        return res.status(404).send({
            error: true,
            message: "User profile not found"
        });
    }

    let profile = null;
    if (user.role === "FARMER") {
        profile = await farmerProfilesModel.getByFarmerId(userId);
    } else if (user.role === "BUYER") {
        profile = await buyerProfilesModel.getByBuyerId(userId);
    }

    return res.send({
        error: false,
        data: {
            ...user,
            profile
        },
        message: "User profile retrieved successfully"
    });
}

async function logout(req, res) {
    return res.send({
        error: false,
        message: "Logout successful"
    });
}

module.exports = { register, login, getMe, logout };
