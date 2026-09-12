const db = require("../config/db");
const paymentsModel = require("../models/payments.model");
const ordersModel = require("../models/orders.model");
const notificationsModel = require("../models/notifications.model");

async function getAllPayments(req, res) {
    const data = await paymentsModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Payments retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve payments" });
}

async function getPaymentById(req, res) {
    const data = await paymentsModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Payment retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Payment not found" });
}

async function getPaymentsByOrder(req, res) {
    const data = await paymentsModel.getByOrderId(req.params.order_id);
    if (data !== false) {
        return res.send({ error: false, data, message: "Order payments retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve order payments" });
}

async function createPayment(req, res) {
    const { order_id, amount, payment_method, payment_status, transaction_id } = req.body;

    if (!order_id || !amount || !payment_method) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: order_id, amount, and payment_method are required"
        });
    }

    const order = await ordersModel.getById(order_id);
    if (!order) {
        return res.status(404).send({ error: true, message: "Order not found" });
    }

    const status = payment_status || 'PENDING';
    const paidAt = status === 'PAID' ? new Date() : null;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const result = await paymentsModel.insert({
            order_id,
            amount,
            payment_method,
            payment_status: status,
            transaction_id: transaction_id || null,
            paid_at: paidAt
        }, connection);

        const paymentId = result.insertId;

        if (status === 'PAID') {
            await notificationsModel.insert({
                user_id: order.farmer_id,
                title: "Payment Received",
                message: `Payment of ₹${amount} via ${payment_method} for Order #${order_id} has been marked as PAID.`
            }, connection);
        }

        await connection.commit();

        return res.status(201).send({
            error: false,
            data: { payment_id: paymentId, order_id, amount, payment_method, payment_status: status },
            message: "Payment record created successfully"
        });
    } catch (err) {
        await connection.rollback();
        console.error("Payment creation transaction error:", err);
        return res.status(500).send({ error: true, message: "Failed to process payment record" });
    } finally {
        connection.release();
    }
}

async function updatePaymentStatus(req, res) {
    const { payment_status, transaction_id } = req.body;
    const paymentId = req.params.id;

    if (!payment_status) {
        return res.status(400).send({ error: true, message: "Validation Error: payment_status is required" });
    }

    const payment = await paymentsModel.getById(paymentId);
    if (!payment) {
        return res.status(404).send({ error: true, message: "Payment not found" });
    }

    const order = await ordersModel.getById(payment.order_id);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await paymentsModel.updateStatus(paymentId, payment_status, transaction_id, connection);

        if (payment_status === 'PAID' && order) {
            await notificationsModel.insert({
                user_id: order.farmer_id,
                title: "Payment Received",
                message: `Payment of ₹${payment.amount} for Order #${payment.order_id} has been successfully paid.`
            }, connection);
        }

        await connection.commit();

        return res.send({ error: false, message: `Payment status updated to ${payment_status} successfully` });
    } catch (err) {
        await connection.rollback();
        console.error("Payment update transaction error:", err);
        return res.status(500).send({ error: true, message: "Failed to update payment status" });
    } finally {
        connection.release();
    }
}

async function deletePayment(req, res) {
    const data = await paymentsModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Payment record deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete payment record" });
}

module.exports = { getAllPayments, getPaymentById, getPaymentsByOrder, createPayment, updatePaymentStatus, deletePayment };
