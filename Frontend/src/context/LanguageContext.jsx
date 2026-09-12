import React, { createContext, useContext } from 'react';

const LanguageContext = createContext(null);

export const TRANSLATIONS = {
  en: {
    // Navbar & Common Navigation
    brand_subtitle: 'Mandi Linkage Platform',
    home: 'Home',
    my_products: 'My Products',
    add_product: 'Add Product',
    marketplace: 'Marketplace',
    price_discovery: 'Price Discovery',
    dashboard: 'Dashboard',
    orders: 'Orders',
    login: 'Log In',
    signup: 'Sign Up',
    get_started: 'Get Started',
    sign_out: 'Sign Out',
    all_notifications: 'All Notifications',
    notifications: 'Notifications',
    notifications_center: 'Notifications Center',

    // Login Required Modal
    login_required_title: 'Log In Required',
    login_required_heading: 'Sign In to Access Feature',
    login_required_desc: 'To purchase products, contact farmers, or place orders on Agriसाथी, please log in or create an account.',
    login_required_action_prefix: 'To',
    login_required_action_suffix: ', you must log in first.',
    guest_access_note: 'Unauthenticated users can freely view products, crop prices, and live Mandi data.',
    login_now: 'Log In Now',
    create_account: 'Create Free Account',
    continue_browsing: 'Continue Browsing Marketplace',
    guest_marketplace_banner: 'Guest View — You are browsing public produce listings. Log in to buy direct produce.',

    // Hero & Landing
    hero_title_1: 'Direct Farm Sales.',
    hero_title_2: 'Zero Middlemen.',
    hero_title_3: 'Fair Prices.',
    hero_sub: 'Eliminate multi-layer intermediary commission cuts. Farmers list harvest directly with real-time APMC Mandi price discovery, and buyers purchase directly with transparent instant UPI settlement.',
    im_farmer: "I'm a Farmer — Sell Direct",
    im_buyer: "I'm a Buyer — Buy Direct",
    live_mandi_rates: 'Live Mandi Rates',

    // Farmer Dashboard & Produce Listings
    farmer_producer_dashboard: 'Farmer Producer Dashboard',
    farmer_producer_hub: 'Farmer Producer Hub',
    location_label: 'Location',
    land_label: 'Land',
    direct_upi_label: 'Direct UPI',
    live_produce_listed: 'LIVE PRODUCE LISTED',
    active_on_marketplace: 'Active on Marketplace',
    awaiting_confirmation: 'AWAITING CONFIRMATION',
    buyer_claimed_payments: 'Buyer Claimed Payments',
    total_direct_payouts: 'TOTAL DIRECT PAYOUTS',
    direct_to_bank: '100% Direct to Your Bank',
    eliminated_broker_cuts: 'Eliminated Broker Cuts',
    quick_farmer_actions: 'Quick Farmer Actions',
    add_produce_to_sell: 'Add Produce to Sell',
    product_list: 'Product List',
    pending_orders: 'Pending Orders',
    completed_orders: 'Completed Orders',
    manage_my_products: 'Manage My Products',
    view_buyer_orders: 'View Buyer Orders',
    check_live_mandi_rates: 'Check Live Mandi Rates',
    recent_buyer_orders_attention: 'Recent Buyer Orders Requiring Attention',
    view_all_orders: 'View All Orders',
    create_produce_listing: 'Create Produce Listing',
    active_listings: 'Active Listings',
    live_on_marketplace: 'Live on Buyer Marketplace',
    claimed_payments: 'Claimed Payments',
    requires_upi_verification: 'Requires UPI Bank Verification',
    total_earnings: 'Total Direct Earnings',
    direct_upi_settlement: '100% Direct UPI Settlement',
    mandi_price_advantage: 'Mandi Price Advantage',
    vs_intermediaries: 'Vs Local Intermediary Offers',
    incoming_buyer_orders: 'Incoming Buyer Orders',
    verify: 'verify',
    no_produce_listings: 'No produce listings published yet',
    list_harvest_desc: 'List your current crop harvest with live Mandi price comparison to start receiving buyer offers.',
    create_first_listing: 'Create First Listing',
    asking_price: 'Asking Price',
    available_stock: 'Available Stock',
    stock_available: 'Stock Available',
    harvested: 'Harvested',
    no_orders_received: 'No orders received yet.',
    buyer_claims_payment: 'BUYER CLAIMS PAYMENT SENT',
    confirmed_and_paid: 'CONFIRMED & PAID',
    cancelled: 'CANCELLED',
    buyer_name: 'Buyer Name',
    produce_quantity: 'Produce Quantity',
    rate_per: 'Rate per',
    total_order_amount: 'Total Order Amount',
    buyer_claims_upi_msg: 'Buyer claims UPI Payment sent to',
    txn_ref: 'Txn Ref:',
    open_bank_app_msg: 'Please open your PhonePe / Google Pay / BHIM bank app to verify receipt of',
    before_confirming: 'before confirming.',
    confirm_received: 'Confirm Received',
    not_received: 'Not Received',
    payment_verified: 'Payment Verified',
    pickup_ready: 'Pickup ready at farmgate',
    edit_delete: 'Edit / Delete',

    // Product Modal & Management
    manage_products: 'Manage Products to Sell',
    add_new_product: 'Add New Product',
    edit_product: 'Edit Product',
    delete_product: 'Delete Product',
    select_crop: 'Select Crop / Product',
    quality_grade: 'Quality Grade',
    quantity: 'Total Quantity',
    asking_price_unit: 'Asking Price per Unit (₹)',
    harvest_date: 'Harvest Date',
    pickup_location: 'Pickup Point / Village Address',
    save_product: 'Publish Product to Sell',
    update_product: 'Save Product Changes',
    confirm_delete: 'Are you sure you want to delete this product listing?',
    delete_warning: 'This action cannot be undone.',
    confirm_delete_btn: 'Confirm Delete Product',
    live_apmc_benchmark: 'Live APMC Mandi Price Discovery Benchmark',
    regional_apmc: 'Regional APMC Benchmark',
    loading_mandi_chart: 'Loading live mandi price benchmark chart...',
    your_ask: 'Your Ask',
    mandi_avg_rs: 'Mandi Avg (₹)',

    // Buyer Dashboard & Sourcing
    buyer_sourcing_portal: 'Buyer Wholesale Sourcing Portal',
    category: 'Category:',
    wholesaler: 'Wholesaler',
    sourcing_farmgate: 'Sourcing directly from certified farmgates',
    browse_marketplace: 'Browse Marketplace',
    my_orders: 'My Orders',
    sourcing_filters: 'Sourcing Filters',
    all_crop_categories: 'All Crop Categories',
    filter_district: 'Filter District (e.g. Nashik, Karnal)',
    reset_filters: 'Reset Filters',
    buy_now: 'Buy Now',
    view_details: 'View Details',
    no_orders_buyer: 'No orders placed yet. Browse the marketplace to buy direct produce.',
    total_payable: 'Total Payable',
    pickup_gate: 'Pickup Gate:',
    view_payment_details: 'View Payment & Stepper Details',
    listing_details: 'Listing Details',
    direct_farmer_upi: 'Direct Farmer UPI Settlement',
    proceed_checkout: 'Proceed to Checkout',
    upi_target: 'UPI Target:',
    pickup_point: 'Pickup Point:',
    farmer_rating: 'Rating',
    asking_direct_price: 'Asking Direct Price',
    farmer: 'Farmer',

    // Price Discovery Engine
    apmc_market_intelligence: 'APMC Live Mandi Rates',
    price_discovery_title: 'Live APMC Mandi Price Discovery Engine',
    price_discovery_sub: 'Real-time mandi rates from 50+ APMC markets across India.',
    price_discovery_desc: 'Compare mandi benchmark prices across states and discover fair direct trade prices.',
    search_crop_placeholder: 'Search crop name (e.g. Onion, Potato, Wheat)...',
    filter_state: 'All States',
    current_mandi_avg: 'Current Mandi Avg',
    highest_mandi: 'Highest Mandi',
    lowest_mandi: 'Lowest Mandi',
    market_trend: 'Market Trend',
    select_crop_produce: 'Select Crop / Product',
    add_product_option: '+ Add Product',
    select_mandi_region: 'Select Mandi / Region',
    benchmark_rate: 'APMC Benchmark Rate',
    price_trend_30: '30-Day APMC Price Trend',
    apmc_mandi_avg: 'APMC Mandi Avg',
    platform_direct_avg: 'Platform Direct Avg',
    apmc_mandi_rate: 'APMC Mandi Rate',
    direct_ask_rate: 'Direct Ask Rate',
    recent_mandi_breakdown: 'Recent Mandi Price & Quality Breakdown',
    mandi_min_price: 'Min Price (₹)',
    mandi_avg_price: 'Avg Price (₹)',
    mandi_max_price: 'Max Price (₹)',
    agrisathi_fair_range: 'Agriसाथी Fair Range (₹)',

    // Common Actions & Badges
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    mandi_avg: 'Mandi Avg',
    below_mandi: 'Below Mandi Avg',
    above_mandi: 'Above Mandi Avg',
    fair_mandi: 'Fair Mandi Rate',
    vs_mandi: 'vs Mandi',
    location: 'Location:',
    upi: 'UPI:',
  }
};

export const LanguageProvider = ({ children }) => {
  const language = 'en';

  const toggleLanguage = () => {};
  const setLanguage = () => {};

  const t = (key) => {
    if (!key) return '';
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

