# Product Variants System - Architecture & Logic

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SELLER DASHBOARD                           │
│                  (sellers/products/new)                         │
├─────────────────────────────────────────────────────────────────┤
│ 1. Basic Product Info                                           │
│    └─ Name, Description, Base Price, Category, Images         │
│                                                                 │
│ 2. Variant Configuration                                        │
│    ├─ Define Variant Groups (e.g., "Color", "Size")            │
│    ├─ Add Values for each group                                 │
│    └─ Generate all combinations automatically                   │
│                                                                 │
│ 3. Variant Customization                                        │
│    ├─ Edit SKU for each variant                                │
│    ├─ Set price override (optional)                             │
│    └─ Set individual stock levels                              │
│                                                                 │
│ 4. Image Upload                                                 │
│    └─ Primary images for product                               │
│                                                                 │
│ 5. Submit → API POST /api/products                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API LAYER                                     │
│              (app/api/products/route.ts)                        │
├─────────────────────────────────────────────────────────────────┤
│ POST Handler:                                                   │
│ 1. Validate required fields                                     │
│ 2. Calculate total stock from variants                          │
│ 3. Create Product record                                        │
│ 4. Create ProductVariantGroup records                           │
│ 5. Create ProductVariant records                                │
│ 6. Return complete product with all relations                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                                │
│                  (Prisma ORM)                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Product                                                        │
│  ├─ id, name, description                                       │
│  ├─ price (base), category                                      │
│  ├─ sellerId (relation to Merchant)                             │
│  ├─ totalStock, inStock, rating                                 │
│  ├─ images[] (primary images)                                   │
│  └─ Relations:                                                  │
│     ├─ variantGroups: ProductVariantGroup[]                    │
│     ├─ variants: ProductVariant[]                              │
│     └─ orderItems: OrderItem[]                                 │
│                                                                 │
│  ProductVariantGroup                                            │
│  ├─ id, productId (FK), name                                    │
│  ├─ values: string[] (enum values)                              │
│  └─ Constraint: Unique(productId, name)                        │
│                                                                 │
│  ProductVariant                                                 │
│  ├─ id, productId (FK)                                          │
│  ├─ attributes: JSON {color: "Red", size: "M"}                 │
│  ├─ sku: string (Unique per product)                            │
│  ├─ price: Float (nullable, overrides product price)           │
│  ├─ stock: Int (current inventory)                              │
│  ├─ reserved: Int (stock in pending orders)                     │
│  ├─ images: string[] (variant-specific images)                 │
│  ├─ weight: Float (grams)                                       │
│  ├─ dimensions: JSON {length, width, height}                   │
│  ├─ active: Boolean                                             │
│  └─ Constraint: Unique(productId, sku)                         │
│                                                                 │
│  OrderItem (Updated)                                            │
│  ├─ id, orderId (FK), productId (FK)                            │
│  ├─ variantId: String (optional)                                │
│  ├─ variantData: JSON (snapshot of attributes)                 │
│  ├─ quantity, price, sku                                        │
│  └─ Purpose: Complete order history with variant details       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Product Creation Flow

```
FORM INPUT
  ├─ Basic Info: name, description, price, category
  ├─ Variant Groups: [
  │    {name: "Color", values: ["Red", "Blue"]},
  │    {name: "Size", values: ["S", "M", "L"]}
  │  ]
  └─ Variants: [
       {attributes: {color: "Red", size: "S"}, sku: "...", stock: 10},
       {attributes: {color: "Red", size: "M"}, sku: "...", stock: 20},
       // ... etc (6 total for 2x3 combinations)
     ]

                     ↓

API: POST /api/products
  
  1. Validation:
     ✓ Required fields present
     ✓ Images uploaded
     ✓ Stock > 0 for at least one variant
  
  2. Processing:
     - totalStock = sum(variants[].stock)
     - inStock = totalStock > 0
  
  3. Database Operations (Transactional):
     ├─ INSERT Product
     │   └─ values: {name, description, price, category, images, 
     │              sellerId, totalStock, inStock}
     │
     ├─ INSERT ProductVariantGroup (1x per group)
     │   └─ values: {productId, name, values}
     │
     └─ INSERT ProductVariant (1x per combination)
         └─ values: {productId, attributes, sku, price, stock, images}

                     ↓

RESPONSE
  ├─ Product (complete)
  ├─ variantGroups (with values)
  └─ variants (all combinations)

                     ↓

CLIENT STATE
  → Redirect to products list
```

### 2. Customer Purchase Flow

```
MARKETPLACE LISTING
  │
  ├─ Display Product with Variant Selectors
  │  ├─ Color: [Red ▼] [Blue ▼] [Green ▼]
  │  └─ Size:  [S ▼] [M ▼] [L ▼]
  │
  └─ Customer selects: Red + M

                     ↓

SELECT VARIANT
  │
  ├─ Find ProductVariant where:
  │  └─ attributes = {color: "Red", size: "M"}
  │
  └─ Display:
     ├─ Price: (override if set, else base)
     ├─ Stock: (from variant.stock)
     └─ SKU: (for reference)

                     ↓

ADD TO CART / CHECKOUT
  │
  ├─ Create OrderItem:
  │  ├─ variantId: variant.id
  │  ├─ variantData: {color: "Red", size: "M"}
  │  ├─ sku: "TS-RED-M"
  │  ├─ quantity: 2
  │  └─ price: (variant.price || product.price)
  │
  └─ Update variant stock:
     └─ reserved += quantity
     └─ available = stock - reserved

                     ↓

ORDER CONFIRMATION
  │
  └─ Shows customer exactly what they ordered:
     ├─ Product: Men's T-Shirt
     ├─ Color: Red
     ├─ Size: M
     ├─ SKU: TS-RED-M
     ├─ Qty: 2
     └─ Price: $29.99 ea
```

### 3. Inventory Management

```
For each ProductVariant:

  ┌──────────────────────────┐
  │   INVENTORY STATE        │
  ├──────────────────────────┤
  │                          │
  │  stock = 100 (units)     │
  │  reserved = 30 (pending) │
  │  ────────────────────    │
  │  available = 70 (for sale)
  │                          │
  └──────────────────────────┘

Operations:

  1. When order placed (pending):
     reserved += quantity
     ✓ Inventory reserved but not confirmed

  2. When order confirmed:
     reserved → stock (becomes committed)
     ✓ Confirmed sale

  3. When order cancelled:
     reserved -= quantity
     ✓ Stock released back

  4. Seller updates stock:
     stock = new_count
     ✓ Manual adjustment (inventory count)
```

## Variant Generation Logic

```
INPUT: 2 Variant Groups
  Group 1: Color = ["Red", "Blue", "Green"]
  Group 2: Size = ["S", "M", "L"]

ALGORITHM: Cartesian Product
  
  colors = ["Red", "Blue", "Green"]
  sizes = ["S", "M", "L"]
  
  combinations = []
  for color in colors:
    for size in sizes:
      combinations.push({color, size})
  
  Result: 3 × 3 = 9 combinations

OUTPUT:
  1. {color: "Red", size: "S"} → SKU: "PRODUCT-RED-S"
  2. {color: "Red", size: "M"} → SKU: "PRODUCT-RED-M"
  3. {color: "Red", size: "L"} → SKU: "PRODUCT-RED-L"
  4. {color: "Blue", size: "S"} → SKU: "PRODUCT-BLUE-S"
  5. {color: "Blue", size: "M"} → SKU: "PRODUCT-BLUE-M"
  6. {color: "Blue", size: "L"} → SKU: "PRODUCT-BLUE-L"
  7. {color: "Green", size: "S"} → SKU: "PRODUCT-GREEN-S"
  8. {color: "Green", size: "M"} → SKU: "PRODUCT-GREEN-M"
  9. {color: "Green", size: "L"} → SKU: "PRODUCT-GREEN-L"

For 3 groups:
  Group1 (3) × Group2 (3) × Group3 (5) = 45 combinations
```

## Error Handling

```
Product Creation Validation:

├─ Missing Required Fields
│  └─ Return 400: "Missing required fields"
│
├─ No Images
│  └─ Return 400: "At least 1 image required"
│
├─ Invalid Variant Setup
│  ├─ No variant groups defined
│  └─ Return 400: "Define variant groups"
│
├─ Duplicate SKU
│  └─ Return 400: "SKU must be unique per product"
│
├─ Invalid Stock
│  ├─ All variants have 0 stock
│  └─ Return 400: "At least one variant needs stock"
│
└─ Database Error
   └─ Return 500: "Failed to create product"
```

## Query Optimization

```
When fetching product for display:

GET /api/products/{id}
  
  SELECT * FROM Product WHERE id = ?
  SELECT * FROM ProductVariantGroup WHERE productId = ?
  SELECT * FROM ProductVariant WHERE productId = ? AND active = true

Indexes:
  - Product.id (primary key)
  - ProductVariantGroup.productId
  - ProductVariant.productId
  - ProductVariant.active

Result size: ~1KB for 20 variants
Response time: <50ms typical
```

## Backward Compatibility

```
Old system (colors[], types[]):
  Product {
    colors: ["Red", "Blue"],
    types: ["S", "M", "L"]
  }

New system:
  Product {
    variantGroups: [
      {name: "Color", values: ["Red", "Blue"]},
      {name: "Type", values: ["S", "M", "L"]}
    ],
    variants: [...]
  }

Migration path:
  1. Old products continue to work (reads from new schema)
  2. Sellers can recreate with variant system
  3. API handles both old and new formats initially
  4. Deprecation period before removing old fields
```

## Future Enhancements

1. **Variant Images**: Each variant can have unique images
2. **Bulk Operations**: Add stock to multiple variants at once
3. **Variant Templates**: Save variant configurations for reuse
4. **Barcode Generation**: Auto-generate barcodes from SKUs
5. **Import/Export**: CSV import for variant data
6. **Variant Presets**: Common variations (sizes for clothing, etc.)
7. **Smart Recommendations**: Suggest variants based on category
