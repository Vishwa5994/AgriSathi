# SIH Project: Farmer-Buyer Direct Market Linkage Platform

**Title**: Multiple Intermediaries Reduce Farmers' Earnings and Increase Consumer Prices  
**Domain**: Agriculture / Farmer-to-Buyer Direct Linkage & Price Discovery  
**Tech Stack**: Node.js, Express.js, MySQL (`mysql2/promise`), JWT Authentication, bcrypt, dotenv

---

## Architecture Overview

This project provides a robust RESTful API backend designed for Smart India Hackathon (SIH). It eliminates middle-men by connecting farmers directly with buyers (wholesalers, retailers, restaurants, and consumers) for transparent produce trading and mandi price discovery.

### Key Architectural Standards
- **Zero Static/Seed Data**: Starts with a 100% empty schema. All records are created dynamically via real API calls.
- **Transactional Consistency**: Uses MySQL transactions (`connection.beginTransaction()`, `commit()`, `rollback()`) for multi-table operations.
- **Role-Based Access Control (RBAC)**: Protects endpoints using JWT tokens with `FARMER`, `BUYER`, and `ADMIN` role authorizations.
- **Automated Workflows & Notifications**: Controllers automatically manage status transitions (e.g. `listings.status` -> `SOLD`) and send notification records to users.

---

## Setup & Running Instructions

### 1. Database Setup
Create the MySQL database using the pure DDL schema script (no seed data included):
```bash
mysql -u root -p < db/schema.sql
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in your MySQL and JWT configuration:
```bash
cp .env.example .env
```
Sample `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=farmer_market_db
JWT_SECRET=super_secret_sih_key_2026
JWT_EXPIRES_IN=1d
```

### 3. Installation & Execution
```bash
npm install
npm run dev   # Node.js development server with nodemon
# OR
npm start     # Standard node startup
```

---

## End-to-End Core Business Workflows

1. **Transactional Registration (`POST /api/auth/register`)**:
   - `FARMER` / `BUYER` registration inserts the `users` record AND the corresponding `farmer_profiles` or `buyer_profiles` record in a single database transaction. If the profile fails, the user row is rolled back.
   - `ADMIN` registration creates the user row without a profile.

2. **Buyer Offer → Order Linkage (`PUT /api/buyer-offers/:id`)**:
   - Updating an offer's status to `ACCEPTED` executes a transaction that:
     - Updates `buyer_offers.status = 'ACCEPTED'`.
     - Automatically creates a new row in `orders` with `status = 'CONFIRMED'`.
     - Automatically updates `listings.status = 'SOLD'`.
     - Automatically notifies the Buyer.
   - Updating status to `REJECTED` notifies the buyer without creating an order.

3. **Listing Availability Enforcement**:
   - Orders/Offers can only be placed on listings with `status = 'AVAILABLE'`.
   - When an order is created or an offer accepted, listing status becomes `SOLD`.
   - If an order is `CANCELLED`, listing status reverts back to `AVAILABLE`.

4. **Automated Notifications**:
   - **Offer Placed**: Farmer (listing owner) is notified.
   - **Offer Accepted/Rejected**: Buyer is notified.
   - **Order Placed**: Farmer is notified.
   - **Payment marked as PAID**: Farmer is notified.
   - **Delivery status changed**: Buyer is notified.

---

## Comprehensive API Documentation

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Transactional user + profile signup (`FARMER`, `BUYER`, `ADMIN`) |
| `POST` | `/api/auth/login` | Public | Authenticates credentials & issues JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated profile |
| `POST` | `/api/auth/logout` | Authenticated | User logout endpoint |

---

### 👤 Users Management (`/api/users`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | `ADMIN` | List all users |
| `GET` | `/api/users/:id` | Authenticated | Get user by ID |
| `PUT` | `/api/users/:id` | Authenticated | Update user details |
| `DELETE` | `/api/users/:id` | `ADMIN` | Delete user |

---

### 🌾 Farmer Profiles (`/api/farmer-profiles`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/farmer-profiles` | Authenticated | List all farmer profiles |
| `GET` | `/api/farmer-profiles/:id` | Authenticated | Get farmer profile by ID |
| `POST` | `/api/farmer-profiles` | `FARMER`, `ADMIN` | Create farmer profile |
| `PUT` | `/api/farmer-profiles/:id` | `FARMER`, `ADMIN` | Update farmer profile |
| `DELETE` | `/api/farmer-profiles/:id` | `ADMIN` | Delete farmer profile |

---

### 🛒 Buyer Profiles (`/api/buyer-profiles`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/buyer-profiles` | Authenticated | List all buyer profiles |
| `GET` | `/api/buyer-profiles/:id` | Authenticated | Get buyer profile by ID |
| `POST` | `/api/buyer-profiles` | `BUYER`, `ADMIN` | Create buyer profile |
| `PUT` | `/api/buyer-profiles/:id` | `BUYER`, `ADMIN` | Update buyer profile |
| `DELETE` | `/api/buyer-profiles/:id` | `ADMIN` | Delete buyer profile |

---

### 🍎 Products (`/api/products`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List all agricultural products |
| `GET` | `/api/products/:id` | Public | Get product details |
| `POST` | `/api/products` | `ADMIN`, `FARMER` | Add new produce item |
| `PUT` | `/api/products/:id` | `ADMIN` | Update product info |
| `DELETE` | `/api/products/:id` | `ADMIN` | Delete product |

---

### 📦 Produce Listings (`/api/listings`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/listings` | Public | Browse produce listings (Filters: `product_id`, `status`, `location`, `limit`, `offset`) |
| `GET` | `/api/listings/farmer/:farmer_id` | Public | Get listings created by specific farmer |
| `GET` | `/api/listings/:id` | Public | Get listing details |
| `POST` | `/api/listings` | `FARMER`, `ADMIN` | Create new produce listing |
| `PUT` | `/api/listings/:id` | `FARMER`, `ADMIN` | Update listing details |
| `DELETE` | `/api/listings/:id` | `FARMER`, `ADMIN` | Delete listing |

---

### 🤝 Buyer Offers (`/api/buyer-offers`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/buyer-offers` | Authenticated | List all buyer offers |
| `GET` | `/api/buyer-offers/listing/:listing_id` | Authenticated | List offers for a listing |
| `GET` | `/api/buyer-offers/buyer/:buyer_id` | Authenticated | List offers placed by buyer |
| `GET` | `/api/buyer-offers/:id` | Authenticated | Get offer details |
| `POST` | `/api/buyer-offers` | `BUYER`, `ADMIN` | Submit offer (notifies farmer) |
| `PUT` | `/api/buyer-offers/:id` | Authenticated | Accept/Reject offer (`ACCEPTED` auto-creates order & marks listing `SOLD`) |
| `DELETE` | `/api/buyer-offers/:id` | `BUYER`, `ADMIN` | Delete offer |

---

### 🛍️ Orders (`/api/orders`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/orders` | Authenticated | List orders (Filters: `buyer_id`, `farmer_id`, `status`, `limit`, `offset`) |
| `GET` | `/api/orders/:id` | Authenticated | Get order details |
| `POST` | `/api/orders` | `BUYER`, `ADMIN` | Direct order placement (notifies farmer & marks listing `SOLD`) |
| `PUT` | `/api/orders/:id/status` | Authenticated | Update order status (`CONFIRMED`, `CANCELLED`) |
| `DELETE` | `/api/orders/:id` | `ADMIN` | Delete order |

---

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments` | Authenticated | List all payments |
| `GET` | `/api/payments/order/:order_id` | Authenticated | List payments for an order |
| `GET` | `/api/payments/:id` | Authenticated | Get payment details |
| `POST` | `/api/payments` | Authenticated | Record payment (`PAID` status notifies farmer) |
| `PUT` | `/api/payments/:id/status` | Authenticated | Update payment status (`PAID` triggers notification) |
| `DELETE` | `/api/payments/:id` | `ADMIN` | Delete payment record |

---

### 📈 Mandi Price History (`/api/price-history`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/price-history` | Public | Price discovery data (Filters: `product_id`, `market_name`, `from_date`, `to_date`, `limit`, `offset`) |
| `GET` | `/api/price-history/product/:product_id` | Public | Get historical prices for a product |
| `GET` | `/api/price-history/:id` | Public | Get single price record |
| `POST` | `/api/price-history` | `ADMIN` | Record historical mandi price |
| `PUT` | `/api/price-history/:id` | `ADMIN` | Update price record |
| `DELETE` | `/api/price-history/:id` | `ADMIN` | Delete price record |

---

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | `ADMIN` | View all platform notifications |
| `GET` | `/api/notifications/my` | Authenticated | View logged-in user's notifications |
| `GET` | `/api/notifications/user/:user_id` | Authenticated | View specific user notifications |
| `PUT` | `/api/notifications/:id/read` | Authenticated | Mark notification as read |
| `DELETE` | `/api/notifications/:id` | Authenticated | Delete notification |

---

### ⭐ Reviews & Ratings (`/api/reviews`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reviews` | Public | List all reviews |
| `GET` | `/api/reviews/order/:order_id` | Public | Get reviews for an order |
| `GET` | `/api/reviews/user/:reviewee_id` | Public | Get reviews received by a user |
| `POST` | `/api/reviews` | `BUYER`, `ADMIN` | Post rating (1-5) & feedback comment |
| `PUT` | `/api/reviews/:id` | Authenticated | Update review |
| `DELETE` | `/api/reviews/:id` | `ADMIN` | Delete review |

---

### 🚚 Logistics & Delivery (`/api/delivery`)
| Method | Endpoint | Role Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/delivery` | Authenticated | List all delivery shipments |
| `GET` | `/api/delivery/order/:order_id` | Authenticated | Get delivery info for an order |
| `POST` | `/api/delivery` | Authenticated | Create delivery logistics record |
| `PUT` | `/api/delivery/:id/status` | Authenticated | Update delivery status (`IN_TRANSIT`, `DELIVERED` notifies buyer) |
| `DELETE` | `/api/delivery/:id` | `ADMIN` | Delete delivery record |
