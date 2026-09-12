# 🌾 Agriसाथी — Farmer-Buyer Direct Market Platform

> **Smart India Hackathon (SIH) 2026 Submission**
> **Problem Statement**: Strengthening Market Linkages and Price Discovery for Farmers — Eliminating Multi-Intermediary Commission Cuts & Enabling Fair Transparent Trade.

---

## 🌟 Key Features

1. **Direct Farmer-Buyer Linkage (Zero Middlemen Cuts)**
   - Farmers publish produce listings directly with quality grade (Grade A+), pickup location, and preferred UPI ID.
   - Bulk buyers (Wholesalers, Retailers, Restaurants) browse and purchase directly.

2. **Inline Price-Discovery Engine (Recharts & APMC Mandi Data)**
   - As a farmer enters an asking price while creating a listing, real-time APMC Mandi price benchmarks are fetched and visualized inline.
   - Dynamic recommendation badges notify the farmer if their asking price is below, fair, or above market average.

3. **Instant UPI Direct Payment & Verifiable Stepper Flow**
   - Generates standard UPI Deep Links (`upi://pay?pa={upi_id}&pn={farmer_name}&am={amount}&cu=INR&tn=Order-{order_id}`).
   - Mobile Viewport: Direct **"Pay ₹{amount} via UPI App"** button (opens PhonePe / BHIM / Paytm / GPay).
   - Desktop Viewport: Live QR Code rendered with `qrcode.react`.
   - Buyer taps **"I've Sent Payment"** → status updates to PENDING VERIFICATION → Farmer verifies in bank app and taps **"Confirm Received"** (sets payment to PAID and order to CONFIRMED).

4. **SIH Hackathon Presentation Mode**
   - Top navigation bar includes a **1-click Role Switcher** ("🌾 Ramesh (Farmer)", "🛒 Vikram (Buyer)", "🛡️ APMC Admin") allowing evaluators to experience both sides of a live transaction instantly on stage.

5. **Standalone Offline Mock Layer & Real Backend Readiness**
   - Fully interactive standalone dev mode powered by client-side mock fixtures and local state persistence.
   - Centralized Axios client (`src/api/client.js`) ready to connect to any REST API by changing `VITE_API_BASE_URL`.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4 (Custom Agri-Tech Theme Palette: Crisp Whites, Forest Emerald `#166534`, Amber Accent `#D97706`)
- **Motion & Animations**: Framer Motion (`AnimatePresence`, Hover Lift, Count-up Stats)
- **Charts**: Recharts (Price history line & area charts)
- **HTTP Client**: Axios (`src/api/client.js`)
- **Forms & Validation**: React Hook Form + Zod
- **QR Codes**: `qrcode.react`
- **Notifications**: `react-hot-toast` + Custom Notification Bell
- **Icons**: Lucide React

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔗 Connecting to a Real Backend

By default, the application runs in dev/mock mode using `src/api/mockService.js`.

To connect to a live REST backend:

1. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
2. Ensure your backend implements the API endpoints specified in the API contract below.

---

## 📋 API Contract Reference

```http
POST   /auth/signup
POST   /auth/login
GET    /users/me

GET    /products
GET    /listings?product_id=&district=&min_price=&max_price=&status=AVAILABLE
POST   /listings              (Farmer listing creation)
GET    /listings/:id

POST   /orders                (Buyer creates order)
GET    /orders/mine           (Role-aware user orders)
GET    /orders/:id

POST   /orders/:id/claim-payment      (Buyer marks payment sent)
POST   /orders/:id/confirm-receipt    (Farmer confirms receipt: { received: true })

GET    /price-history?product_id=&location=
GET    /notifications/mine
PATCH  /notifications/:id/read
```

---

## 📁 Project Architecture

```
src/
  api/           -> Axios client & API resource services (client.js, mockService.js, listingsApi.js, etc.)
  components/    -> Reusable UI (Navbar, Footer, Button, Card, Modal, StatCounter, PriceComparisonBadge, StepperProgress, NotificationBell, SkeletonLoader)
  context/       -> AuthContext (user role & demo presets), NotificationContext
  hooks/         -> Custom React hooks (useAuth, useListings, useOrders, usePriceHistory, useNotifications)
  pages/         -> Route views (Landing, Login, Signup, FarmerDashboard, BuyerDashboard, OrderPayment, PriceDiscovery, Notifications, NotFound)
  utils/         -> Helper functions (buildUpiLink.js, formatCurrency.js, priceComparison.js, mockData.js)
  index.css      -> Tailwind imports and custom typography
```

---

## 🏆 SIH Judge Quick Guide

- **Step 1**: Click **"🌾 Ramesh (Farmer)"** on top bar -> Go to **Farmer Dashboard** -> Click **"Create Produce Listing"** -> Change asking price to see real-time Mandi price comparison chart!
- **Step 2**: Click **"🛒 Vikram (Buyer)"** on top bar -> Go to **Browse Produce** -> Select produce -> Click **"Buy Now"**.
- **Step 3**: View the generated UPI QR Code and deep link -> Click **"I've Sent Payment"**.
- **Step 4**: Switch back to **Farmer Mode** -> Go to **Incoming Orders** -> Click **"Confirm Received"** -> Enjoy celebration confetti 🎉!
