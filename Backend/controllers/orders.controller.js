const db = require("../config/db");
const ordersModel = require("../models/orders.model");
const listingsModel = require("../models/listings.model");
const notificationsModel = require("../models/notifications.model");

async function getAllOrders(req, res) {
    const { buyer_id, farmer_id, status, limit, offset } = req.query;
    const data = await ordersModel.getAll({ buyer_id, farmer_id, status, limit, offset });
    if (data !== false) {
        return res.send({ error: false, data, message: "Orders retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve orders" });
}

async function getOrderById(req, res) {
    const data = await ordersModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Order retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Order not found" });
}

async function createOrder(req, res) {
    const buyer_id = req.user.role === "BUYER" ? req.user.user_id : (req.body.buyer_id || req.user.user_id);
    const { listing_id, quantity, price_per_unit, status } = req.body;

    if (!listing_id || !quantity || !price_per_unit) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: listing_id, quantity, and price_per_unit are required"
        });
    }

    const listing = await listingsModel.getById(listing_id);
    if (!listing) {
        return res.status(404).send({ error: true, message: "Listing not found" });
    }

    if (listing.status !== "AVAILABLE") {
        return res.status(400).send({
            error: true,
            message: `Cannot place order: Listing status is '${listing.status}'. Only AVAILABLE listings accept orders.`
        });
    }

    const total_amount = Number(quantity) * Number(price_per_unit);
    const orderStatus = status || 'CONFIRMED';

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const orderResult = await ordersModel.insert({
            listing_id,
            buyer_id,
            quantity,
            price_per_unit,
            total_amount,
            status: orderStatus
        }, connection);

        const orderId = orderResult.insertId;

        if (orderStatus === 'CONFIRMED') {
            await listingsModel.updateStatus(listing_id, 'SOLD', connection);
        }

        // Trigger notification to Farmer
        await notificationsModel.insert({
            user_id: listing.farmer_id,
            title: "New Order Received",
            message: `A new order (#${orderId}) of ${quantity} ${listing.unit} for ₹${total_amount} has been placed on your listing.`
        }, connection);

        await connection.commit();

        return res.status(201).send({
            error: false,
            data: { order_id: orderId, listing_id, buyer_id, quantity, price_per_unit, total_amount, status: orderStatus },
            message: "Order placed successfully, listing status updated, and farmer notified"
        });
    } catch (err) {
        await connection.rollback();
        console.error("Order creation transaction error:", err);
        return res.status(500).send({ error: true, message: "Failed to place order" });
    } finally {
        connection.release();
    }
}

async function updateOrderStatus(req, res) {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
        return res.status(400).send({ error: true, message: "Validation Error: status is required" });
    }

    const order = await ordersModel.getById(orderId);
    if (!order) {
        return res.status(404).send({ error: true, message: "Order not found" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await ordersModel.updateStatus(orderId, status, connection);

        if (status === 'CONFIRMED') {
            await listingsModel.updateStatus(order.listing_id, 'SOLD', connection);
            await notificationsModel.insert({
                user_id: order.farmer_id,
                title: "Order Confirmed",
                message: `Order #${orderId} has been confirmed.`
            }, connection);
        } else if (status === 'CANCELLED') {
            await listingsModel.updateStatus(order.listing_id, 'AVAILABLE', connection);
            await notificationsModel.insert({
                user_id: order.buyer_id,
                title: "Order Cancelled",
                message: `Order #${orderId} has been cancelled.`
            }, connection);
        }

        await connection.commit();

        return res.send({ error: false, message: `Order status updated to ${status} successfully` });
    } catch (err) {
        await connection.rollback();
        console.error("Order status update transaction error:", err);
        return res.status(500).send({ error: true, message: "Failed to update order status" });
    } finally {
        connection.release();
    }
}

async function deleteOrder(req, res) {
    const data = await ordersModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Order deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete order" });
}

module.exports = { getAllOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder };
