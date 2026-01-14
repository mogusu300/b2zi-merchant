# B2Zi Marketplace - Complete System Interaction Map

**Document Type**: Codebase Architecture Analysis  
**Date**: January 2025  
**Focus**: Frontend → Backend → Database flows for Merchants and Customers  
**Scope**: NO implementation changes (Discovery only)

---

## 1. SYSTEM OVERVIEW

**B2Zi** is a two-sided marketplace platform (Merchant + Customer) built on:
- **Frontend**: React 19 + Next.js 16 (App Router, Turbopack)
- **Backend**: Node.js API Routes (serverless)
- **Database**: PostgreSQL via Prisma 5.8 ORM
- **Auth**: Custom JWT-based authentication with bcryptjs password hashing

### Core Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                 │
│  ├─ Merchant Portal (/sellers/*)                           │
│  ├─ Customer Portal (/customers/*, /marketplace)            │
│  └─ Admin Dashboard (/admin) [SEPARATE DEPLOYMENT]         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST + localStorage
┌────────────────────────▼────────────────────────────────────┐
│              BACKEND API (/api/*)                           │
│  ├─ Authentication (login, logout, session)                │
│  ├─ Merchant Operations (products, orders, stats)          │
│  ├─ Customer Operations (orders, browse products)          │
│  └─ Shared (products catalog, orders)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────────┐
│           DATABASE (PostgreSQL via Neon)                    │
│  ├─ Merchant [id, email, password, status, ...]            │
│  ├─ Customer [id, email, password, ...]                    │
│  ├─ Product [id, sellerId, name, price, stock, variants]   │
│  ├─ Order [id, customerId, items, total, status]           │
│  ├─ OrderItem [id, orderId, productId, quantity, price]    │
│  ├─ Session [id, token, userId, type, expiresAt]           │
│  └─ ProductVariant[Group] [attributes, SKU, stock]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. MODULE MAP

### 2.1 Frontend Modules

#### Authentication Layer (`/hooks/use-auth.ts`, `/lib/auth-utils.ts`)
- **login(email, password, type)**: POST to `/api/{merchant|customers}/login`, stores token in cookie + localStorage
- **logout()**: POST to logout endpoint, clears localStorage (`b2zi_merchant`, `b2zi_user`, `auth-token-backup`)
- **getSession()**: GET `/api/auth/session`, verifies token validity
- **Error handling**: Checks `response.ok && data.success` (catches both HTTP and API errors)

#### Merchant UI Components
- **`/app/sellers/login/page.tsx`**: Login form → `useAuth.login()` → dashboard redirect (via `loginSuccess` state)
- **`/app/sellers/dashboard/layout.tsx`**: Checks localStorage `b2zi_merchant`, redirects to login if missing
- **`/app/sellers/dashboard/page.tsx`**: Renders stats (revenue, orders, products, views)
- **`/app/sellers/dashboard/products/page.tsx`**: CRUD operations for products (add, edit, delete)
- **`/app/sellers/orders/page.tsx`**: View orders containing seller's products, update status

#### Customer UI Components
- **`/app/customers/login/page.tsx`**: Login form → `useAuth.login()` → marketplace redirect
- **`/app/customers/register/page.tsx`**: Registration → creates Customer record → auto-login
- **`/app/marketplace/page.tsx`** + **`/components/marketplace/Marketplace.tsx`**: 
  - Fetches products from `/api/products`
  - Local state for cart (saved to localStorage `b2zi_cart`)
  - Product search/filter/sort
  - Product detail modal
- **`/components/marketplace/CartSidebar.tsx`**: Display cart items, total calculation, checkout link
- **`/app/customers/checkout/page.tsx`**: 
  - Form: shipping address, payment (test card pre-filled)
  - Calculates: subtotal + $10 shipping + 8% tax
  - Creates order via POST `/api/orders`
  - Clears cart on success
- **`/app/customers/orders/page.tsx`**: Fetch orders via `/api/orders?customerId=...`, display list + expandable details

#### Session/Preferences Hooks (`/hooks/use-session.ts`)
- `useUserSession()`: Returns logged-in user info
- `useMarketplacePreferences()`: Category/sort filters (localStorage)
- `useFavorites()`: Wishlist toggle
- `useSearchHistory()`: Track searches
- `useViewedProducts()`: Track viewed products
- `useActivityTracking()`: Track user actions

### 2.2 Backend API Routes

#### Authentication Endpoints
| Route | Method | Input | Output | Business Logic |
|-------|--------|-------|--------|-----------------|
| `/api/merchant/login` | POST | `{email, password}` | `{success, user, token}` | Find merchant → verify password → create JWT + session → set httpOnly cookie |
| `/api/customers/login` | POST | `{email, password}` | `{success, user, token}` | Find customer → verify password → create JWT + session → set httpOnly cookie |
| `/api/auth/session` | GET | — | `{authenticated, user, session}` | Verify cookie token → check session → return payload |
| `/api/merchant/logout` | POST | — | `{success}` | Delete session record → clear cookie |
| `/api/customers/logout` | POST | — | `{success}` | Delete session record → clear cookie |

#### Product Endpoints
| Route | Method | Input | Output | Business Logic |
|-------|--------|-------|--------|-----------------|
| `/api/products` | GET | `?category=X&search=Y` | `[{id, name, price, seller, variants, ...}]` | Prisma query with filters → include seller info + variants + active check |
| `/api/products` | POST | `{name, description, price, category, images, sellerId, variants}` | `{id, ...product}` | Create product + variant groups + variants → validate stock |
| `/api/products/[id]` | GET | — | `{id, name, ..., variants}` | Fetch single product + all its variants |
| `/api/products/[id]` | PUT | `{name, description, price, ...}` | `{id, ...updated}` | Update product fields + variant prices/stock |
| `/api/products/[id]` | DELETE | — | `{success}` | Soft or hard delete product |

#### Order Endpoints
| Route | Method | Input | Output | Business Logic |
|-------|--------|-------|--------|-----------------|
| `/api/orders` | GET | `?customerId=X` | `[{id, items[], total, status, ...}]` | Fetch customer's orders with items + products |
| `/api/orders` | POST | `{customerId, items[], total, customerName, ..., deliveryAddress, ...}` | `{id, items[], ...}` | Create order → create OrderItems for each item → store variant snapshot |
| `/api/orders/[id]` | DELETE | — | `{success}` | Delete order (order placement only, no cancel logic yet) |

#### Merchant-Specific Endpoints
| Route | Method | Input | Output | Business Logic |
|-------|--------|-------|--------|-----------------|
| `/api/merchants` | GET | — | `[{id, businessName, email, status, ...}]` | List all merchants (used by admin) |
| `/api/merchants/[id]/products` | GET | — | `[products]` | Fetch merchant's products |
| `/api/merchants/[id]/orders` | GET | — | `[orders]` | Fetch orders containing merchant's products |
| `/api/merchants/[id]/stats` | GET | — | `{revenue, orders, products, views}` | Calculate merchant dashboard stats |

#### Customer-Specific Endpoints
| Route | Method | Input | Output | Business Logic |
|-------|--------|-------|--------|-----------------|
| `/api/customers/register` | POST | `{email, name, password, phone}` | `{success, user}` | Hash password → create Customer → return user |
| `/api/customers/[id]/orders` | GET | — | `[orders]` | Fetch customer's order history |

#### Other Endpoints
| Route | Method | Input | Output | Business Logic |
|-------|--------|-------|--------|-----------------|
| `/api/upload` | POST | `FormData: file` | `{url, filename}` | Upload image to cloud storage |

### 2.3 Library/Utility Modules

#### Authentication Utilities (`/lib/auth-utils.ts`)
```typescript
hashPassword(password)           // bcryptjs.hash(password, 10 rounds)
comparePassword(plain, hash)     // bcryptjs.compare()
createToken(payload)             // jwt.sign(payload, JWT_SECRET, 7-day expiry)
verifyToken(token)               // jwt.verify(token, JWT_SECRET)
createSession(userId, type, token, ip, ua)  // Store session in database
getSession(token)                // Fetch session record
handleSuccessfulLogin(userId, type)  // Update lastLogin timestamp, reset loginAttempts
```

#### Prisma Client (`/lib/prisma.ts`)
- Singleton Prisma instance (prevents multiple instances in development)
- Used by all API routes for database queries

#### Session Storage (`/lib/session-storage.ts`)
- localStorage key management
- `b2zi_merchant`: Merchant session object
- `b2zi_user`: Customer session object
- `b2zi_cart`: Cart items array
- `auth-token-backup`: JWT token backup (for redundancy)

---

## 3. ROUTE MAP

### 3.1 Public Routes (No Auth Required)

#### Merchant Onboarding
- **`GET /`**: Home page
- **`GET /register`**: Merchant registration form
- **`POST /api/register`**: Submit registration → create Merchant with status="pending"
- **`GET /sellers/login`**: Merchant login form
- **`POST /api/merchant/login`**: Authenticate merchant

#### Customer Onboarding
- **`GET /customers/register`**: Customer registration form
- **`POST /api/customers/register`**: Submit registration → create Customer
- **`GET /customers/login`**: Customer login form
- **`POST /api/customers/login`**: Authenticate customer
- **`GET /marketplace`**: Browse products (public view, no auth required for browsing)
- **`POST /api/products`**: Get product list (used by both authenticated and unauthenticated users)

#### Session Management
- **`GET /api/auth/session`**: Check current session (used by both roles)

### 3.2 Authenticated Routes - Merchant/Seller

#### Login Required
- **`GET /sellers/dashboard`** ← checks localStorage `b2zi_merchant`
- **`GET /sellers/dashboard/products`** ← CRUD products
- **`GET /sellers/dashboard/orders`** ← View orders
- **`GET /sellers/dashboard/customers`** ← Customer management
- **`GET /sellers/dashboard/analytics`** ← Analytics/stats
- **`GET /sellers/dashboard/settings`** ← Store settings

#### Protected API
- **`GET /api/merchants`**: List merchants (admin use)
- **`PUT /api/merchant`**: Update merchant profile
- **`POST /api/merchant/logout`**: Logout merchant
- **`GET /api/merchants/[id]/products`**: Fetch merchant's products
- **`GET /api/merchants/[id]/orders`**: Fetch merchant's orders
- **`GET /api/merchants/[id]/stats`**: Dashboard stats

### 3.3 Authenticated Routes - Customer

#### Login Required
- **`GET /marketplace`** ← Browse products (with cart)
- **`GET /customers/checkout`** ← Checkout form
- **`GET /customers/orders`** ← Order history

#### Protected API
- **`GET /api/orders?customerId=X`**: Fetch customer's orders
- **`POST /api/orders`**: Create new order
- **`POST /api/customers/logout`**: Logout customer

### 3.4 Admin Routes

- **`GET /admin`**: Admin dashboard (lists merchants, statuses)
- Admin functionality deployed separately (not shown in frontend here)

---

## 4. DATABASE MODEL MAP

### 4.1 Core Tables & Relationships

```
┌─────────────────────────────────────────────────────────────┐
│ MERCHANT                                                    │
├─────────────────────────────────────────────────────────────┤
│ id (cuid, PK)                                              │
│ email (unique)                                             │
│ password (bcrypt hash)                                     │
│ businessName                                               │
│ ownerName                                                  │
│ phone                                                      │
│ businessType                                               │
│ businessAddress                                            │
│ idType (nrc | passport)                                    │
│ idFrontUrl, idBackUrl (file uploads)                       │
│ status (pending | approved | rejected)                     │
│ isVerified (boolean)                                       │
│ lastLogin, loginAttempts, lockedUntil                      │
│ createdAt, updatedAt                                       │
│                                                            │
│ RELATIONSHIPS:                                              │
│ ←─ Product.sellerId (1:M)                                  │
│ ←─ Session.merchantId (1:M)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER                                                    │
├─────────────────────────────────────────────────────────────┤
│ id (cuid, PK)                                              │
│ email (unique)                                             │
│ password (bcrypt hash)                                     │
│ name                                                       │
│ phone                                                      │
│ isVerified (boolean)                                       │
│ lastLogin, loginAttempts, lockedUntil                      │
│ createdAt, updatedAt                                       │
│                                                            │
│ RELATIONSHIPS:                                              │
│ ←─ Order.customerId (1:M)                                  │
│ ←─ Session.customerId (1:M)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SESSION                                                     │
├─────────────────────────────────────────────────────────────┤
│ id (cuid, PK)                                              │
│ token (unique) - JWT value                                 │
│ type (merchant | customer)                                 │
│ userId (generic ID field)                                  │
│ merchantId (FK) → Merchant.id (nullable)                   │
│ customerId (FK) → Customer.id (nullable)                   │
│ ipAddress, userAgent (audit trail)                         │
│ expiresAt (7 days from creation)                           │
│ createdAt                                                  │
│                                                            │
│ INDEXES:                                                    │
│ - token, userId, merchantId, customerId, expiresAt         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PRODUCT                                                     │
├─────────────────────────────────────────────────────────────┤
│ id (cuid, PK)                                              │
│ sellerId (FK) → Merchant.id                                │
│ name, description                                          │
│ price (base price, can be overridden by variants)          │
│ category                                                   │
│ images (array of URLs)                                     │
│ colorVariants, typeVariants (JSON - legacy format)         │
│ inStock (boolean)                                          │
│ totalStock (int - cached total across variants)            │
│ rating, reviews (float, int)                               │
│ createdAt, updatedAt                                       │
│                                                            │
│ RELATIONSHIPS:                                              │
│ → Merchant.id (M:1, cascade delete)                        │
│ ←─ ProductVariant.productId (1:M)                          │
│ ←─ ProductVariantGroup.productId (1:M)                     │
│ ←─ OrderItem.productId (1:M)                               │
│                                                            │
│ INDEXES:                                                    │
│ - sellerId, category                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PRODUCTVARIANTGROUP                                         │
├─────────────────────────────────────────────────────────────┤
│ id (cuid, PK)                                              │
│ productId (FK) → Product.id                                │
│ name (e.g., "Color", "Size", "Material")                   │
│ values (string array: ["Red", "Blue", "Green"])            │
│ createdAt, updatedAt                                       │
│                                                            │
│ CONSTRAINT: UNIQUE(productId, name)                        │
│ INDEXES: productId                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PRODUCTVARIANT                                              │
├─────────────────────────────────────────────────────────────┤
│ id (cuid, PK)                                              │
│ productId (FK) → Product.id                                │
│ attributes (JSON) - {color: "Red", size: "M", ...}         │
│ sku (string, optional - SKU for inventory tracking)        │
│ price (float, optional - inherits from product if null)    │
│ stock, reserved (inventory tracking)                       │
│ images (array of variant-specific images)                  │
│ weight (grams), dimensions (JSON: {l, w, h} in cm)         │
│ active (boolean - soft delete via flag)                    │
│ createdAt, updatedAt                                       │
│                                                            │
│ CONSTRAINT: UNIQUE(productId, sku)                         │
│ INDEXES: productId                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ORDER                                                       │
├─────────────────────────────────────────────────────────────┤
│ id (cuid, PK)                                              │
│ customerId (FK) → Customer.id                              │
│ total (float - total price)                                │
│ status (pending | processing | shipped | delivered |       │
│         cancelled) [default: pending]                      │
│                                                            │
│ DELIVERY INFO:                                              │
│ deliveryAddress, deliveryCity, deliveryState, ..Code       │
│ trackingNumber, estimatedDelivery (audit fields)           │
│                                                            │
│ CUSTOMER CONTACT (snapshot at order time):                 │
│ customerName, customerEmail, customerPhone                 │
│ customerWhatsApp (optional)                                │
│                                                            │
│ RELATIONSHIPS:                                              │
│ → Customer.id (M:1, cascade delete)                        │
│ ←─ OrderItem.orderId (1:M)                                 │
│                                                            │
│ INDEXES: customerId                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ORDERITEM                                                   │
├─────────────────────────────────────────────────────────────┤
│ id (cuid, PK)                                              │
│ orderId (FK) → Order.id                                    │
│ productId (FK) → Product.id                                │
│ variantId (FK, optional) → ProductVariant.id               │
│ variantData (JSON snapshot - {color: "Red", size: "M"})    │
│ quantity (int)                                             │
│ price (float - price at time of order)                     │
│ sku (string snapshot)                                      │
│                                                            │
│ RELATIONSHIPS:                                              │
│ → Order.id (M:1, cascade delete)                           │
│ → Product.id (M:1, no cascade)                             │
│                                                            │
│ INDEXES: orderId, productId                                │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Data Relationships Summary

| Source → Target | Type | Cascade | Purpose |
|-----------------|------|---------|---------|
| Merchant → Product | 1:M | DELETE | Seller owns products |
| Merchant ← Session | 1:M | DELETE | Track merchant sessions |
| Customer → Order | 1:M | DELETE | Customer owns orders |
| Customer ← Session | 1:M | DELETE | Track customer sessions |
| Product → ProductVariant | 1:M | DELETE | Product has variants (sizes/colors) |
| Product → ProductVariantGroup | 1:M | DELETE | Product has variant groups (taxonomy) |
| Order → OrderItem | 1:M | DELETE | Order contains items |
| OrderItem → Product | M:1 | None | Link to product info (audit only) |

---

## 5. DATA FLOW SUMMARY

### 5.1 Merchant Registration & Login Flow

```
┌─ MERCHANT REGISTER ─────────────────────────────────────────┐
│                                                             │
│ 1. GET /register → display form                            │
│    (businessName, ownerName, email, password, id docs)    │
│                                                             │
│ 2. POST /api/register                                       │
│    → validate email format + password strength             │
│    → hashPassword(password) using bcryptjs                 │
│    → INSERT INTO Merchant (status='pending')               │
│    ← return {success, merchantId}                          │
│                                                             │
│ 3. Merchant awaits admin approval (separate system)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ MERCHANT LOGIN ────────────────────────────────────────────┐
│                                                             │
│ 1. GET /sellers/login → display form                       │
│    (email, password)                                        │
│                                                             │
│ 2. POST /api/merchant/login                                 │
│    → SELECT FROM Merchant WHERE email                      │
│    → comparePassword(password, merchant.password)          │
│    → if fail: return {success: false, error}               │
│    → UPDATE Merchant SET lastLogin=NOW, loginAttempts=0    │
│    → token = createToken({id, email, type:'merchant'})     │
│    → INSERT INTO Session (token, merchantId, type, ...)    │
│    ← return {success, user, token}                         │
│    ← SET Cookie(auth-token = token, httpOnly)              │
│                                                             │
│ 3. Frontend stores in localStorage:                         │
│    - b2zi_merchant = {id, email, businessName, ...}        │
│    - auth-token-backup = token                             │
│                                                             │
│ 4. useRouter.push('/sellers/dashboard')                    │
│    Dashboard layout checks localStorage.b2zi_merchant      │
│    If present: render dashboard; if missing: redirect       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Customer Registration & Login Flow

```
┌─ CUSTOMER REGISTER ─────────────────────────────────────────┐
│                                                             │
│ 1. GET /customers/register → display form                  │
│    (name, email, password, phone)                          │
│                                                             │
│ 2. POST /api/customers/register                            │
│    → validate email + password strength                    │
│    → CHECK IF EXISTS: SELECT FROM Customer WHERE email     │
│    → if exists: return {error: 'already registered'}       │
│    → hashedPassword = hashPassword(password)               │
│    → INSERT INTO Customer (password=hash)                  │
│    ← return {success, user}                                │
│                                                             │
│ 3. Frontend auto-login:                                     │
│    → call login(email, password, 'customer')               │
│    → same flow as customer login below                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ CUSTOMER LOGIN ────────────────────────────────────────────┐
│                                                             │
│ 1. GET /customers/login → display form                     │
│    (email, password)                                        │
│                                                             │
│ 2. POST /api/customers/login                               │
│    → SELECT FROM Customer WHERE email                      │
│    → comparePassword(password, customer.password)          │
│    → if fail: return {success: false, error}               │
│    → UPDATE Customer SET lastLogin=NOW, loginAttempts=0    │
│    → token = createToken({id, email, type:'customer'})     │
│    → INSERT INTO Session (token, customerId, type, ...)    │
│    ← return {success, user, token}                         │
│    ← SET Cookie(auth-token = token, httpOnly)              │
│                                                             │
│ 3. Frontend stores in localStorage:                         │
│    - b2zi_user = {id, email, name, ...}                    │
│    - auth-token-backup = token                             │
│                                                             │
│ 4. useRouter.push('/marketplace')                          │
│    Marketplace renders (checks if localStorage exists)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Product Browsing Flow

```
┌─ CUSTOMER BROWSE MARKETPLACE ──────────────────────────────┐
│                                                             │
│ 1. GET /marketplace                                         │
│    → Marketplace component loads                            │
│                                                             │
│ 2. useEffect() → fetch('/api/products')                    │
│    → GET /api/products [optional: ?category=X&search=Y]    │
│    → DATABASE QUERY:                                        │
│      SELECT Product WHERE (category match | search match)  │
│      INCLUDE seller: {id, businessName, ownerName}         │
│      INCLUDE variantGroups (for variant UI)                │
│      INCLUDE variants WHERE active=true                    │
│      ORDER BY createdAt DESC                               │
│    ← return [{id, name, price, seller, variants, ...}]     │
│                                                             │
│ 3. Frontend renders:                                        │
│    - ProductCard for each product                          │
│    - Search/filter inputs (state-managed)                  │
│    - CartSidebar (cart items from localStorage)            │
│                                                             │
│ 4. Customer clicks product → ProductDetail modal shows:     │
│    - Name, description, price, images                      │
│    - Variant options (color, size, etc.)                   │
│    - Stock status                                          │
│    - Add to cart button                                    │
│                                                             │
│ 5. Click "Add to Cart":                                     │
│    → Add item to cartItems state                           │
│    → Save to localStorage: b2zi_cart = [...]               │
│    → Close modal                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Checkout & Order Creation Flow

```
┌─ CUSTOMER CHECKOUT ─────────────────────────────────────────┐
│                                                             │
│ 1. Click "Proceed to Checkout" in CartSidebar              │
│    → router.push('/customers/checkout')                    │
│                                                             │
│ 2. GET /customers/checkout                                 │
│    → Load cart from localStorage: b2zi_cart                │
│    → Load customer from localStorage: b2zi_user            │
│    → Pre-fill email, name                                  │
│    → Display order summary (items + total)                 │
│    → Display form:                                          │
│      * Shipping: address, city, state, zipCode             │
│      * Contact: phone, WhatsApp (optional)                 │
│      * Payment: card number, expiry, CVC (test card)       │
│                                                             │
│ 3. Customer fills form + clicks "Place Order"              │
│    → handleSubmit() fires                                  │
│                                                             │
│ 4. POST /api/orders                                         │
│    Body: {                                                  │
│      customerId,                                           │
│      items: [                                              │
│        {productId, quantity, selectedColor, selectedType,   │
│         price}                                             │
│      ],                                                     │
│      total,                                                │
│      customerName, customerEmail, customerPhone,           │
│      customerWhatsApp,                                     │
│      deliveryAddress, deliveryCity, deliveryState,         │
│      deliveryZipCode                                       │
│    }                                                        │
│                                                             │
│ 5. Backend: CREATE ORDER                                    │
│    → BEGIN TRANSACTION                                     │
│    → INSERT INTO Order (                                    │
│        customerId, total, status='pending',                │
│        customerName, customerEmail, customerPhone,         │
│        customerWhatsApp,                                   │
│        deliveryAddress, deliveryCity, deliveryState,       │
│        deliveryZipCode                                     │
│      )                                                      │
│    → FOR EACH item in items:                               │
│        INSERT INTO OrderItem (                              │
│          orderId, productId, quantity,                     │
│          variantData: {selectedColor, selectedType},       │
│          price, sku                                        │
│        )                                                    │
│    → COMMIT TRANSACTION                                    │
│    ← return {id, items[], total, status}                   │
│                                                             │
│ 6. Frontend: Order Success                                 │
│    → setSuccess(true)                                      │
│    → Display "Order Placed!" message                       │
│    → localStorage.removeItem('b2zi_cart')                  │
│    → Wait 2 seconds                                        │
│    → router.push('/customers/orders?orderid=...')          │
│                                                             │
│ 7. GET /customers/orders                                   │
│    → Fetch all orders: GET /api/orders?customerId=X        │
│    → Display order list with status badges                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Seller/Merchant Product Management Flow

```
┌─ MERCHANT VIEW PRODUCTS ────────────────────────────────────┐
│                                                             │
│ 1. Logged-in merchant visits /sellers/dashboard/products    │
│    → Dashboard layout checks localStorage.b2zi_merchant     │
│    → If missing: router.replace('/sellers/login')          │
│    → If present: render products page                      │
│                                                             │
│ 2. GET /api/products (frontend)                            │
│    → Fetch all products                                    │
│    → Frontend filters: products WHERE sellerId =           │
│      localStorage.b2zi_merchant.id                         │
│                                                             │
│ 3. Display product list + action buttons:                   │
│    - Edit product                                          │
│    - Delete product                                        │
│    - Add new product                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ MERCHANT ADD PRODUCT ──────────────────────────────────────┐
│                                                             │
│ 1. Click "Add Product" → display form                      │
│    (name, description, price, category, images,            │
│     variant groups + variants)                             │
│                                                             │
│ 2. POST /api/products                                       │
│    Body: {                                                  │
│      name, description, price, category, images,           │
│      sellerId: localStorage.b2zi_merchant.id,              │
│      variantGroups: [{name: "Color", values: [...]}],      │
│      variants: [{attributes: {color: "Red"}, price, ...}]  │
│    }                                                        │
│                                                             │
│ 3. Backend:                                                 │
│    → INSERT INTO Product (...)                             │
│    → FOR EACH variantGroup:                                │
│        INSERT INTO ProductVariantGroup                     │
│    → FOR EACH variant:                                     │
│        INSERT INTO ProductVariant                          │
│    ← return {id, ...}                                       │
│                                                             │
│ 4. Frontend redirects to products list                     │
│    New product immediately visible                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ MERCHANT EDIT PRODUCT ─────────────────────────────────────┐
│                                                             │
│ 1. Click "Edit" on product → load form                     │
│    → GET /api/products/[id]                                │
│    ← return {id, name, price, ..., variants}               │
│    → pre-fill form with existing data                      │
│                                                             │
│ 2. Customer changes fields + clicks "Save"                 │
│                                                             │
│ 3. PUT /api/products/[id]                                  │
│    Body: {name, description, price, ..., variants}         │
│                                                             │
│ 4. Backend:                                                 │
│    → UPDATE Product SET (...)                              │
│    → DELETE existing ProductVariants                       │
│    → INSERT new ProductVariants                            │
│    ← return {id, ...updated}                               │
│                                                             │
│ 5. Frontend: Product list updates                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ MERCHANT DELETE PRODUCT ───────────────────────────────────┐
│                                                             │
│ 1. Click "Delete" → confirm dialog                         │
│                                                             │
│ 2. DELETE /api/products/[id]                               │
│    → Soft delete: UPDATE Product SET active=false          │
│       OR Hard delete: DELETE FROM Product WHERE id         │
│       (Depends on implementation - unclear)                │
│    ← return {success}                                       │
│                                                             │
│ 3. Frontend: Product removed from list                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.6 Seller/Merchant Order Management Flow

```
┌─ MERCHANT VIEW ORDERS ──────────────────────────────────────┐
│                                                             │
│ 1. Merchant visits /sellers/orders                         │
│    → Dashboard layout checks localStorage.b2zi_merchant     │
│    → if missing: redirect to login                         │
│                                                             │
│ 2. GET /api/orders (global endpoint)                       │
│    → Fetch ALL orders from database                        │
│    → Frontend filters: orders WHERE items[].product         │
│      .sellerId === localStorage.b2zi_merchant.id           │
│                                                             │
│ 3. Display orders:                                          │
│    - Customer name, email, phone                           │
│    - Delivery address                                      │
│    - Order items (products sold by this merchant)          │
│    - Order status (pending, processing, shipped, etc.)     │
│    - Status dropdown to update                             │
│                                                             │
│ 4. Click status dropdown → select new status               │
│    (Implementation: unclear if this triggers API call)     │
│                                                             │
│ 5. UNCLEAR: How does status update work?                   │
│    - No PUT /api/orders/[id] endpoint defined              │
│    - Status change logic may be missing                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.7 Authentication Session Management

```
┌─ SESSION VALIDATION (Middleware + Layout) ──────────────────┐
│                                                             │
│ 1. Every protected page load:                              │
│    → middleware.ts checks pathname                         │
│    → if dashboard route: middleware allows → layout checks  │
│    → layout: checks localStorage for merchant/user data     │
│    → if missing: router.replace('/login')                  │
│                                                             │
│ 2. Every API call (optional):                              │
│    → GET /api/auth/session (client-initiated)              │
│    → Backend reads: request.cookies.get('auth-token')      │
│    → verifyToken(token) - check JWT signature              │
│    → getSession(token) - check database session exists      │
│    → if session.expiresAt < now(): delete session          │
│    ← return {authenticated, user, session}                 │
│                                                             │
│ 3. Logout:                                                  │
│    → POST /api/{merchant|customers}/logout                 │
│    → Backend: DELETE FROM Session WHERE token              │
│    → response.cookies.set('auth-token', '', {maxAge: 0})   │
│    → Frontend: localStorage.clear() [all b2zi_* keys]      │
│    → router.replace('/')                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. RED FLAGS & TECHNICAL DEBT

### 6.1 Critical Issues

| Issue | Location | Severity | Impact |
|-------|----------|----------|--------|
| **No order status update endpoint** | `/api/orders/[id]` missing PUT | HIGH | Merchant can't update order status (UI has dropdown, backend missing) |
| **No approval workflow for orders** | Entire codebase | HIGH | Orders created directly in 'pending' state; no merchant review/approval logic |
| **No inventory management** | `/api/products` doesn't check stock | HIGH | Can create orders with invalid quantities; no stock deduction on purchase |
| **UNCLEAR: Delete product behavior** | `/api/products/[id]` DELETE | MEDIUM | Soft delete vs hard delete not specified; could break order history |
| **No order cancellation logic** | Order schema has 'cancelled' status but no endpoint | MEDIUM | Customers can't cancel orders; no refund flow |

### 6.2 Architecture Concerns

| Issue | Severity | Root Cause | Risk |
|-------|----------|-----------|------|
| **Tight coupling: Frontend filters orders by sellerId** | MEDIUM | No merchant-specific order endpoint | If merchant ID changes or is spoofed, data leak |
| **Client-side auth check only** | MEDIUM | Middleware delegates to layout components | Malicious actor could bypass auth by manipulating localStorage |
| **JWT stored in httpOnly cookie + localStorage** | LOW | Redundancy (backup) | Cookie sufficient for security; localStorage adds complexity |
| **No rate limiting on login** | MEDIUM | Auth endpoints don't throttle attempts | Brute force attacks possible (loginAttempts field exists but not enforced) |
| **Session.userId field is generic** | LOW | Schema design | Confusing: userId could be merchant OR customer; should have explicit fields |
| **OrderItem stores variantData as JSON snapshot** | LOW | Flexibility vs validation | Variant data could become invalid if product variants change |

### 6.3 Missing Features (Not Yet Implemented)

| Feature | Status | Needed For |
|---------|--------|-----------|
| Order approval workflow | NOT IMPLEMENTED | Merchant to review/approve before shipping |
| Inventory reservation | NOT IMPLEMENTED | Prevent overselling during checkout |
| Order status update endpoint | NOT IMPLEMENTED | Merchant to change order status |
| Order cancellation | NOT IMPLEMENTED | Customer/merchant to cancel orders |
| Payment processing | TEST CARD ONLY | Stripe/PayPal integration |
| Email notifications | NOT IMPLEMENTED | Order confirmations, status updates |
| Two-factor authentication | NOT IMPLEMENTED | Account security |
| Product reviews/ratings | SCHEMA EXISTS | Not wired to UI/API |
| Merchant approval workflow | SEPARATE SYSTEM | Admin approves merchants before they can sell |
| Order tracking numbers | SCHEMA EXISTS | Not integrated with shipping API |

### 6.4 Validation Gaps

| Input | Endpoint | Validation |
|-------|----------|-----------|
| Product quantity in checkout | `/api/orders` POST | ⚠️ NOT checked against product stock |
| Product variant selection | `/api/orders` POST | Stored as JSON; variant existence not validated |
| Merchant sellerId | `/api/products` POST | ⚠️ NOT verified (merchant could claim products they don't own) |
| Order status updates | NO ENDPOINT | ⚠️ No enum validation; invalid status could be set |
| Cart item data | Frontend only | ⚠️ No backend validation; could send fake product IDs |
| File uploads | `/api/upload` | Size limits not checked; MIME type validation unclear |

### 6.5 Error Handling Gaps

| Scenario | Current Behavior | Risk |
|----------|-----------------|------|
| Order creation fails mid-transaction | Frontend doesn't show error details | User thinks order succeeded when it didn't |
| Product variant doesn't exist | Order still creates with invalid variantId | Data integrity issue |
| Merchant account deleted while viewing dashboard | ⚠️ Unclear (localStorage becomes stale) | Session state mismatch |
| Database connection drops | API returns 500; frontend shows generic error | No retry logic |
| Stock exhausted during checkout | Order succeeds; inventory goes negative | Overselling possible |

---

## 7. SUGGESTED LOGICAL BOUNDARIES

### 7.1 Domain Separation (For Scalability)

**Current**: All routes in `/app/api/` (monolithic)  
**Suggested**: Group by responsibility

```
/app/api/
├── /auth/                 (Authentication)
│   ├── /login
│   ├── /logout
│   └── /session
├── /merchants/            (Seller/Merchant operations)
│   ├── /products          (Product CRUD)
│   ├── /orders            (Order management for sellers)
│   └── /stats
├── /customers/            (Customer operations)
│   ├── /auth              (Register, login)
│   └── /orders            (Order history)
├── /orders/               (Shared - all orders, payment, etc.)
│   ├── /                  (List, create)
│   └── /[id]/             (Status updates, cancellation)
├── /products/             (Shared catalog)
│   ├── /                  (Browse, search)
│   └── /[id]/             (Detail, edit, delete)
└── /uploads/              (Media)
    └── /                  (File upload)
```

### 7.2 Ownership & Responsibilities

| Component | Owner | Inputs | Outputs | Side Effects |
|-----------|-------|--------|---------|--------------|
| **Auth Layer** | Backend + Frontend | Credentials | Token + Session | Create Session record |
| **Product Catalog** | Backend | Search/filter params | Products list | Track views (optional) |
| **Cart Management** | Frontend | Add/remove items | Cart state | localStorage save |
| **Checkout** | Frontend + Backend | Order form + cart | Order record | Inventory deduction needed |
| **Order Status** | Backend + Frontend | New status | Updated order | Notification needed |
| **Merchant Dashboard** | Frontend | None | Stats + product list | Read-only (mostly) |
| **Session Validation** | Middleware + Layout | Token/localStorage | Redirect or allow | Update lastLogin |

### 7.3 Data Access Patterns

**By Role**:
- **Merchant**: Can read/write own products, read orders containing own products
- **Customer**: Can read products, read own orders, create orders
- **Admin**: Can read all, approve merchants (separate system)

**Validation Rules Needed**:
- Only merchant owning product can edit/delete it
- Only customer owning order can view order details
- Only merchant of ordered product can update order status

---

## 8. INTERACTION DEPENDENCIES

### 8.1 Critical Dependencies

```
MERCHANT LOGIN
    ↓
Merchant data in localStorage (b2zi_merchant)
    ↓
Dashboard layout checks & renders layout
    ↓
Product management pages (fetch /api/products, filter locally)
    ↓
Order management pages (fetch /api/orders, filter locally)

CUSTOMER CHECKOUT
    ↓
Create Order via POST /api/orders
    ↓
Order inserted with status='pending'
    ↓
OrderItems created for each cart item
    ↓
Cart cleared from localStorage
    ↓
Redirect to /customers/orders

SELLER PRODUCT UPLOAD
    ↓
POST /api/products with sellerId
    ↓
Product created
    ↓
ProductVariantGroups created
    ↓
ProductVariants created
    ↓
Product appears in /api/products list
    ↓
Available in marketplace search
```

### 8.2 Data Flow Diagram

```
┌─────────────┐          ┌──────────────────┐
│   Frontend  │  ←→      │  Backend API     │
│  (React)    │  HTTP    │  (Next.js)       │
└─────────────┘          └────────┬─────────┘
      ↑                           │
      │                           ↓
 localStorage          ┌──────────────────┐
      │                │   Prisma ORM     │
      └────────────────→                  │
                       └────────┬─────────┘
                                │
                                ↓
                      ┌──────────────────┐
                      │  PostgreSQL      │
                      │  (Neon)          │
                      └──────────────────┘
```

---

## 9. SUMMARY TABLE: All Endpoints

| Path | Method | Auth | Input | Output | Status |
|------|--------|------|-------|--------|--------|
| `/api/register` | POST | None | merchant data | {success, id} | ✅ |
| `/api/merchant/login` | POST | None | {email, password} | {success, user, token} | ✅ |
| `/api/merchant/logout` | POST | Token | — | {success} | ✅ |
| `/api/customers/register` | POST | None | {email, name, password} | {success, user} | ✅ |
| `/api/customers/login` | POST | None | {email, password} | {success, user, token} | ✅ |
| `/api/customers/logout` | POST | Token | — | {success} | ✅ |
| `/api/auth/session` | GET | Cookie | — | {authenticated, user, session} | ✅ |
| `/api/products` | GET | None | ?category=X&search=Y | [{...product}] | ✅ |
| `/api/products` | POST | Token (merchant) | product data | {id, ...} | ✅ |
| `/api/products/[id]` | GET | None | — | {id, ...} | ✅ |
| `/api/products/[id]` | PUT | Token (merchant) | product data | {id, ...} | ✅ |
| `/api/products/[id]` | DELETE | Token (merchant) | — | {success} | ✅ |
| `/api/orders` | GET | Token (customer) | ?customerId=X | [{...order}] | ✅ |
| `/api/orders` | POST | Token (customer) | order data | {id, ...} | ✅ |
| `/api/orders/[id]` | DELETE | Token | — | {success} | ⚠️ Orphans order |
| `/api/merchants` | GET | None | — | [{...merchant}] | ✅ |
| `/api/merchants/[id]/products` | GET | None | — | [{...product}] | ✅ |
| `/api/merchants/[id]/orders` | GET | None | — | [{...order}] | ✅ |
| `/api/merchants/[id]/stats` | GET | None | — | {revenue, orders, products} | ✅ |
| `/api/customers/[id]/orders` | GET | Token | — | [{...order}] | ✅ |
| `/api/upload` | POST | None | FormData: file | {url, filename} | ✅ |
| `/api/orders/[id]` (PUT) | PUT | — | — | — | ❌ MISSING |

---

## 10. OPEN QUESTIONS & CLARIFICATIONS NEEDED

1. **Order Status Updates**: How should `/api/orders/[id]` PUT work? Who can update (merchant only, or admin too)?
2. **Product Deletion**: Is it soft delete (set active=false) or hard delete (cascade delete)? How does it affect past orders?
3. **Order Cancellation**: Can customers cancel? Can merchants reject orders? What happens to inventory?
4. **Inventory**: When is stock deducted? At checkout? At merchant approval? Never (infinite stock)?
5. **Merchant Approval**: Who approves merchants? Is it automated or manual admin review?
6. **Payment**: Test card is hardcoded. When does real Stripe/PayPal integration happen?
7. **Variant Validation**: If a product's variants change after an order, should OrderItem.variantData be validated?
8. **Login Attempts**: `loginAttempts` and `lockedUntil` fields exist but lockout logic isn't implemented.
9. **Email Notifications**: Should orders trigger confirmation emails? Order status updates?
10. **Admin Panel**: Is admin functionality in same codebase (`/admin` route) or separate deployment?

---

## 11. NEXT STEPS FOR ORDER TRACKING IMPLEMENTATION

**Based on current architecture**, to add order tracking + approval logic:

1. **Create `/api/orders/[id]` PUT endpoint**
   - Validate: Only merchant of ordered product can change status
   - Update: Order.status field
   - Emit: Event for notification system

2. **Add order approval workflow**
   - Schema: Add `approvedAt` (optional), `approvedBy` (merchantId) to Order
   - Endpoint: PATCH `/api/orders/[id]/approve` (merchant only)
   - Flow: pending → approved → shipped → delivered

3. **Implement inventory management**
   - Checkout: Lock stock via `ProductVariant.reserved` field
   - Approval: Deduct from `ProductVariant.stock`
   - Cancellation: Return to `ProductVariant.stock`

4. **Add order timeline/history**
   - Schema: `OrderEvent` table (orderId, action, timestamp, actor)
   - Track: created, approved, shipped, delivered, cancelled
   - Display: In order detail view

5. **Prevent race conditions**
   - Use transactions for inventory + order creation
   - Add optimistic locking or version fields

---

**END OF DOCUMENT**

This map captures the current system state without inventing missing logic. All descriptions are based on actual code found in the repository.
