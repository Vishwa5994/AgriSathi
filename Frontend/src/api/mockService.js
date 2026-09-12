import {
  MOCK_PRODUCTS,
  MOCK_LISTINGS,
  MOCK_ORDERS,
  MOCK_NOTIFICATIONS,
  MOCK_USERS,
  MOCK_PRICE_HISTORY,
} from '../utils/mockData';

// Helper to get or initialize state in localStorage
const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(`agri_${key}`);
    if (data) return JSON.parse(data);
    localStorage.setItem(`agri_${key}`, JSON.stringify(fallback));
    return fallback;
  } catch (e) {
    console.error('Local Storage Error:', e);
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(`agri_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Local Storage Error:', e);
  }
};

// Mock Auth API
export const mockAuthApi = {
  login: async (email, password) => {
    await new Promise((res) => setTimeout(res, 400));
    const users = getStored('users', MOCK_USERS);
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user && (email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@agrisathi.in')) {
      user = {
        user_id: 'usr-admin-1',
        name: 'System Admin',
        email: email || 'admin@agrisathi.in',
        phone: '+91 99999 00000',
        role: 'ADMIN',
        isProfileCompleted: true,
        profile: { department: 'APMC Market Control Board', designation: 'Platform Administrator' }
      };
      users.push(user);
      setStored('users', users);
    }

    if (user) {
      const token = `mock-jwt-token-${user.user_id}`;
      return { user, token };
    }

    // Default fallback mock user based on email prefix or farmer/buyer
    const isFarmer = email.includes('farmer') || email.includes('ramesh');
    const newUser = {
      user_id: `usr-${Date.now()}`,
      name: isFarmer ? 'Farmer User' : 'Buyer User',
      email,
      phone: '+91 98000 11122',
      role: isFarmer ? 'FARMER' : 'BUYER',
      isProfileCompleted: true,
      profile: isFarmer
        ? { village: 'Pimpalgaon', district: 'Nashik', state: 'Maharashtra', upi_id: 'farmer@upi' }
        : { business_name: 'Agri Traders', buyer_type: 'Wholesaler', city: 'Mumbai' }
    };
    users.push(newUser);
    setStored('users', users);
    return { user: newUser, token: `mock-jwt-${newUser.user_id}` };
  },

  loginWithGoogle: async (googleUser) => {
    await new Promise((res) => setTimeout(res, 400));
    const users = getStored('users', MOCK_USERS);
    let existingUser = users.find((u) => u.email.toLowerCase() === googleUser.email.toLowerCase());

    if (!existingUser) {
      const isFarmer = googleUser.role === 'FARMER';
      const hasFullProfile = !!googleUser.profile && (googleUser.profile.village || googleUser.profile.business_name);
      existingUser = {
        user_id: `usr-google-${Date.now()}`,
        name: googleUser.name || 'Google User',
        email: googleUser.email,
        avatar: googleUser.picture || null,
        phone: googleUser.phone || '',
        role: googleUser.role || 'FARMER',
        auth_provider: 'GOOGLE',
        isProfileCompleted: hasFullProfile,
        profile: googleUser.profile || {}
      };
      users.push(existingUser);
      setStored('users', users);
    } else if (googleUser.profile) {
      existingUser.profile = { ...existingUser.profile, ...googleUser.profile };
      if (googleUser.role) existingUser.role = googleUser.role;
      if (googleUser.phone) existingUser.phone = googleUser.phone;
      existingUser.isProfileCompleted = true;
      setStored('users', users);
    }
    const token = `mock-google-jwt-${existingUser.user_id}`;
    return { user: existingUser, token };
  },

  signup: async (userData) => {
    await new Promise((res) => setTimeout(res, 400));
    const users = getStored('users', MOCK_USERS);
    const newUser = {
      user_id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'FARMER',
      isProfileCompleted: true,
      profile: userData.profile || {}
    };
    users.push(newUser);
    setStored('users', users);
    return { user: newUser, token: `mock-jwt-${newUser.user_id}` };
  },

  updateProfile: async (userId, profileData) => {
    await new Promise((res) => setTimeout(res, 300));
    const users = getStored('users', MOCK_USERS);
    const idx = users.findIndex((u) => u.user_id === userId);
    if (idx !== -1) {
      users[idx].profile = { ...users[idx].profile, ...profileData };
      users[idx].isProfileCompleted = true;
      setStored('users', users);
      return users[idx];
    }
    return null;
  }
};

// Mock Listings API
export const mockListingsApi = {
  getListings: async (filters = {}) => {
    await new Promise((res) => setTimeout(res, 300));
    let listings = getStored('listings', MOCK_LISTINGS);

    if (filters.product_id) {
      listings = listings.filter((l) => l.product_id === filters.product_id);
    }
    if (filters.district) {
      listings = listings.filter((l) =>
        l.farmer_location.toLowerCase().includes(filters.district.toLowerCase())
      );
    }
    if (filters.min_price) {
      listings = listings.filter((l) => l.price_per_unit >= Number(filters.min_price));
    }
    if (filters.max_price) {
      listings = listings.filter((l) => l.price_per_unit <= Number(filters.max_price));
    }
    if (filters.status) {
      listings = listings.filter((l) => l.status === filters.status);
    }
    if (filters.farmer_id) {
      listings = listings.filter((l) => l.farmer_id === filters.farmer_id);
    }

    return listings;
  },

  getListingById: async (id) => {
    await new Promise((res) => setTimeout(res, 200));
    const listings = getStored('listings', MOCK_LISTINGS);
    return listings.find((l) => l.listing_id === id) || null;
  },

  createListing: async (listingData, currentUser) => {
    await new Promise((res) => setTimeout(res, 500));
    const listings = getStored('listings', MOCK_LISTINGS);
    const products = getStored('products', MOCK_PRODUCTS);
    const product = products.find((p) => p.product_id === listingData.product_id) || products[0];

    const newListing = {
      listing_id: `list-${Date.now()}`,
      farmer_id: currentUser?.user_id || 'usr-farmer-1',
      farmer_name: currentUser?.name || 'Ramesh Kumar Patel',
      farmer_location: `${currentUser?.profile?.district || 'Nashik'}, ${currentUser?.profile?.state || 'Maharashtra'}`,
      farmer_upi: currentUser?.profile?.upi_id || 'ramesh.patel@okaxis',
      farmer_phone: currentUser?.phone || '+91 98765 43210',
      farmer_rating: currentUser?.profile?.rating || 4.9,
      product_id: product.product_id,
      product_name: product.product_name,
      category: product.category,
      unit: product.unit,
      quantity: Number(listingData.quantity),
      available_stock: Number(listingData.quantity),
      price_per_unit: Number(listingData.price_per_unit),
      mandi_avg_price: product.mandi_avg_price,
      quality_grade: listingData.quality_grade || 'Grade A+',
      harvest_date: listingData.harvest_date || new Date().toISOString().split('T')[0],
      pickup_location: listingData.pickup_location || 'Farmgate APMC Yard',
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
      image_url: listingData.image_url || product.image_url
    };

    listings.unshift(newListing);
    setStored('listings', listings);
    return newListing;
  },

  updateListing: async (listingId, listingData) => {
    await new Promise((res) => setTimeout(res, 400));
    const listings = getStored('listings', MOCK_LISTINGS);
    const idx = listings.findIndex((l) => l.listing_id === listingId);
    if (idx !== -1) {
      const products = getStored('products', MOCK_PRODUCTS);
      const product = products.find((p) => p.product_id === listingData.product_id) || listings[idx];

      listings[idx] = {
        ...listings[idx],
        product_id: product.product_id || listings[idx].product_id,
        product_name: product.product_name || listings[idx].product_name,
        quantity: Number(listingData.quantity ?? listings[idx].quantity),
        available_stock: Number(listingData.quantity ?? listings[idx].available_stock),
        price_per_unit: Number(listingData.price_per_unit ?? listings[idx].price_per_unit),
        quality_grade: listingData.quality_grade || listings[idx].quality_grade,
        harvest_date: listingData.harvest_date || listings[idx].harvest_date,
        pickup_location: listingData.pickup_location || listings[idx].pickup_location,
        image_url: listingData.image_url || product.image_url || listings[idx].image_url
      };
      setStored('listings', listings);
      return listings[idx];
    }
    return null;
  },

  deleteListing: async (listingId) => {
    await new Promise((res) => setTimeout(res, 300));
    let listings = getStored('listings', MOCK_LISTINGS);
    listings = listings.filter((l) => l.listing_id !== listingId);
    setStored('listings', listings);
    return true;
  }
};

// Mock Orders API
export const mockOrdersApi = {
  getMine: async (user) => {
    await new Promise((res) => setTimeout(res, 300));
    const orders = getStored('orders', MOCK_ORDERS);

    if (!user) return orders;
    if (user.role === 'FARMER') {
      return orders.filter((o) => o.farmer_id === user.user_id || o.farmer_name === user.name);
    }
    return orders.filter((o) => o.buyer_id === user.user_id || o.buyer_name === user.name);
  },

  getOrderById: async (id) => {
    await new Promise((res) => setTimeout(res, 200));
    const orders = getStored('orders', MOCK_ORDERS);
    return orders.find((o) => o.order_id === id) || null;
  },

  createOrder: async (orderData, currentUser) => {
    await new Promise((res) => setTimeout(res, 500));
    const listings = getStored('listings', MOCK_LISTINGS);
    const listing = listings.find((l) => l.listing_id === orderData.listing_id);

    const quantity = Number(orderData.quantity);
    const totalAmount = quantity * (listing?.price_per_unit || 1000);

    const newOrder = {
      order_id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      listing_id: orderData.listing_id,
      product_name: listing?.product_name || 'Agri Produce',
      buyer_id: currentUser?.user_id || 'usr-buyer-1',
      buyer_name: currentUser?.name || 'Vikram Malhotra',
      buyer_business: currentUser?.profile?.business_name || 'Wholesale Agri Buyer',
      buyer_phone: currentUser?.phone || '+91 98999 11223',
      farmer_id: listing?.farmer_id || 'usr-farmer-1',
      farmer_name: listing?.farmer_name || 'Ramesh Kumar Patel',
      farmer_upi: listing?.farmer_upi || 'ramesh.patel@okaxis',
      quantity,
      unit: listing?.unit || 'Kg',
      price_per_unit: listing?.price_per_unit || 1000,
      total_amount: totalAmount,
      status: 'PENDING',
      order_date: new Date().toISOString(),
      pickup_location: listing?.pickup_location || 'Farmgate Depot',
      payment: {
        payment_id: `pay-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: totalAmount,
        payment_method: 'UPI',
        payment_status: 'PENDING',
        transaction_id: null,
        paid_at: null
      }
    };

    const orders = getStored('orders', MOCK_ORDERS);
    orders.unshift(newOrder);
    setStored('orders', orders);

    // Create notification for farmer
    const notifs = getStored('notifications', MOCK_NOTIFICATIONS);
    notifs.unshift({
      notification_id: `notif-${Date.now()}`,
      user_id: newOrder.farmer_id,
      title: '🛒 New Order Received',
      message: `${newOrder.buyer_name} placed an order for ${newOrder.quantity} ${newOrder.unit} ${newOrder.product_name} (₹${newOrder.total_amount.toLocaleString('en-IN')}).`,
      is_read: false,
      created_at: new Date().toISOString(),
      type: 'NEW_ORDER',
      target_order_id: newOrder.order_id
    });
    setStored('notifications', notifs);

    return newOrder;
  },

  claimPayment: async (orderId, paymentMethod = 'UPI', transactionRef) => {
    await new Promise((res) => setTimeout(res, 400));
    const orders = getStored('orders', MOCK_ORDERS);
    const order = orders.find((o) => o.order_id === orderId);

    if (order) {
      order.status = 'PENDING_CONFIRMATION';
      order.payment = {
        ...order.payment,
        payment_method: paymentMethod,
        payment_status: 'CLAIMED',
        transaction_id: transactionRef || `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/CLAIMED`,
        claimed_at: new Date().toISOString()
      };
      setStored('orders', orders);

      // Create notification for farmer
      const notifs = getStored('notifications', MOCK_NOTIFICATIONS);
      notifs.unshift({
        notification_id: `notif-${Date.now()}`,
        user_id: order.farmer_id,
        title: '💰 Payment Claimed by Buyer!',
        message: `${order.buyer_name} claimed payment of ₹${order.total_amount.toLocaleString('en-IN')} via ${paymentMethod}. Please verify your bank app and confirm receipt.`,
        is_read: false,
        created_at: new Date().toISOString(),
        type: 'PAYMENT_CLAIMED',
        target_order_id: order.order_id
      });
      setStored('notifications', notifs);

      return order;
    }
    return null;
  },

  confirmReceipt: async (orderId, received = true) => {
    await new Promise((res) => setTimeout(res, 400));
    const orders = getStored('orders', MOCK_ORDERS);
    const order = orders.find((o) => o.order_id === orderId);

    if (order) {
      if (received) {
        order.status = 'CONFIRMED';
        order.payment.payment_status = 'PAID';
        order.payment.paid_at = new Date().toISOString();

        // Deduct quantity from listing
        const listings = getStored('listings', MOCK_LISTINGS);
        const listing = listings.find((l) => l.listing_id === order.listing_id);
        if (listing) {
          listing.available_stock = Math.max(0, listing.available_stock - order.quantity);
          if (listing.available_stock === 0) listing.status = 'SOLD';
          setStored('listings', listings);
        }
      } else {
        order.status = 'CANCELLED';
        order.payment.payment_status = 'REJECTED';
      }

      setStored('orders', orders);

      // Notify Buyer
      const notifs = getStored('notifications', MOCK_NOTIFICATIONS);
      notifs.unshift({
        notification_id: `notif-${Date.now()}`,
        user_id: order.buyer_id,
        title: received ? '✅ Payment Verified & Order Confirmed!' : '❌ Payment Receipt Rejected',
        message: received
          ? `Farmer ${order.farmer_name} verified your UPI payment of ₹${order.total_amount.toLocaleString('en-IN')}. Pickup ready at ${order.pickup_location}.`
          : `Farmer ${order.farmer_name} reported payment not received for Order #${order.order_id}.`,
        is_read: false,
        created_at: new Date().toISOString(),
        type: received ? 'ORDER_CONFIRMED' : 'ORDER_CANCELLED',
        target_order_id: order.order_id
      });
      setStored('notifications', notifs);

      return order;
    }
    return null;
  }
};

// Mock Price History & Products API
export const mockProductsApi = {
  getProducts: async () => {
    await new Promise((res) => setTimeout(res, 200));
    return getStored('products', MOCK_PRODUCTS);
  },
  createProduct: async (productData) => {
    await new Promise((res) => setTimeout(res, 200));
    const products = getStored('products', MOCK_PRODUCTS);
    const newProd = {
      product_id: `prod-${Date.now()}`,
      product_name: productData.product_name,
      category: productData.category || 'General',
      unit: productData.unit || 'Kg',
      description: productData.description || 'Farmer listed fresh product.',
      mandi_avg_price: Number(productData.mandi_avg_price) || 2000,
      mandi_min_price: Math.round((Number(productData.mandi_avg_price) || 2000) * 0.9),
      mandi_max_price: Math.round((Number(productData.mandi_avg_price) || 2000) * 1.1),
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
    };
    products.push(newProd);
    setStored('products', products);
    return newProd;
  }
};

export const mockPriceHistoryApi = {
  getPriceHistory: async (productId = 'prod-4') => {
    await new Promise((res) => setTimeout(res, 300));
    const histories = MOCK_PRICE_HISTORY;
    return histories[productId] || histories['prod-4'];
  }
};

export const mockNotificationsApi = {
  getMine: async (user) => {
    await new Promise((res) => setTimeout(res, 200));
    const notifs = getStored('notifications', MOCK_NOTIFICATIONS);
    if (!user) return notifs;
    return notifs.filter((n) => n.user_id === user.user_id || !n.user_id);
  },

  markAsRead: async (notifId) => {
    const notifs = getStored('notifications', MOCK_NOTIFICATIONS);
    const n = notifs.find((x) => x.notification_id === notifId);
    if (n) {
      n.is_read = true;
      setStored('notifications', notifs);
    }
    return notifs;
  }
};
