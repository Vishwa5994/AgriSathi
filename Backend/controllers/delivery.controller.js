const db = require("../config/db");
const deliveryModel = require("../models/delivery.model");
const ordersModel = require("../models/orders.model");
const notificationsModel = require("../models/notifications.model");

async function getAllDeliveries(req, res) {
    const data = await deliveryModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Deliveries retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve deliveries" });
}

async function getDeliveryById(req, res) {
    const data = await deliveryModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Delivery retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Delivery not found" });
}

async function getDeliveryByOrder(req, res) {
    const data = await deliveryModel.getByOrderId(req.params.order_id);
    if (data !== false) {
        return res.send({ error: false, data, message: "Order delivery retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve order delivery" });
}

async function createDelivery(req, res) {
    const { order_id, pickup_location, delivery_address, delivery_status, delivery_date, transport_cost } = req.body;

    if (!order_id || !pickup_location || !delivery_address) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: order_id, pickup_location, and delivery_address are required"
        });
    }

    const order = await ordersModel.getById(order_id);
    if (!order) {
        return res.status(404).send({ error: true, message: "Order not found" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const result = await deliveryModel.insert({
            order_id,
            pickup_location,
            delivery_address,
            delivery_status: delivery_status || 'PENDING',
            delivery_date: delivery_date || null,
            transport_cost: transport_cost || 0
        }, connection);

        const deliveryId = result.insertId;

        // Notify buyer
        await notificationsModel.insert({
            user_id: order.buyer_id,
            title: "Delivery Scheduled",
            message: `Logistics delivery #${deliveryId} has been scheduled for Order #${order_id}.`
        }, connection);

        await connection.commit();

        return res.status(201).send({
            error: false,
            data: { delivery_id: deliveryId, order_id, pickup_location, delivery_address, delivery_status: delivery_status || 'PENDING' },
            message: "Delivery record created successfully"
        });
    } catch (err) {
        await connection.rollback();
        console.error("Delivery creation transaction error:", err);
        return res.status(500).send({ error: true, message: "Failed to create delivery record" });
    } finally {
        connection.release();
    }
}

async function updateDeliveryStatus(req, res) {
    const { delivery_status } = req.body;
    const deliveryId = req.params.id;

    if (!delivery_status) {
        return res.status(400).send({ error: true, message: "Validation Error: delivery_status is required" });
    }

    const delivery = await deliveryModel.getById(deliveryId);
    if (!delivery) {
        return res.status(404).send({ error: true, message: "Delivery not found" });
    }

    const order = await ordersModel.getById(delivery.order_id);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await deliveryModel.updateStatus(deliveryId, delivery_status, connection);

        if (order) {
            await notificationsModel.insert({
                user_id: order.buyer_id,
                title: "Delivery Status Updated",
                message: `Delivery status for Order #${delivery.order_id} is now ${delivery_status}.`
            }, connection);
        }

        await connection.commit();

        return res.send({ error: false, message: `Delivery status updated to ${delivery_status} successfully` });
    } catch (err) {
        await connection.rollback();
        console.error("Delivery update transaction error:", err);
        return res.status(500).send({ error: true, message: "Failed to update delivery status" });
    } finally {
        connection.release();
    }
}

async function updateDelivery(req, res) {
    const data = await deliveryModel.update(req.params.id, req.body);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Delivery record updated successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to update delivery record" });
}

async function deleteDelivery(req, res) {
    const data = await deliveryModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Delivery record deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete delivery record" });
}

module.exports = { getAllDeliveries, getDeliveryById, getDeliveryByOrder, createDelivery, updateDeliveryStatus, updateDelivery, deleteDelivery };
