const listingsModel = require("../models/listings.model");
const productsModel = require("../models/products.model");

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

function formatListing(item) {
  if (!item) return null;
  const name = item.product_name || '';
  let pic = item.picture;
  if (!pic) {
    pic = resolveCropPicture(name, item.product_id);
  }

  const stock = Number(item.quantity ?? item.available_stock ?? 0);

  return {
    ...item,
    quantity: stock,
    available_stock: stock,
    picture: pic,
    image_url: pic,
    pickup_location: item.location || item.pickup_location || '',
    product: {
      product_id: item.product_id,
      product_name: item.product_name,
      category: item.category,
      unit: item.unit,
      picture: pic,
      description: item.description
    }
  };
}

async function getAllListings(req, res) {
    const { farmer_id, product_id, status, location, limit, offset } = req.query;
    const data = await listingsModel.getAll({ farmer_id, product_id, status, location, limit, offset });
    if (data !== false) {
        const formatted = Array.isArray(data) ? data.map(formatListing) : [];
        return res.send({ error: false, data: formatted, message: "Listings retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve listings" });
}

async function getMyListings(req, res) {
    const farmerId = req.user?.user_id || req.user?.id;
    if (!farmerId) {
        return res.status(401).send({ error: true, message: "Unauthorized: Missing user payload" });
    }
    const data = await listingsModel.getByFarmerId(farmerId);
    if (data !== false) {
        const formatted = Array.isArray(data) ? data.map(formatListing) : [];
        return res.send({ error: false, data: formatted, message: "My listings retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve my listings" });
}

async function getListingById(req, res) {
    const data = await listingsModel.getById(req.params.id);
    if (data) {
        return res.send({ error: false, data: formatListing(data), message: "Listing retrieved successfully" });
    }
    return res.status(404).send({ error: true, message: "Listing not found" });
}

async function getListingsByFarmer(req, res) {
    const farmerId = req.params.farmer_id || req.user?.user_id || req.user?.id;
    const data = await listingsModel.getByFarmerId(farmerId);
    if (data !== false) {
        const formatted = Array.isArray(data) ? data.map(formatListing) : [];
        return res.send({ error: false, data: formatted, message: "Farmer listings retrieved successfully" });
    }
    return res.status(500).send({ error: true, message: "Failed to retrieve farmer listings" });
}

async function createListing(req, res) {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) {
        return res.status(401).send({ error: true, message: "Unauthorized: Missing authentication token or user identity" });
    }

    const userRole = (req.user?.role || '').toUpperCase();
    const farmer_id = userRole === "FARMER" ? userId : (req.body.farmer_id || userId);
    const { product_id, quantity, price_per_unit, quality_grade, harvest_date, location, status } = req.body;

    const numericProductId = Number(product_id);
    const numericQuantity = Number(quantity);
    const numericPrice = Number(price_per_unit);

    if (isNaN(numericProductId) || numericProductId <= 0) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: product_id is required and must be a valid positive number"
        });
    }

    if (isNaN(numericQuantity) || numericQuantity <= 0) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: quantity is required and must be greater than 0"
        });
    }

    if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).send({
            error: true,
            message: "Validation Error: price_per_unit is required and must be greater than 0"
        });
    }

    if (!location || String(location).trim() === '') {
        return res.status(400).send({
            error: true,
            message: "Validation Error: location is required"
        });
    }

    const product = await productsModel.getById(numericProductId);
    if (!product) {
        return res.status(404).send({
            error: true,
            message: `Product not found (ID #${numericProductId}). Please select a valid product.`
        });
    }

    const result = await listingsModel.insert({
        farmer_id,
        product_id: numericProductId,
        quantity: numericQuantity,
        price_per_unit: numericPrice,
        quality_grade: quality_grade || 'Grade A+',
        harvest_date: harvest_date || new Date().toISOString().split('T')[0],
        location: String(location).trim(),
        status: status || 'AVAILABLE'
    });

    if (result && (result.insertId || result.affectedRows >= 0)) {
        const createdId = result.insertId || result.nextId;
        const fresh = createdId ? await listingsModel.getById(createdId) : null;
        return res.status(201).send({
            error: false,
            data: fresh ? formatListing(fresh) : { listing_id: createdId, farmer_id, product_id: numericProductId, quantity: numericQuantity, price_per_unit: numericPrice, location, status: status || 'AVAILABLE' },
            message: "Listing created successfully"
        });
    }

    return res.status(500).send({ error: true, message: "Failed to create listing" });
}

async function updateListing(req, res) {
    const listing = await listingsModel.getById(req.params.id);
    if (!listing) {
        return res.status(404).send({ error: true, message: "Listing not found" });
    }

    const userId = req.user?.user_id || req.user?.id;
    if (req.user?.role === "FARMER" && Number(listing.farmer_id) !== Number(userId)) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only update your own listings" });
    }

    const isNonEmpty = (val) => val !== undefined && val !== null && String(val).trim() !== '';

    const updatedData = {
        quantity: isNonEmpty(req.body.quantity) ? req.body.quantity : listing.quantity,
        price_per_unit: isNonEmpty(req.body.price_per_unit) ? req.body.price_per_unit : listing.price_per_unit,
        quality_grade: isNonEmpty(req.body.quality_grade) ? req.body.quality_grade : listing.quality_grade,
        harvest_date: isNonEmpty(req.body.harvest_date) ? req.body.harvest_date : listing.harvest_date,
        location: isNonEmpty(req.body.location) ? req.body.location : listing.location,
        status: isNonEmpty(req.body.status) ? req.body.status : listing.status
    };

    const data = await listingsModel.update(req.params.id, updatedData);

    if (data !== false) {
        const fresh = await listingsModel.getById(req.params.id);
        return res.send({ error: false, data: formatListing(fresh), message: "Listing updated successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to update listing" });
}

async function deleteListing(req, res) {
    const listing = await listingsModel.getById(req.params.id);
    if (!listing) {
        return res.status(404).send({ error: true, message: "Listing not found" });
    }

    const userId = req.user?.user_id || req.user?.id;
    if (req.user?.role === "FARMER" && Number(listing.farmer_id) !== Number(userId)) {
        return res.status(403).send({ error: true, message: "Forbidden: You can only delete your own listings" });
    }

    const data = await listingsModel.deleteById(req.params.id);
    if (data !== false) {
        return res.send({ error: false, message: "Listing deleted successfully" });
    }
    return res.status(400).send({ error: true, message: "Failed to delete listing" });
}

module.exports = { formatListing, getAllListings, getMyListings, getListingById, getListingsByFarmer, createListing, updateListing, deleteListing };
