const db = require("../config/db");
const buyerOffersModel = require("../models/buyerOffers.model");
const listingsModel = require("../models/listings.model");
const ordersModel = require("../models/orders.model");
const notificationsModel = require("../models/notifications.model");

async function getAllOffers(req, res) {
    const data = await buyerOffersModel.getAll();
    if (data !== false) {
        return res.send({ error: false, data, message: "Buyer offers retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve buyer offers" });
}

async function getOfferById(req, res) {
    const data = await buyerOffersModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data, message: "Buyer offer retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Buyer offer not found" });
}

async function getOffersByListing(req, res) {
    const data = await buyerOffersModel.getByListingId(req.params.listing_id);
    if (data !== false) {
        return res.send({ error: false, data, message: "Listing buyer offers retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve listing buyer offers" });
}

async function getOffersByBuyer(req, res) {
    const buyerId = req.params.buyer_id || req.user.user_id;
    const data = await buyerOffersModel.getByBuyerId(buyerId);
    if (data !== false) {
        return res.send({ error: false, data, message: "Buyer offers retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve buyer offers" });
}

async function createOffer(req, res) {
    const buyer_id = req.user.role === "BUYER" ? req.user.user_id : (req.body.buyer_id || req.user.user_id);
    const { listing_id, offered_price, quantity, message } = req.body;

    if (!listing_id || !offered_price || !quantity) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: listing_id, offered_price, and quantity are required"
        });
    }

    const listing = await listingsModel.getById(listing_id);
    if (!listing) {
        return res.status(404).send({ error: true, message: "Listing not found" });
    }

    if (listing.status !== "AVAILABLE") {
        return res.status(400).send({
            error: true,
            message: `Cannot place offer: Listing status is '${listing.status}'. Only AVAILABLE listings accept offers.`
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const result = await buyerOffersModel.insert({
            listing_id,
            buyer_id,
            offered_price,
            quantity,
            message,
            status: 'PENDING'
        }, connection);

        const offerId = result.insertId;

        // Auto trigger notification for Farmer (listing owner)
        await notificationsModel.insert({
            user_id: listing.farmer_id,
            title: "New Buyer Offer",
            message: `A buyer has placed an offer of ₹${offered_price}/unit for ${quantity} ${listing.unit} on your listing.`
        }, connection);

        await connection.commit();

        return res.status(201).send({
            error: false,
            data: { offer_id: offerId, listing_id, buyer_id, offered_price, quantity, status: 'PENDING' },
            message: "Buyer offer submitted successfully and farmer notified"
        });
    } catch (err) {
        await connection.rollback();
        console.error("Offer creation transaction error:", err);
        return res.status(500).send({ error: true, message: "Failed to submit buyer offer" });
    } finally {
        connection.release();
    }
}

async function updateOfferStatus(req, res) {
    const { status } = req.body;
    const offerId = req.params.id;

    if (!status || !['ACCEPTED', 'REJECTED', 'PENDING'].includes(status.toUpperCase())) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: status must be ACCEPTED, REJECTED, or PENDING"
        });
    }

    const offer = await buyerOffersModel.getById(offerId);
    if (!offer) {
        return res.status(404).send({ error: true, message: "Offer not found" });
    }

    if (req.user.role === "FARMER" && offer.farmer_id !== req.user.user_id) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only respond to offers on your own listings" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await buyerOffersModel.updateStatus(offerId, status.toUpperCase(), connection);

        let createdOrder = null;

        if (status.toUpperCase() === 'ACCEPTED') {
            const total_amount = Number(offer.offered_price) * Number(offer.quantity);

            // Auto create order
            const orderResult = await ordersModel.insert({
                listing_id: offer.listing_id,
                buyer_id: offer.buyer_id,
                quantity: offer.quantity,
                price_per_unit: offer.offered_price,
                total_amount,
                status: 'CONFIRMED'
            }, connection);

            createdOrder = {
                order_id: orderResult.insertId,
                listing_id: offer.listing_id,
                buyer_id: offer.buyer_id,
                quantity: offer.quantity,
                price_per_unit: offer.offered_price,
                total_amount,
                status: 'CONFIRMED'
            };

            // Auto update listing status to SOLD
            await listingsModel.updateStatus(offer.listing_id, 'SOLD', connection);

            // Notify buyer
            await notificationsModel.insert({
                user_id: offer.buyer_id,
                title: "Offer Accepted!",
                message: `Your offer of ₹${offer.offered_price}/unit on listing #${offer.listing_id} was ACCEPTED. Order #${createdOrder.order_id} has been created.`
            }, connection);
        } else if (status.toUpperCase() === 'REJECTED') {
            // Notify buyer
            await notificationsModel.insert({
                user_id: offer.buyer_id,
                title: "Offer Rejected",
                message: `Your offer of ₹${offer.offered_price}/unit on listing #${offer.listing_id} was REJECTED.`
            }, connection);
        }

        await connection.commit();

        return res.send({
            error: false,
            data: createdOrder ? { offer_status: 'ACCEPTED', order: createdOrder } : { offer_status: status.toUpperCase() },
            message: status.toUpperCase() === 'ACCEPTED'
                ? "Offer accepted successfully, order auto-created, and listing marked as SOLD"
                : `Offer status updated to ${status.toUpperCase()}`
        });
    } catch (err) {
        await connection.rollback();
        console.error("Offer update transaction error:", err);
        return res.status(500).send({ error: true, message: "Failed to update offer status" });
    } finally {
        connection.release();
    }
}

async function deleteOffer(req, res) {
    const data = await buyerOffersModel.deleteById(req.params.id);
    if (data && data.affectedRows > 0) {
        return res.send({ error: false, message: "Offer deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete offer" });
}

module.exports = { getAllOffers, getOfferById, getOffersByListing, getOffersByBuyer, createOffer, updateOfferStatus, deleteOffer };
