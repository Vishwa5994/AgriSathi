const db = require("../config/db");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const PREDICTION_SERVICE_URL = process.env.PREDICTION_SERVICE_URL || "http://localhost:8000";

const KNOWN_COMMODITIES = [
  "Wheat", "Maize", "Rice", "Mustard", "Soyabean", "Soybean", "Gram", 
  "Barley", "Barley (Jau)", "Coconut", "Coffee", "Cotton", "Ginger(Dry)", 
  "Groundnut", "Jowar(Sorghum)", "Jowar", "Sugar", "Sugarcane", "Sunflower", 
  "Tea", "Turmeric", "Onion", "Tomato", "Potato", "Arhar", "Pea", "Millets"
];

const KNOWN_REGIONS = [
  "Balod Division", "Bastar Division", "Bilaspur Division", "Durg Division", "Raipur Division"
];

/**
 * Step 1: Detect Intent & Extract Keywords
 */
function detectIntent(message) {
  const text = message.toLowerCase().trim();

  // 1. My Orders
  if (/\b(my\s+orders?|orders?\s+i\s+placed|my\s+purchases?|show\s+me\s+my\s+orders?|recent\s+orders?|what\s+did\s+i\s+buy)\b/i.test(text)) {
    return { type: "MY_ORDERS" };
  }

  // 2. My Listings / My Products
  if (/\b(my\s+listings?|my\s+products?|my\s+produce|my\s+crops?|what\s+am\s+i\s+selling|what\s+did\s+i\s+list)\b/i.test(text)) {
    return { type: "MY_LISTINGS" };
  }

  // 3. Demand Prediction
  // 3. Demand Prediction
  if (/\b(demand\s+for|demand\s+of|market\s+demand|projected\s+demand|future\s+demand)\b/i.test(text)) {
    let matchedCrop = null;
    for (const crop of KNOWN_COMMODITIES) {
      const cleanCrop = crop.toLowerCase().replace(/[\(\)]/g, "\\$&");
      const regex = new RegExp(`\\b${cleanCrop}\\b`, "i");
      if (regex.test(text)) {
        matchedCrop = crop;
        break;
      }
    }
    let matchedRegion = "Balod Division"; // Default region
    for (const reg of KNOWN_REGIONS) {
      const cleanReg = reg.toLowerCase().replace(" division", "");
      if (text.includes(cleanReg)) {
        matchedRegion = reg;
        break;
      }
    }
    return { type: "DEMAND_PREDICTION", crop: matchedCrop || "Wheat", region: matchedRegion };
  }

  // 4. Price Prediction / Trend
  const isPriceQuery = /\b(price|rate|cost|bhav|daam|trend|forecast|worth|predict)\b/i.test(text);
  let matchedCommodity = null;

  for (const comm of KNOWN_COMMODITIES) {
    const cleanComm = comm.toLowerCase().replace(/[\(\)]/g, "\\$&");
    const regex = new RegExp(`\\b${cleanComm}\\b`, "i");
    if (regex.test(text)) {
      matchedCommodity = comm;
      break;
    }
  }

  // Check if an explicit commodity was asked for e.g. "price of dragonfruit", "avocado trend"
  const commodityMatch = text.match(/(?:price|trend|forecast|rate|cost|bhav|daam)\s+(?:of|for)?\s*([a-zA-Z\s]+)/i);
  let customCandidate = null;
  if (commodityMatch && commodityMatch[1]) {
    const raw = commodityMatch[1]
      .replace(/\b(today|tomorrow|next month|in india|in mandi|trend|forecast|please|now|right now|currently|is|are|the|a|an)\b/gi, "")
      .trim();
    if (raw.length > 1) {
      customCandidate = raw.charAt(0).toUpperCase() + raw.slice(1);
    }
  }

  if (matchedCommodity || (isPriceQuery && customCandidate)) {
    return {
      type: "PRICE_PREDICTION",
      commodity: matchedCommodity || customCandidate || "Wheat"
    };
  }

  if (isPriceQuery) {
    return {
      type: "PRICE_PREDICTION",
      commodity: "Wheat"
    };
  }

  // 5. Available Marketplace Listings
  if (/\b(available\s+products?|available\s+crops?|show\s+me\s+listings?|what\s+can\s+i\s+buy|marketplace|browse\s+produce|what\s+is\s+for\s+sale)\b/i.test(text)) {
    return { type: "MARKETPLACE_LISTINGS" };
  }

  // 6. General
  return { type: "GENERAL_INQUIRY" };
}

/**
 * Step 2: Fetch Real Grounding Data Based on Intent
 */
async function fetchGroundingData(intent, user) {
  switch (intent.type) {
    case "PRICE_PREDICTION": {
      const commodity = intent.commodity;
      try {
        const resp = await axios.get(`${PREDICTION_SERVICE_URL}/predict/price`, {
          params: { commodity_name: commodity, months_ahead: 3 },
          timeout: 4000
        });

        const data = resp.data;
        // Also fetch any live farmer listings for this produce in DB
        let liveListings = [];
        try {
          const [rows] = await db.query(
            `SELECT l.listing_id, p.product_name, l.quantity, p.unit, l.price_per_unit, l.quality_grade, l.location 
             FROM listings l 
             JOIN products p ON l.product_id = p.product_id 
             WHERE p.product_name LIKE ? AND l.status = 'AVAILABLE' 
             LIMIT 3`,
            [`%${commodity}%`]
          );
          liveListings = rows;
        } catch (dbErr) {
          console.warn("Could not fetch live listings for price context:", dbErr.message);
        }

        return {
          query_type: "commodity_price_forecast",
          commodity: data.commodity_name,
          current_modal_price_inr: data.current_price,
          unit: "₹ per Quintal (100 Kg)",
          predicted_next_month_price_inr: data.predicted_price,
          forecast_3_months: data.forecast,
          recent_historical_trend: (data.historical || []).slice(-3),
          active_marketplace_listings: liveListings
        };
      } catch (err) {
        if (err.response && err.response.status === 404) {
          return {
            query_type: "commodity_price_forecast",
            commodity: commodity,
            status: "NO_DATA_AVAILABLE",
            message: `No historical price data or ML prediction model available for '${commodity}'. Available commodities with models: ${KNOWN_COMMODITIES.slice(0, 10).join(", ")}.`
          };
        }
        return {
          query_type: "commodity_price_forecast",
          commodity: commodity,
          status: "SERVICE_UNAVAILABLE",
          message: "Price prediction service is temporarily unavailable."
        };
      }
    }

    case "DEMAND_PREDICTION": {
      const { crop, region } = intent;
      try {
        const resp = await axios.get(`${PREDICTION_SERVICE_URL}/predict/demand`, {
          params: { crop, region, months_ahead: 3 },
          timeout: 4000
        });

        const data = resp.data;
        return {
          query_type: "crop_demand_forecast",
          crop: data.crop,
          region: data.region,
          current_market_demand_mt: data.current_demand,
          predicted_next_month_demand_mt: data.predicted_demand,
          forecast_3_months: data.forecast,
          recent_historical_demand: (data.historical || []).slice(-3)
        };
      } catch (err) {
        return {
          query_type: "crop_demand_forecast",
          crop: crop,
          region: region,
          status: "NO_DATA_AVAILABLE",
          message: `Demand data is unavailable for crop '${crop}' in '${region}'.`
        };
      }
    }

    case "MY_ORDERS": {
      if (!user || (!user.user_id && !user.id)) {
        return {
          query_type: "user_personal_orders",
          authenticated: false,
          message: "User is not logged in. You must be signed in with your farmer or buyer account to view your personal orders."
        };
      }

      const userId = user.user_id || user.id;
      try {
        const [orders] = await db.query(
          `SELECT o.order_id, o.quantity, o.price_per_unit, o.total_amount, o.status, o.order_date,
                  p.product_name, p.unit, u_buyer.name as buyer_name, u_farmer.name as farmer_name
           FROM orders o
           JOIN listings l ON o.listing_id = l.listing_id
           JOIN products p ON l.product_id = p.product_id
           JOIN users u_buyer ON o.buyer_id = u_buyer.user_id
           JOIN users u_farmer ON l.farmer_id = u_farmer.user_id
           WHERE (o.buyer_id = ? OR l.farmer_id = ?)
           ORDER BY o.order_id DESC
           LIMIT 5`,
          [userId, userId]
        );

        return {
          query_type: "user_personal_orders",
          authenticated: true,
          user_id: userId,
          user_name: user.name || "Valued User",
          role: user.role,
          total_retrieved_orders: orders.length,
          orders: orders.map(o => ({
            order_id: o.order_id,
            product: o.product_name,
            quantity: `${o.quantity} ${o.unit || 'Kg'}`,
            price_per_unit: `₹${o.price_per_unit}`,
            total_amount: `₹${o.total_amount}`,
            status: o.status,
            order_date: o.order_date,
            counterparty: user.role === 'FARMER' ? `Buyer: ${o.buyer_name}` : `Farmer: ${o.farmer_name}`
          }))
        };
      } catch (dbErr) {
        console.error("Error fetching user orders for chatbot:", dbErr);
        return { query_type: "user_personal_orders", status: "ERROR", message: "Failed to retrieve orders from database." };
      }
    }

    case "MY_LISTINGS": {
      if (!user || (!user.user_id && !user.id)) {
        return {
          query_type: "user_personal_listings",
          authenticated: false,
          message: "User is not logged in. You must be signed in as a farmer to view your listed products."
        };
      }

      const userId = user.user_id || user.id;
      try {
        const [listings] = await db.query(
          `SELECT l.listing_id, p.product_name, p.category, l.quantity, p.unit,
                  l.price_per_unit, l.quality_grade, l.location, l.status, l.created_at
           FROM listings l
           JOIN products p ON l.product_id = p.product_id
           WHERE l.farmer_id = ?
           ORDER BY l.listing_id DESC
           LIMIT 5`,
          [userId]
        );

        return {
          query_type: "user_personal_listings",
          authenticated: true,
          farmer_id: userId,
          farmer_name: user.name || "Farmer",
          total_listings: listings.length,
          listings: listings.map(l => ({
            listing_id: l.listing_id,
            product_name: l.product_name,
            category: l.category,
            available_stock: `${l.quantity} ${l.unit || 'Kg'}`,
            price_per_unit: `₹${l.price_per_unit}/${l.unit || 'Kg'}`,
            quality_grade: l.quality_grade,
            location: l.location,
            status: l.status
          }))
        };
      } catch (dbErr) {
        console.error("Error fetching user listings for chatbot:", dbErr);
        return { query_type: "user_personal_listings", status: "ERROR", message: "Failed to retrieve listings from database." };
      }
    }

    case "MARKETPLACE_LISTINGS": {
      try {
        const [rows] = await db.query(
          `SELECT l.listing_id, p.product_name, p.category, l.quantity, p.unit,
                  l.price_per_unit, l.quality_grade, l.location, u.name as farmer_name
           FROM listings l
           JOIN products p ON l.product_id = p.product_id
           JOIN users u ON l.farmer_id = u.user_id
           WHERE l.status = 'AVAILABLE'
           ORDER BY l.listing_id DESC
           LIMIT 5`
        );
        return {
          query_type: "marketplace_available_listings",
          count: rows.length,
          available_listings: rows.map(r => ({
            listing_id: r.listing_id,
            product: r.product_name,
            category: r.category,
            stock: `${r.quantity} ${r.unit || 'Kg'}`,
            direct_price: `₹${r.price_per_unit}/${r.unit || 'Kg'}`,
            grade: r.quality_grade,
            farm_location: r.location,
            farmer: r.farmer_name
          }))
        };
      } catch (err) {
        return { query_type: "marketplace_available_listings", status: "ERROR", message: "Failed to retrieve marketplace produce." };
      }
    }

    default:
      return null;
  }
}

/**
 * Step 3: Grounded Fallback Response Generator (Strict RAG)
 */
function generateGroundedResponse(message, fetchedData, user) {
  if (!fetchedData) {
    return `🌾 **Namaste!** Welcome to **AgriSaathi AI Assistant**.

I am your direct agricultural advisor for the AgriSaathi platform.

**Here is what you can ask me:**
• 💰 **Price Forecasts:** *"What's the current price trend for Wheat?"* or *"Forecast for Maize"*
• 📊 **Market Demand:** *"What is the demand for Rice in Balod Division?"*
• 📦 **My Orders:** *"Show me my recent orders"*
• 🌾 **My Products:** *"Show me my listings"*
• 🛒 **Marketplace:** *"What produce is currently available for sale?"*
• ℹ️ **Platform Guide:** *"How do I list a product as a farmer?"*

How may I assist you with your agricultural trading today?`;
  }

  switch (fetchedData.query_type) {
    case "commodity_price_forecast": {
      if (fetchedData.status === "NO_DATA_AVAILABLE") {
        return `⚠️ **Price Information Unavailable**\n\nI apologize, but I do not have historical price records or a trained machine learning prediction model for **${fetchedData.commodity}** in the AgriSaathi database.\n\n💡 *Available commodities with live ML price models:* Wheat, Maize, Rice, Mustard, Soyabean, Gram, Cotton, Sugarcane, Tea, Coffee, Turmeric, Groundnut, Barley, and Onion.`;
      }

      const curr = fetchedData.current_modal_price_inr ? `₹${Number(fetchedData.current_modal_price_inr).toFixed(2)}` : "N/A";
      const pred = fetchedData.predicted_next_month_price_inr ? `₹${Number(fetchedData.predicted_next_month_price_inr).toFixed(2)}` : "N/A";
      const forecastLines = (fetchedData.forecast_3_months || []).map(f => `  • **${f.month}**: ₹${Number(f.predicted_price).toFixed(2)} / Qtl`).join("\n");
      const histLines = (fetchedData.recent_historical_trend || []).map(h => `  • **${h.month}**: ₹${Number(h.avg_modal_price).toFixed(2)} (Min: ₹${Number(h.avg_min_price).toFixed(2)}, Max: ₹${Number(h.avg_max_price).toFixed(2)})`).join("\n");

      return `📊 **${fetchedData.commodity} — ML Price Trend & Forecast (XGBoost Engine)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 **Current Market Price (Latest Actual):** ${curr} / Quintal
📈 **Projected Next-Month Price:** ${pred} / Quintal

🔮 **Recursive Multi-Month Forecast:**
${forecastLines || "  • Data in calculation"}

🗓️ **Recent Historical Mandi Trends:**
${histLines || "  • Recent actuals recorded"}

💡 *Model Note:* Grounded in AgriSaathi's historical dataset using 1-3 month lag values and 3-month rolling averages.`;
    }

    case "crop_demand_forecast": {
      if (fetchedData.status === "NO_DATA_AVAILABLE") {
        return `⚠️ **Demand Forecast Unavailable**\n\nI do not have market demand records for **${fetchedData.crop}** in **${fetchedData.region}**.`;
      }
      const forecastLines = (fetchedData.forecast_3_months || []).map(f => `  • **${f.month}**: ${Number(f.predicted_demand).toFixed(1)} Metric Tonnes`).join("\n");

      return `📈 **${fetchedData.crop} — Market Demand Intelligence (${fetchedData.region})**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 **Current Regional Demand:** ${Number(fetchedData.current_market_demand_mt).toFixed(1)} MT
🎯 **Projected Next-Month Demand:** ${Number(fetchedData.predicted_next_month_demand_mt).toFixed(1)} MT

🔮 **Quarterly Projected Demand:**
${forecastLines}

💡 *Insights:* High wholesale demand forecast indicates favorable direct farmgate sales in ${fetchedData.region}.`;
    }

    case "user_personal_orders": {
      if (!fetchedData.authenticated) {
        return `🔒 **Authentication Required**\n\nYou must be logged in to view your personal order history. Please sign in to your AgriSaathi account.`;
      }
      if (fetchedData.orders.length === 0) {
        return `📦 **Your Orders (${fetchedData.user_name})**\n\nYou do not have any active or past orders recorded in the system yet.`;
      }
      const ordersList = fetchedData.orders.map(o => `• **Order #${o.order_id}** — ${o.product} (${o.quantity})\n  💵 Price: ${o.price_per_unit} | Total: **${o.total_amount}** | Status: **${o.status}**\n  👤 ${o.counterparty}`).join("\n\n");

      return `📦 **Your Recent Orders (${fetchedData.user_name} • ${fetchedData.role || 'Member'})**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${ordersList}

💡 *Tip:* View and manage complete fulfillment in your **Orders Dashboard**.`;
    }

    case "user_personal_listings": {
      if (!fetchedData.authenticated) {
        return `🔒 **Authentication Required**\n\nYou must be signed in as a farmer to view your listings. Please log in to continue.`;
      }
      if (fetchedData.listings.length === 0) {
        return `🌾 **Your Produce Listings (${fetchedData.farmer_name})**\n\nYou have not listed any crops yet. Click **Add Product** to create your first listing!`;
      }
      const listingsText = fetchedData.listings.map(l => `• **Listing #${l.listing_id}** — ${l.product_name} (${l.quality_grade})\n  📦 Stock: ${l.available_stock} | Rate: **${l.price_per_unit}** | Status: **${l.status}**\n  📍 Location: ${l.location}`).join("\n\n");

      return `🌾 **Your Active Produce Listings (${fetchedData.farmer_name})**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${listingsText}`;
    }

    case "marketplace_available_listings": {
      if (!fetchedData.available_listings || fetchedData.available_listings.length === 0) {
        return `🛒 **Marketplace Listings**\n\nThere are currently no active listings available. Check back soon!`;
      }
      const listText = fetchedData.available_listings.map(l => `• **#${l.listing_id} ${l.product}** (${l.grade})\n  📦 Stock: ${l.stock} | Direct Rate: **${l.direct_price}**\n  🧑‍🌾 Farmer: ${l.farmer} (${l.farm_location})`).join("\n\n");

      return `🛒 **Live Verified Farmer Listings on AgriSaathi**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${listText}

🤝 *100% direct trade with verified local farmers. No middlemen.*`;
    }

    default:
      return `🌾 Thank you for your inquiry on AgriSaathi. How else may I assist your agricultural trade today?`;
  }
}

/**
 * Controller: Handle RAG Chat Request
 * POST /api/chat
 */
async function handleChatMessage(req, res) {
  try {
    const { message, messages = [] } = req.body;
    const userMessage = message || (messages.length > 0 ? messages[messages.length - 1].content : "");

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).send({
        error: true,
        message: "Message content is required"
      });
    }

    const authenticatedUser = req.user || null;

    // 1. Detect Intent
    const intent = detectIntent(userMessage);

    // 2. Retrieve real platform data based on intent
    const fetchedData = await fetchGroundingData(intent, authenticatedUser);

    // 3. Check for Google Gemini API Key
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let botReply = "";

    if (geminiApiKey && geminiApiKey !== "YOUR_GEMINI_API_KEY") {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: `You are AgriSathi AI Assistant, an agricultural marketplace and price discovery expert for Indian farmers and buyers.
When real platform data is provided in the message context, base your answer strictly and accurately on that data. Do not invent or estimate numbers when real numbers are given.
If the data indicates 'NO_DATA_AVAILABLE' or status is not found, state honestly that the platform has no recorded data or trained prediction model for that commodity rather than guessing.
If the user asks for personal orders or personal listings but is unauthenticated, politely ask them to sign in.
Keep replies clear, respectful, structured, and helpful with emojis.`
        });

        const contextBlock = fetchedData
          ? `\n\n[Real platform data for reference — use this to answer accurately, don't make up numbers]:\n${JSON.stringify(fetchedData, null, 2)}`
          : "";

        const augmentedMessage = `${userMessage}${contextBlock}`;

        const chat = model.startChat({
          history: (messages || []).slice(0, -1).map(m => ({
            role: m.role === "assistant" || m.role === "bot" ? "model" : "user",
            parts: [{ text: m.content || m.text || "" }]
          }))
        });

        const result = await chat.sendMessage(augmentedMessage);
        botReply = result.response.text();
      } catch (geminiErr) {
        console.warn("Gemini API call failed, using deterministic RAG response:", geminiErr.message);
        botReply = generateGroundedResponse(userMessage, fetchedData, authenticatedUser);
      }
    } else {
      // Deterministic Grounded RAG Generator
      botReply = generateGroundedResponse(userMessage, fetchedData, authenticatedUser);
    }

    return res.send({
      error: false,
      reply: botReply,
      intent: intent.type,
      grounding_context: fetchedData,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Chat controller error:", err);
    return res.status(500).send({
      error: true,
      message: "An internal error occurred while processing your message."
    });
  }
}

module.exports = {
  handleChatMessage,
  detectIntent,
  fetchGroundingData,
  generateGroundedResponse
};
