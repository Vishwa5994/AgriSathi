const db = require("../config/db");
const ordersModel = require("../models/orders.model");
const listingsModel = require("../models/listings.model");
const notificationsModel = require("../models/notifications.model");

const CROP_FALLBACKS = {
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?auto=format&fit=crop&w=800&q=80',
  paddy: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  sugarcane: 'https://images.unsplash.com/photo-1599599810694-b5b37304c03d?auto=format&fit=crop&w=800&q=80',
  cotton: 'https://images.unsplash.com/photo-1599599810694-b5b37304c03d?auto=format&fit=crop&w=800&q=80',
  apple: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
  chilli: 'https://images.unsplash.com/photo-1588879460618-924a065a2542?auto=format&fit=crop&w=800&q=80',
  pea: 'https://images.unsplash.com/photo-1592394533824-9440e5d68530?auto=format&fit=crop&w=800&q=80',
  cardamom: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  grape: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80',
  papaya: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80',
  cauliflower: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
  bajra: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  millet: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  dal: 'https://images.unsplash.com/photo-1585994191611-72b6cb08c760?auto=format&fit=crop&w=800&q=80',
  tur: 'https://images.unsplash.com/photo-1585994191611-72b6cb08c760?auto=format&fit=crop&w=800&q=80',
  arhar: 'https://images.unsplash.com/photo-1585994191611-72b6cb08c760?auto=format&fit=crop&w=800&q=80',
  peanut: 'https://images.unsplash.com/photo-1567892336336-397a61d1e4c7?auto=format&fit=crop&w=800&q=80',
  groundnut: 'https://images.unsplash.com/photo-1567892336336-397a61d1e4c7?auto=format&fit=crop&w=800&q=80',
  jowar: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  orange: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
  santra: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
  garlic: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  ginger: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  turmeric: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  mustard: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
};

const DISTINCT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1599599810694-b5b37304c03d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588879460618-924a065a2542?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592394533824-9440e5d68530?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585994191611-72b6cb08c760?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1567892336336-397a61d1e4c7?auto=format&fit=crop&w=800&q=80'
];

function resolveCropPicture(name = '', productId = null) {
  const lowerName = String(name).toLowerCase();
  for (const [k, url] of Object.entries(CROP_FALLBACKS)) {
    if (lowerName.includes(k)) {
      return url;
    }
  }
  let hash = 0;
  const str = String(productId || name || 'crop');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % DISTINCT_FALLBACK_IMAGES.length;
  return DISTINCT_FALLBACK_IMAGES[idx];
}

function formatOrder(item) {
  if (!item) return null;
  const name = item.product_name || '';
  let pic = item.picture;
  if (!pic) {
    pic = resolveCropPicture(name, item.product_id);
  }

  const productData = {
    product_id: item.product_id,
    product_name: item.product_name || 'Agricultural Produce',
    category: item.category || 'Produce',
    unit: item.unit || 'Quintal',
    picture: pic,
    image_url: pic
  };

  return {
    ...item,
    picture: pic,
    image_url: pic,
    product: productData,
    listing: {
      listing_id: item.listing_id,
      farmer_id: item.farmer_id,
      location: item.pickup_location,
      product: productData
    }
  };
}

async function getAllOrders(req, res) {
    const { buyer_id, farmer_id, status, limit, offset } = req.query;
    const data = await ordersModel.getAll({ buyer_id, farmer_id, status, limit, offset });
    if (data !== false) {
        const formatted = Array.isArray(data) ? data.map(formatOrder) : [];
        return res.send({ error: false, data: formatted, message: "Orders retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve orders" });
}

async function getOrderById(req, res) {
    const data = await ordersModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data: formatOrder(data), message: "Order retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Order not found" });
}

async function createOrder(req, res) {
    const buyer_id = req.user?.role === "BUYER" ? req.user.user_id : (req.body.buyer_id || req.user?.user_id);
    const { listing_id, quantity, price_per_unit, status } = req.body;

    if (!listing_id || !quantity || !price_per_unit) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: listing_id, quantity, and price_per_unit are required"
        });
    }

    const orderQty = Number(quantity);
    if (isNaN(orderQty) || orderQty <= 0) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: Order quantity must be greater than 0"
        });
    }

    const listing = await listingsModel.getById(listing_id);
    if (!listing) {
        return res.status(404).send({ error: true, message: "Listing not found" });
    }

    const currentStock = Number(listing.quantity ?? listing.available_stock ?? 0);

    if (listing.status !== "AVAILABLE" || currentStock <= 0) {
        return res.status(400).send({
            error: true,
            message: `Cannot place order: Listing is unavailable or out of stock (current stock: ${currentStock}).`
        });
    }

    if (orderQty > currentStock) {
        return res.status(400).send({
            error: true,
            message: `Insufficient stock: Requested quantity (${orderQty}) exceeds available stock (${currentStock} ${listing.unit || 'units'}).`
        });
    }

    const unitPrice = Number(price_per_unit);
    const total_amount = orderQty * unitPrice;
    const orderStatus = status || 'PENDING';

    const newStock = currentStock - orderQty;
    const newListingStatus = newStock <= 0 ? 'SOLD' : 'AVAILABLE';

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const orderResult = await ordersModel.insert({
            listing_id,
            buyer_id,
            quantity: orderQty,
            price_per_unit: unitPrice,
            total_amount,
            status: orderStatus
        }, connection);

        const orderId = orderResult.insertId;

        // Decrement stock & update listing status atomically
        await listingsModel.updateQuantityAndStatus(listing_id, newStock, newListingStatus, connection);

        // Trigger notification to Farmer
        await notificationsModel.insert({
            user_id: listing.farmer_id,
            title: "New Order Received",
            message: `A new order (#${orderId}) of ${orderQty} ${listing.unit || 'units'} for ₹${total_amount} has been placed.`
        }, connection);

        await connection.commit();

        return res.status(201).send({
            error: false,
            data: {
                order_id: orderId,
                listing_id,
                buyer_id,
                quantity: orderQty,
                price_per_unit: unitPrice,
                total_amount,
                status: orderStatus,
                remaining_stock: newStock,
                listing_status: newListingStatus
            },
            message: "Order placed successfully, stock updated, and farmer notified"
        });
    } catch (err) {
        await connection.rollback();
        console.error("Order creation transaction error:", err);
        return res.status(500).send({ error: true, message: `Failed to place order: ${err.message}` });
    } finally {
        connection.release();
    }
}

async function updateOrderStatus(req, res) {
    const { status, reason } = req.body;
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

        // Restore stock when order is cancelled
        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
            const listing = await listingsModel.getById(order.listing_id);
            if (listing) {
                const currentStock = Number(listing.quantity ?? listing.available_stock ?? 0);
                const restoredStock = currentStock + Number(order.quantity || 0);
                await listingsModel.updateQuantityAndStatus(order.listing_id, restoredStock, 'AVAILABLE', connection);
            }
            await notificationsModel.insert({
                user_id: order.buyer_id,
                title: "Order Cancelled",
                message: `Order #${orderId} has been cancelled. ${reason ? 'Reason: ' + reason : ''}`
            }, connection);
        } else if (status === 'CONFIRMED' && order.status !== 'CONFIRMED') {
            await notificationsModel.insert({
                user_id: order.farmer_id,
                title: "Order Confirmed",
                message: `Order #${orderId} has been confirmed.`
            }, connection);
        }

        await ordersModel.updateStatus(orderId, status, connection);

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
