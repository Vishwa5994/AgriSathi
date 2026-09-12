import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { productsApi } from '../api/productsApi';
import { priceHistoryApi } from '../api/priceHistoryApi';
import { listingsApi } from '../api/listingsApi';
import { askOpenRouter } from '../api/openRouterApi';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sprout,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Loader2,
  Sparkles,
  MapPin,
  IndianRupee,
  BarChart3
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
//  City → Mandi price multipliers (simulates regional variation)
// ─────────────────────────────────────────────────────────
const CITY_MULTIPLIERS = {
  mumbai: 1.08, delhi: 1.05, bangalore: 1.06, chennai: 1.04,
  hyderabad: 1.03, kolkata: 1.02, pune: 1.04, ahmedabad: 1.01,
  nashik: 1.00, karnal: 0.98, sehore: 0.96, indore: 0.99,
  jaipur: 1.02, lucknow: 1.03, chandigarh: 1.01, nagpur: 1.00,
  surat: 1.03, vadodara: 1.02, bhopal: 0.98, kochi: 1.05,
  default: 1.00
};

const getCityMultiplier = (city) => {
  if (!city) return CITY_MULTIPLIERS.default;
  const key = city.toLowerCase().trim();
  return CITY_MULTIPLIERS[key] ?? CITY_MULTIPLIERS.default;
};

// ─────────────────────────────────────────────────────────
//  Smart AI Brain — rule-based intent + response generator
// ─────────────────────────────────────────────────────────
const buildKnowledgeBase = (liveProducts = [], livePriceHistory = [], liveListings = []) => {
  return { products: liveProducts, priceHistory: livePriceHistory, listings: liveListings };
};

const detectIntent = (text) => {
  const lower = text.toLowerCase();
  if (/\b(hello|hi|hey|namaste|namaskar|jai|kaise|good morning|good evening)\b/.test(lower)) return 'greet';
  if (/\b(help|what can you|kya kar sakte|features|guide|tour)\b/.test(lower)) return 'help';
  if (/\b(price|bhav|daam|rate|cost|kitna|how much|today|aaj|live|mandi|apmc)\b/.test(lower)) return 'price';
  if (/\b(city|location|kahan|where|district|state|nashik|karnal|mumbai|delhi|pune|sehore|indore|bangalore|hyderabad|kolkata|jaipur|lucknow|surat|nagpur|kochi)\b/.test(lower)) return 'city_price';
  if (/\b(sell|listing|list|add product|how to sell|farmer|kisaan)\b/.test(lower)) return 'farmer_guide';
  if (/\b(buy|order|purchase|khareed|how to buy|buyer)\b/.test(lower)) return 'buyer_guide';
  if (/\b(upi|payment|pay|paisa|transfer|qr|scan)\b/.test(lower)) return 'payment';
  if (/\b(best|top|cheap|sasta|highest|lowest|compare)\b/.test(lower)) return 'compare';
  if (/\b(wheat|gehu|गेहू|शर्बती|sharbati)\b/.test(lower)) return 'product_wheat';
  if (/\b(rice|chawal|basmati|चावल|धान)\b/.test(lower)) return 'product_rice';
  if (/\b(onion|pyaz|प्याज|pyaaz|nashik)\b/.test(lower)) return 'product_onion';
  if (/\b(tomato|tamatar|टमाटर)\b/.test(lower)) return 'product_tomato';
  if (/\b(potato|aloo|आलू)\b/.test(lower)) return 'product_potato';
  if (/\b(turmeric|haldi|हल्दी)\b/.test(lower)) return 'product_turmeric';
  if (/\b(chilli|mirch|मिर्च|chili|red pepper)\b/.test(lower)) return 'product_chilli';
  if (/\b(soybean|soy|सोयाबीन)\b/.test(lower)) return 'product_soybean';
  if (/\b(trend|going up|going down|badhna|ghatna|market)\b/.test(lower)) return 'trend';
  if (/\b(thank|thanks|shukriya|dhanyavad|ok|great|awesome)\b/.test(lower)) return 'thanks';
  return 'unknown';
};

const extractCity = (text) => {
  const cities = Object.keys(CITY_MULTIPLIERS).filter(c => c !== 'default');
  const lower = text.toLowerCase();
  return cities.find(city => lower.includes(city)) || null;
};

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const generateResponse = (userText, role, user) => {
  const { products, priceHistory, listings } = buildKnowledgeBase();
  const intent = detectIntent(userText);
  const city = extractCity(userText);
  const cityMult = getCityMultiplier(city);
  const farmerName = user?.name ? user.name.split(' ')[0] : (role === 'FARMER' ? 'Kisaan' : 'Ji');
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const priceCard = (product) => {
    const hist = priceHistory[product.product_id];
    const base = hist?.current_mandi_avg ?? product.mandi_avg_price;
    const cityPrice = Math.round(base * cityMult);
    const cityLabel = city ? ` in ${city.charAt(0).toUpperCase() + city.slice(1)}` : '';
    const trend = hist && hist.history.length >= 2
      ? hist.history[hist.history.length - 1].mandi_avg - hist.history[hist.history.length - 2].mandi_avg
      : 0;
    const trendText = trend > 0 ? `📈 Up ${formatPrice(trend)}/Kg this week` : trend < 0 ? `📉 Down ${formatPrice(Math.abs(trend))}/Kg this week` : '➡️ Stable this week';
    const directListing = listings.find(l => l.product_id === product.product_id);
    const directPrice = directListing ? `\n🤝 Direct Farmer Price: **${formatPrice(directListing.price_per_unit)}/Kg** (${Math.round(((base - directListing.price_per_unit) / base) * 100)}% below Mandi!)` : '';

    return `📦 **${product.product_name}** — Today (${today})${cityLabel}
━━━━━━━━━━━━━━━━━━━━
🏪 **Mandi Avg${cityLabel}:** ${formatPrice(cityPrice)}/Kg
📉 Min Price: ${formatPrice(Math.round(product.mandi_min_price * cityMult))}/Kg
📈 Max Price: ${formatPrice(Math.round(product.mandi_max_price * cityMult))}/Kg
${trendText}${directPrice}
📍 Source: APMC ${hist?.mandi_name ?? 'India Agmarknet'}`;
  };

  switch (intent) {
    case 'greet':
      return `🌾 **Namaste ${farmerName}!** Welcome to **AgriSaathi AI Assistant** 🙏

I'm your live Mandi price guide and agricultural trade helper. ${role === 'FARMER' ? "As a **Farmer**, I can help you get the best price for your produce and list it directly to buyers." : "As a **Buyer**, I can help you find the freshest produce at the best rates directly from farmers."}

**You can ask me:**
• 💰 *"What is today's onion price in Mumbai?"*
• 📊 *"Wheat mandi rate in Delhi"*
• 🌾 *"How do I list my tomatoes?"*
• 📦 *"How do I buy basmati rice?"*
• 📈 *"Which crop prices are rising?"*

What would you like to know today?`;

    case 'help':
      return `🤖 **AgriSaathi AI — Full Guide**

**For ${role === 'FARMER' ? 'Farmers 🌾' : 'Buyers 🛒'}:**
${role === 'FARMER' ? `• **List Produce** → Go to "My Products" → Add listing with price, grade, stock
• **Check Mandi Rate** → Ask me: *"wheat price today"*
• **Accept Orders** → Buyer pays via UPI → You verify in bank app → Mark Confirmed
• **Get Best Price** → I'll compare your asking price with Mandi benchmark` : `• **Browse Marketplace** → Explore all verified farmer listings
• **Buy Direct** → Pay farmer via UPI QR — zero middleman
• **Track Orders** → "My Orders" page shows payment & pickup status
• **Price Check** → Ask me: *"onion price in Pune today"*`}

**Price Questions:**
• "Today's tomato price"
• "Basmati rate in Karnal"
• "Is wheat price going up?"

Ask anything! I'm here 24/7 🌙`;

    case 'price': {
      const allPrices = products.map(p => {
        const h = priceHistory[p.product_id];
        const base = h?.current_mandi_avg ?? p.mandi_avg_price;
        return `• **${p.product_name}**: ${formatPrice(Math.round(base * cityMult))}/Kg`;
      }).join('\n');
      return `📊 **Live Mandi Prices — ${today}**${city ? ` (${city.charAt(0).toUpperCase() + city.slice(1)})` : ''}
━━━━━━━━━━━━━━━━━━━━
${allPrices}

💡 Ask me about a **specific crop** for detailed min/max/trend info!
Example: *"Onion price in Delhi"*`;
    }

    case 'city_price': {
      const allPrices = products.map(p => {
        const h = priceHistory[p.product_id];
        const base = h?.current_mandi_avg ?? p.mandi_avg_price;
        return `• ${p.product_name}: **${formatPrice(Math.round(base * cityMult))}**/Kg`;
      }).join('\n');
      const cityDisplay = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'your city';
      return `📍 **Today's Mandi Prices — ${cityDisplay}**
━━━━━━━━━━━━━━━━━━━━
${allPrices}

${city ? `💡 These are APMC-benchmark rates for **${cityDisplay}** today (${today}).` : '💡 Tell me your city for localised rates! E.g.: *"onion price in Nashik"*'}`;
    }

    case 'product_wheat': return priceCard(products.find(p => p.product_id === 'prod-1'));
    case 'product_rice': return priceCard(products.find(p => p.product_id === 'prod-2'));
    case 'product_tomato': return priceCard(products.find(p => p.product_id === 'prod-3'));
    case 'product_onion': return priceCard(products.find(p => p.product_id === 'prod-4'));
    case 'product_potato': return priceCard(products.find(p => p.product_id === 'prod-5') ?? products[4]);
    case 'product_soybean': return priceCard(products.find(p => p.product_id === 'prod-6'));
    case 'product_turmeric': return priceCard(products.find(p => p.product_id === 'prod-7'));
    case 'product_chilli': return priceCard(products.find(p => p.product_id === 'prod-8'));

    case 'farmer_guide':
      return `🌾 **How to Sell on AgriSaathi (Farmer Guide)**
━━━━━━━━━━━━━━━━━━━━
**Step 1:** Go to **"My Products"** → **"+ Add Listing"**
**Step 2:** Select your crop, enter **quantity & quality grade**
**Step 3:** Set your **asking price** (I'll show you the Mandi benchmark!)
**Step 4:** Add your **UPI ID** for direct payment
**Step 5:** Buyers browse & place orders → You get **UPI payment directly**
**Step 6:** Verify payment in your bank app → Click **"Confirm Receipt"**

✅ **Zero middleman. 100% direct payment. No commission.**

💡 *Want me to check the current Mandi rate for your crop before you price it?*`;

    case 'buyer_guide':
      return `🛒 **How to Buy on AgriSaathi (Buyer Guide)**
━━━━━━━━━━━━━━━━━━━━
**Step 1:** Go to **Marketplace** → Browse verified farmer listings
**Step 2:** Filter by **crop, grade, location** to find the best deal
**Step 3:** Compare the asking price with **Mandi benchmark** (shown on each card!)
**Step 4:** Click **"Buy Now"** → Enter your quantity
**Step 5:** **Scan UPI QR** / enter farmer's UPI ID → Pay directly
**Step 6:** Farmer confirms receipt → **Pickup details sent to you**

✅ **Direct from farmgate. Fresh. Transparent. No inflated middleman prices.**

💡 *Ask me the current Mandi rate to see if a listing is a good deal!*`;

    case 'payment':
      return `💳 **UPI Direct Payment — How it Works**
━━━━━━━━━━━━━━━━━━━━
1. 📱 **Scan QR** or use Farmer's UPI ID (shown in order details)
2. 💸 Transfer the **exact order amount** using any UPI app
   (PhonePe, GPay, Paytm, BHIM, etc.)
3. ✅ Click **"I have Paid"** in the app to notify the farmer
4. 🤝 Farmer **verifies in their bank app** & confirms receipt
5. 📦 Pickup location & time is then confirmed

**Why Direct UPI?**
• 🚀 Instant settlement — farmer gets money in seconds
• 🔒 100% secure — direct bank-to-bank transfer
• 💯 Zero commission — every rupee goes to the farmer

*Need help with a specific payment? Tell me your order number.*`;

    case 'compare': {
      const sorted = [...products].sort((a, b) => {
        const ha = priceHistory[a.product_id];
        const hb = priceHistory[b.product_id];
        const pa = ha?.current_mandi_avg ?? a.mandi_avg_price;
        const pb = hb?.current_mandi_avg ?? b.mandi_avg_price;
        const ta = ha && ha.history.length >= 2 ? ha.history[ha.history.length - 1].mandi_avg - ha.history[ha.history.length - 2].mandi_avg : 0;
        const tb = hb && hb.history.length >= 2 ? hb.history[hb.history.length - 1].mandi_avg - hb.history[hb.history.length - 2].mandi_avg : 0;
        return tb - ta;
      });
      const top3 = sorted.slice(0, 3).map(p => {
        const h = priceHistory[p.product_id];
        const base = h?.current_mandi_avg ?? p.mandi_avg_price;
        const trend = h && h.history.length >= 2 ? h.history[h.history.length - 1].mandi_avg - h.history[h.history.length - 2].mandi_avg : 0;
        return `• **${p.product_name}**: ${formatPrice(base)}/Kg ${trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️'}`;
      }).join('\n');
      return `🏆 **Top Rising Crops This Week**
━━━━━━━━━━━━━━━━━━━━
${top3}

💡 These crops are seeing the highest price movement. Ask me about any specific crop for full details!`;
    }

    case 'trend': {
      const withTrend = products
        .filter(p => priceHistory[p.product_id])
        .map(p => {
          const h = priceHistory[p.product_id];
          const latest = h.history[h.history.length - 1];
          const prev = h.history[h.history.length - 2];
          const change = latest.mandi_avg - prev.mandi_avg;
          const pct = ((change / prev.mandi_avg) * 100).toFixed(1);
          return { name: p.product_name, change, pct };
        })
        .sort((a, b) => b.change - a.change);
      const lines = withTrend.map(t =>
        `${t.change > 0 ? '📈' : t.change < 0 ? '📉' : '➡️'} **${t.name}**: ${t.change > 0 ? '+' : ''}${t.pct}% this week`
      ).join('\n');
      return `📊 **Market Trend Analysis — ${today}**
━━━━━━━━━━━━━━━━━━━━
${lines}

💡 *Market is ${withTrend[0].change > 0 ? `rising — **${withTrend[0].name}** leading the gains 🚀` : `softening — wait for a better entry point`}*`;
    }

    case 'thanks':
      return `🙏 You're welcome, ${farmerName}! Happy to help.
      
Remember, I'm always here for:
• 💰 Live Mandi prices by city
• 📊 Market trend analysis
• 🌾 Farming & buying guidance

*Type anything to continue!* 🌱`;

    default: {
      // Try to fuzzy-match a product name
      const matchedProduct = products.find(p =>
        userText.toLowerCase().includes(p.product_name.toLowerCase().split(' ')[0].toLowerCase())
      );
      if (matchedProduct) return priceCard(matchedProduct);

      return `🤔 I didn't quite catch that. Here are things I can help with:

• 💰 **"Onion price in Mumbai today"**
• 📊 **"All mandi rates"** or **"live prices"**
• 📈 **"Which crops are trending up?"**
• 🌾 **"How to list my wheat?"**
• 🛒 **"How to buy basmati rice?"**
• 💳 **"How does UPI payment work?"**

Just ask! I understand English and Hindi crop names 🌱`;
    }
  }
};

// ─────────────────────────────────────────────────────────
//  Format message text with **bold** markdown
// ─────────────────────────────────────────────────────────
const FormattedText = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className={line.startsWith('━') ? 'border-t border-current/20 my-1' : ''}>
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} className="font-extrabold">{part}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  Quick Suggestion Chips
// ─────────────────────────────────────────────────────────
const FARMER_CHIPS = [
  { icon: '🌾', label: 'Wheat price today' },
  { icon: '🧅', label: 'Onion rate in Nashik' },
  { icon: '📊', label: 'Market trends' },
  { icon: '💰', label: 'All mandi prices' },
];

const BUYER_CHIPS = [
  { icon: '🍅', label: 'Tomato price in Mumbai' },
  { icon: '🌾', label: 'Basmati rate in Delhi' },
  { icon: '📈', label: 'Rising crop prices' },
  { icon: '🛒', label: 'How to buy direct?' },
];

// ─────────────────────────────────────────────────────────
//  Main ChatAssistant Component
// ─────────────────────────────────────────────────────────
export const ChatAssistant = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      from: 'bot',
      text: `🌾 **Namaste!** I'm **AgriSaathi AI** 🤖\n\nAsk me about **live mandi prices**, crop trends, or how to buy/sell on this platform!\n\n*Try: "Onion price in Mumbai today"* 🧅`,
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unread, setUnread] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const chips = role === 'FARMER' ? FARMER_CHIPS : BUYER_CHIPS;

  // Scroll to latest message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Track unread
  useEffect(() => {
    if (!isOpen) {
      const botMsgs = messages.filter(m => m.from === 'bot').length;
      setUnread(botMsgs > 1 ? 1 : 0);
    } else {
      setUnread(0);
    }
  }, [isOpen, messages]);

  // Init Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-send after voice input
        setTimeout(() => handleSend(transcript), 300);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => {
      recognitionRef.current?.abort();
      synthRef.current?.cancel();
    };
  }, []);

  const speakText = useCallback((text) => {
    if (!voiceEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    // Strip markdown symbols for TTS
    const clean = text
      .replace(/\*\*/g, '')
      .replace(/━+/g, '')
      .replace(/[🌾🧅🍅🌽📈📉📦💰🏪🛒🤖🌱🙏]/g, '')
      .replace(/•/g, '')
      .slice(0, 400); // limit TTS length

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;

    // Prefer Indian English voice if available
    const voices = synthRef.current.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang.startsWith('en'));
    if (indianVoice) utterance.voice = indianVoice;

    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: 'user', text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const hasOpenRouterKey = apiKey && apiKey !== 'YOUR_OPENROUTER_API_KEY_HERE';

    if (hasOpenRouterKey) {
      try {
        const historyForOpenRouter = messages.slice(-6).map(m => ({
          role: m.from === 'user' ? 'user' : 'assistant',
          content: m.text
        }));
        historyForOpenRouter.push({ role: 'user', content: text });

        const openRouterReply = await askOpenRouter(
          historyForOpenRouter,
          'google/gemini-2.5-flash',
          `You are AgriSathi AI assistant. Help farmers and buyers in India with APMC mandi prices, agricultural tips, crop sales, and trading. Current user role: ${role || 'FARMER'}. User name: ${user?.name || 'User'}. Keep replies informative, concise, and helpful with emojis.`
        );

        const botMsg = { id: Date.now() + 1, from: 'bot', text: openRouterReply, time: new Date() };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        speakText(openRouterReply);
        return;
      } catch (err) {
        console.warn('OpenRouter API call failed, falling back to local brain:', err);
      }
    }

    // Fallback to local rule-based smart brain
    setTimeout(() => {
      const responseText = generateResponse(text, role, user);
      const botMsg = { id: Date.now() + 1, from: 'bot', text: responseText, time: new Date() };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      speakText(responseText);
    }, 600);
  }, [input, messages, role, user, speakText]);

  const handleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      synthRef.current?.cancel();
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleChip = (chip) => {
    handleSend(chip.label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700/60"
            >
              💬 Ask about Mandi prices!
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); setUnread(0); }}
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-2xl cursor-pointer border-2 border-emerald-400/30"
          style={{ boxShadow: '0 8px 32px rgba(16,185,129,0.45)' }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-7 h-7" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Bot className="w-7 h-7" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread badge */}
          {unread > 0 && !isOpen && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
              {unread}
            </span>
          )}

          {/* Pulse ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/40 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
          )}
        </motion.button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-28 right-6 z-50 w-[calc(100vw-48px)] max-w-[420px] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden"
            style={{ maxHeight: isMinimized ? '72px' : '600px', height: isMinimized ? '72px' : '600px', transition: 'max-height 0.3s ease, height 0.3s ease' }}
          >

            {/* ── HEADER ── */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 shrink-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/80 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-emerald-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white leading-tight">AgriSaathi AI</p>
                <p className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  Live Mandi Prices · Voice Assist
                </p>
              </div>

              <div className="flex items-center gap-1">
                {/* Voice toggle */}
                <button
                  onClick={() => { setVoiceEnabled(!voiceEnabled); synthRef.current?.cancel(); }}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${voiceEnabled ? 'bg-emerald-700/80 text-emerald-300' : 'bg-slate-700/40 text-slate-400'}`}
                  title={voiceEnabled ? 'Voice ON – click to mute' : 'Voice OFF – click to enable'}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-xl bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 transition-all cursor-pointer"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`} />
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-700/40 text-slate-300 hover:bg-rose-700/60 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* ── MESSAGES ── */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-slate-50/80 to-white">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        msg.from === 'bot'
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}>
                        {msg.from === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.from === 'bot'
                          ? 'bg-white text-slate-800 border border-slate-200/80 shadow-sm rounded-tl-sm'
                          : 'bg-indigo-600 text-white rounded-tr-sm'
                      }`}>
                        <FormattedText text={msg.text} />
                        <p className={`text-[9px] mt-1.5 font-semibold ${msg.from === 'bot' ? 'text-slate-400' : 'text-indigo-300'}`}>
                          {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="flex gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>

                {/* ── QUICK CHIPS ── */}
                <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none shrink-0 border-t border-slate-100">
                  {chips.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleChip(chip)}
                      disabled={isTyping}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>{chip.icon}</span>
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* ── INPUT BAR ── */}
                <div className="px-3 py-3 bg-white border-t border-slate-100 shrink-0">
                  {isListening && (
                    <div className="mb-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 animate-pulse">
                      <Mic className="w-3.5 h-3.5" /> Listening... speak now
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-200 transition-all pr-1.5">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about mandi prices, crops..."
                      className="flex-1 bg-transparent px-4 py-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none"
                    />

                    {/* Mic Button */}
                    <button
                      onClick={handleVoice}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                      }`}
                      title="Voice input"
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Send Button */}
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping}
                      className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-center text-[9px] text-slate-400 font-semibold mt-1.5">
                    🤖 AgriSaathi AI · Powered by APMC Agmarknet Data
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
