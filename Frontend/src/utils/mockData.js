// Comprehensive mock data - Farmer-Buyer Direct Market Platform

export const MOCK_PRODUCTS = [
  {
    product_id: "prod-1",
    product_name: "Sharbati Wheat",
    category: "Cereal",
    unit: "Kg",
    description: "Premium high-protein golden Sharbati wheat, direct from Sehore fields. Ideal for quality flour and rotis.",
    mandi_avg_price: 2450,
    mandi_min_price: 2200,
    mandi_max_price: 2700,
    image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
  },
  {
    product_id: "prod-2",
    product_name: "Basmati Rice 1121",
    category: "Cereal",
    unit: "Kg",
    description: "Extra long grain aromatic 1121 Steam Basmati rice. Carefully harvested and aged.",
    mandi_avg_price: 4850,
    mandi_min_price: 4500,
    mandi_max_price: 5200,
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
  },
  {
    product_id: "prod-3",
    product_name: "Red Hybrid Tomatoes",
    category: "Vegetable",
    unit: "Kg",
    description: "Firm, bright red premium hybrid tomatoes with excellent shelf life. Farm fresh.",
    mandi_avg_price: 1850,
    mandi_min_price: 1400,
    mandi_max_price: 2200,
    image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
  },
  {
    product_id: "prod-4",
    product_name: "Nashik Red Onion",
    category: "Vegetable",
    unit: "Kg",
    description: "Top-grade medium-large Nashik red onions. Well-dried outer skin, dry and cured.",
    mandi_avg_price: 2150,
    mandi_min_price: 1800,
    mandi_max_price: 2500,
    image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?auto=format&fit=crop&w=800&q=80"
  },
  {
    product_id: "prod-5",
    product_name: "Jyoti Potato",
    category: "Vegetable",
    unit: "Kg",
    description: "Smooth skin cold-storage ready Jyoti potatoes. Uniform sizing and low moisture content.",
    mandi_avg_price: 1400,
    mandi_min_price: 1200,
    mandi_max_price: 1650,
    image_url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80"
  },
  {
    product_id: "prod-6",
    product_name: "Yellow Soybean",
    category: "Oilseed",
    unit: "Kg",
    description: "High oil content yellow soybean seed. Cleaned, machine selected, low moisture.",
    mandi_avg_price: 4300,
    mandi_min_price: 4000,
    mandi_max_price: 4600,
    image_url: "https://images.unsplash.com/photo-1599599810694-b5b37304c03d?auto=format&fit=crop&w=800&q=80"
  },
  {
    product_id: "prod-7",
    product_name: "Organic Turmeric Finger",
    category: "Spice",
    unit: "Kg",
    description: "High curcumin content Salem turmeric fingers. Naturally sun-dried, chemical free.",
    mandi_avg_price: 8200,
    mandi_min_price: 7600,
    mandi_max_price: 9000,
    image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
  },
  {
    product_id: "prod-8",
    product_name: "Guntur Red Chilli",
    category: "Spice",
    unit: "Kg",
    description: "Fiery red S17 Teja Guntur dry chillies. Pungent aroma, deep red color.",
    mandi_avg_price: 18000,
    mandi_min_price: 16500,
    mandi_max_price: 19800,
    image_url: "https://images.unsplash.com/photo-1588879460618-924a065a2542?auto=format&fit=crop&w=800&q=80"
  }
];

export const MOCK_USERS = [
  {
    user_id: "usr-admin-1",
    name: "System Admin",
    email: "admin@agrisathi.in",
    phone: "+91 99999 00000",
    role: "ADMIN",
    isProfileCompleted: true,
    profile: {
      department: "APMC Market Control Board",
      designation: "Platform Administrator"
    }
  },
  {
    user_id: "usr-farmer-1",
    name: "Ramesh Kumar Patel",
    email: "ramesh.farmer@agrimarket.in",
    phone: "+91 98765 43210",
    role: "FARMER",
    isProfileCompleted: true,
    profile: {
      village: "Pimpalgaon",
      district: "Nashik",
      state: "Maharashtra",
      land_area: "12 Acres",
      upi_id: "ramesh.patel@okaxis",
      rating: 4.9,
      successful_sales: 38
    }
  },
  {
    user_id: "usr-farmer-2",
    name: "Sukhwinder Singh",
    email: "sukhwinder@agrimarket.in",
    phone: "+91 98123 76543",
    role: "FARMER",
    isProfileCompleted: true,
    profile: {
      village: "Taraori",
      district: "Karnal",
      state: "Haryana",
      land_area: "25 Acres",
      upi_id: "sukhwinder@paytm",
      rating: 4.8,
      successful_sales: 52
    }
  },
  {
    user_id: "usr-buyer-1",
    name: "Vikram Malhotra",
    email: "vikram@freshmandi.com",
    phone: "+91 98999 11223",
    role: "BUYER",
    isProfileCompleted: true,
    profile: {
      business_name: "FreshMandi Wholesale Pvt Ltd",
      buyer_type: "Wholesaler",
      address: "APMC Market Yard, Gate No 3",
      city: "Mumbai",
      gstin: "27AAACF1234F1Z5"
    }
  },
  {
    user_id: "usr-buyer-2",
    name: "Priya Sharma",
    email: "priya@organickart.in",
    phone: "+91 97111 22334",
    role: "BUYER",
    isProfileCompleted: true,
    profile: {
      business_name: "Annapurna Retail Chain",
      buyer_type: "Retailer",
      address: "MG Road Sector 14",
      city: "Gurugram",
      gstin: "07AABCA9876E1Z2"
    }
  }
];

export const MOCK_LISTINGS = [
  {
    listing_id: "list-101",
    farmer_id: "usr-farmer-1",
    farmer_name: "Ramesh Kumar Patel",
    farmer_location: "Nashik, Maharashtra",
    farmer_upi: "ramesh.patel@okaxis",
    farmer_phone: "+91 98765 43210",
    farmer_rating: 4.9,
    product_id: "prod-4",
    product_name: "Nashik Red Onion",
    category: "Vegetable",
    unit: "Kg",
    quantity: 150,
    available_stock: 150,
    price_per_unit: 1980,
    mandi_avg_price: 2150,
    quality_grade: "Grade A+",
    harvest_date: "2026-09-02",
    pickup_location: "Pimpalgaon APMC Yard, Nashik",
    status: "AVAILABLE",
    created_at: "2026-09-05T08:30:00Z",
    image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?auto=format&fit=crop&w=800&q=80"
  },
  {
    listing_id: "list-102",
    farmer_id: "usr-farmer-2",
    farmer_name: "Sukhwinder Singh",
    farmer_location: "Karnal, Haryana",
    farmer_upi: "sukhwinder@paytm",
    farmer_phone: "+91 98123 76543",
    farmer_rating: 4.8,
    product_id: "prod-2",
    product_name: "Basmati Rice 1121",
    category: "Cereal",
    unit: "Kg",
    quantity: 80,
    available_stock: 50,
    price_per_unit: 4650,
    mandi_avg_price: 4850,
    quality_grade: "Grade A+",
    harvest_date: "2026-08-28",
    pickup_location: "Taraori Grain Market, Karnal",
    status: "AVAILABLE",
    created_at: "2026-09-04T10:15:00Z",
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"
  },
  {
    listing_id: "list-103",
    farmer_id: "usr-farmer-1",
    farmer_name: "Ramesh Kumar Patel",
    farmer_location: "Nashik, Maharashtra",
    farmer_upi: "ramesh.patel@okaxis",
    farmer_phone: "+91 98765 43210",
    farmer_rating: 4.9,
    product_id: "prod-3",
    product_name: "Red Hybrid Tomatoes",
    category: "Vegetable",
    unit: "Kg",
    quantity: 60,
    available_stock: 60,
    price_per_unit: 1720,
    mandi_avg_price: 1850,
    quality_grade: "Grade A",
    harvest_date: "2026-09-07",
    pickup_location: "Farmgate Pick-up, Pimpalgaon",
    status: "AVAILABLE",
    created_at: "2026-09-07T06:00:00Z",
    image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"
  },
  {
    listing_id: "list-104",
    farmer_id: "usr-farmer-2",
    farmer_name: "Sukhwinder Singh",
    farmer_location: "Karnal, Haryana",
    farmer_upi: "sukhwinder@paytm",
    farmer_phone: "+91 98123 76543",
    farmer_rating: 4.8,
    product_id: "prod-1",
    product_name: "Sharbati Wheat",
    category: "Cereal",
    unit: "Kg",
    quantity: 200,
    available_stock: 200,
    price_per_unit: 2380,
    mandi_avg_price: 2450,
    quality_grade: "Grade A+",
    harvest_date: "2026-08-20",
    pickup_location: "Karnal Mandi Gate 2",
    status: "AVAILABLE",
    created_at: "2026-09-01T14:20:00Z",
    image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
  },
  {
    listing_id: "list-105",
    farmer_id: "usr-farmer-1",
    farmer_name: "Ramesh Kumar Patel",
    farmer_location: "Nashik, Maharashtra",
    farmer_upi: "ramesh.patel@okaxis",
    farmer_phone: "+91 98765 43210",
    farmer_rating: 4.9,
    product_id: "prod-7",
    product_name: "Organic Turmeric Finger",
    category: "Spice",
    unit: "Kg",
    quantity: 25,
    available_stock: 25,
    price_per_unit: 7900,
    mandi_avg_price: 8200,
    quality_grade: "Organic A+",
    harvest_date: "2026-08-15",
    pickup_location: "Pimpalgaon Organic Depot",
    status: "AVAILABLE",
    created_at: "2026-09-03T11:45:00Z",
    image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80"
  }
];

export const MOCK_ORDERS = [
  {
    order_id: "ord-8001",
    listing_id: "list-101",
    product_name: "Nashik Red Onion",
    buyer_id: "usr-buyer-1",
    buyer_name: "Vikram Malhotra",
    buyer_business: "FreshMandi Wholesale Pvt Ltd",
    buyer_phone: "+91 98999 11223",
    farmer_id: "usr-farmer-1",
    farmer_name: "Ramesh Kumar Patel",
    farmer_upi: "ramesh.patel@okaxis",
    quantity: 30,
    unit: "Kg",
    price_per_unit: 1980,
    total_amount: 59400,
    status: "PENDING_CONFIRMATION", // PENDING -> PENDING_CONFIRMATION -> CONFIRMED -> COMPLETED | CANCELLED
    order_date: "2026-09-08T15:30:00Z",
    pickup_location: "Pimpalgaon APMC Yard, Nashik",
    payment: {
      payment_id: "pay-9001",
      amount: 59400,
      payment_method: "UPI",
      payment_status: "CLAIMED", // PENDING -> CLAIMED -> PAID | REJECTED
      transaction_id: "UPI/629011928301/PAY",
      claimed_at: "2026-09-08T15:35:00Z"
    }
  },
  {
    order_id: "ord-8002",
    listing_id: "list-102",
    product_name: "Basmati Rice 1121",
    buyer_id: "usr-buyer-2",
    buyer_name: "Priya Sharma",
    buyer_business: "Annapurna Retail Chain",
    buyer_phone: "+91 97111 22334",
    farmer_id: "usr-farmer-2",
    farmer_name: "Sukhwinder Singh",
    farmer_upi: "sukhwinder@paytm",
    quantity: 30,
    unit: "Kg",
    price_per_unit: 4650,
    total_amount: 139500,
    status: "CONFIRMED",
    order_date: "2026-09-06T11:20:00Z",
    pickup_location: "Taraori Grain Market, Karnal",
    payment: {
      payment_id: "pay-9002",
      amount: 139500,
      payment_method: "UPI",
      payment_status: "PAID",
      transaction_id: "UPI/582910482910/PAID",
      paid_at: "2026-09-06T11:25:00Z"
    }
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    notification_id: "notif-1",
    user_id: "usr-farmer-1",
    title: "💰 Payment Claimed by Buyer!",
    message: "Vikram Malhotra (FreshMandi Wholesale) claimed UPI payment of ₹59,400 for 30 Kg Nashik Red Onion. Please verify your bank/UPI app.",
    is_read: false,
    created_at: "2026-09-08T15:36:00Z",
    type: "PAYMENT_CLAIMED",
    target_order_id: "ord-8001"
  },
  {
    notification_id: "notif-2",
    user_id: "usr-buyer-1",
    title: "📦 Order Placed Successfully",
    message: "Your order #ord-8001 for 30 Kg Nashik Red Onion has been created. Complete payment via UPI to notify farmer.",
    is_read: true,
    created_at: "2026-09-08T15:30:00Z",
    type: "ORDER_CREATED",
    target_order_id: "ord-8001"
  },
  {
    notification_id: "notif-3",
    user_id: "usr-farmer-2",
    title: "✅ Payment Received & Confirmed",
    message: "You confirmed receipt of ₹1,39,500 from Annapurna Retail Chain. Order #ord-8002 is marked CONFIRMED.",
    is_read: true,
    created_at: "2026-09-06T11:26:00Z",
    type: "ORDER_CONFIRMED",
    target_order_id: "ord-8002"
  }
];

export const MOCK_PRICE_HISTORY = {
  "prod-4": { // Nashik Red Onion
    product_name: "Nashik Red Onion",
    unit: "Kg",
    current_mandi_avg: 2150,
    mandi_name: "Pimpalgaon & Lasalgaon APMC, Nashik",
    history: [
      { date: "Aug 10", mandi_avg: 1950, platform_avg: 1910, min_price: 1700, max_price: 2200 },
      { date: "Aug 15", mandi_avg: 2020, platform_avg: 1980, min_price: 1750, max_price: 2300 },
      { date: "Aug 20", mandi_avg: 2100, platform_avg: 2050, min_price: 1800, max_price: 2400 },
      { date: "Aug 25", mandi_avg: 2180, platform_avg: 2120, min_price: 1850, max_price: 2480 },
      { date: "Sep 01", mandi_avg: 2200, platform_avg: 2160, min_price: 1900, max_price: 2500 },
      { date: "Sep 05", mandi_avg: 2150, platform_avg: 2100, min_price: 1850, max_price: 2450 },
      { date: "Sep 09", mandi_avg: 2150, platform_avg: 2080, min_price: 1800, max_price: 2420 }
    ]
  },
  "prod-1": { // Wheat
    product_name: "Sharbati Wheat",
    unit: "Kg",
    current_mandi_avg: 2450,
    mandi_name: "Sehore & Indore APMC, Madhya Pradesh",
    history: [
      { date: "Aug 10", mandi_avg: 2380, platform_avg: 2340, min_price: 2150, max_price: 2600 },
      { date: "Aug 15", mandi_avg: 2400, platform_avg: 2360, min_price: 2180, max_price: 2620 },
      { date: "Aug 20", mandi_avg: 2420, platform_avg: 2390, min_price: 2200, max_price: 2650 },
      { date: "Aug 25", mandi_avg: 2450, platform_avg: 2410, min_price: 2220, max_price: 2680 },
      { date: "Sep 01", mandi_avg: 2480, platform_avg: 2440, min_price: 2250, max_price: 2720 },
      { date: "Sep 05", mandi_avg: 2450, platform_avg: 2415, min_price: 2200, max_price: 2700 },
      { date: "Sep 09", mandi_avg: 2450, platform_avg: 2400, min_price: 2200, max_price: 2700 }
    ]
  },
  "prod-2": { // Basmati Rice
    product_name: "Basmati Rice 1121",
    unit: "Kg",
    current_mandi_avg: 4850,
    mandi_name: "Karnal & Taraori Mandi, Haryana",
    history: [
      { date: "Aug 10", mandi_avg: 4600, platform_avg: 4520, min_price: 4300, max_price: 4950 },
      { date: "Aug 15", mandi_avg: 4700, platform_avg: 4610, min_price: 4400, max_price: 5050 },
      { date: "Aug 20", mandi_avg: 4750, platform_avg: 4680, min_price: 4450, max_price: 5100 },
      { date: "Aug 25", mandi_avg: 4800, platform_avg: 4730, min_price: 4480, max_price: 5150 },
      { date: "Sep 01", mandi_avg: 4900, platform_avg: 4820, min_price: 4550, max_price: 5250 },
      { date: "Sep 05", mandi_avg: 4850, platform_avg: 4780, min_price: 4500, max_price: 5200 },
      { date: "Sep 09", mandi_avg: 4850, platform_avg: 4750, min_price: 4500, max_price: 5200 }
    ]
  },
  "prod-3": { // Tomato
    product_name: "Red Hybrid Tomatoes",
    unit: "Kg",
    current_mandi_avg: 1850,
    mandi_name: "Kolar & Narayangaon Mandi",
    history: [
      { date: "Aug 10", mandi_avg: 1500, platform_avg: 1450, min_price: 1100, max_price: 1900 },
      { date: "Aug 15", mandi_avg: 1650, platform_avg: 1600, min_price: 1250, max_price: 2000 },
      { date: "Aug 20", mandi_avg: 1800, platform_avg: 1740, min_price: 1350, max_price: 2150 },
      { date: "Aug 25", mandi_avg: 1950, platform_avg: 1890, min_price: 1450, max_price: 2300 },
      { date: "Sep 01", mandi_avg: 1900, platform_avg: 1840, min_price: 1400, max_price: 2250 },
      { date: "Sep 05", mandi_avg: 1850, platform_avg: 1790, min_price: 1380, max_price: 2200 },
      { date: "Sep 09", mandi_avg: 1850, platform_avg: 1770, min_price: 1350, max_price: 2200 }
    ]
  }
};
