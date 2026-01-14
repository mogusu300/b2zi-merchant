# Product Variants System Upgrade

## Overview
The product management system has been upgraded to support modern variant management, similar to eBay, Shopify, and other leading e-commerce platforms. This allows sellers to manage products with multiple combinations of attributes (Color, Size, etc.) with individual pricing, SKUs, and inventory tracking.

## Key Changes

### 1. Database Schema (Prisma)

#### New Models
```
ProductVariantGroup
- Stores variant dimensions (e.g., "Color", "Size")
- Values: Array of possible values (e.g., ["Red", "Blue", "Green"])
- Unique constraint: One group per product per name

ProductVariant
- Represents a specific combination of attributes
- SKU: Unique identifier per variant
- Price: Optional per-variant pricing (falls back to product base price)
- Stock: Individual inventory for each variant
- Attributes: JSON object storing the combination (e.g., {"color": "Red", "size": "M"})
- Images: Optional variant-specific images
- Weight & Dimensions: For shipping calculations
- Reserved: Tracks stock reserved for pending orders
```

#### Updated Product Model
- **price**: Now base price (variants can override)
- **totalStock**: Cached total across all variants
- **colors & types arrays**: REMOVED (now handled via ProductVariantGroup)
- **variantGroups**: Relationship to variant groups
- **variants**: Relationship to variant records

#### Updated OrderItem Model
- **variantId**: Reference to the specific variant purchased
- **variantData**: JSON snapshot of variant attributes selected
- **sku**: SKU snapshot for records

### 2. API Changes

#### POST /api/products (Create)
**Request Structure:**
```json
{
  "name": "Men's T-Shirt",
  "description": "...",
  "price": 29.99,
  "category": "Clothing",
  "images": ["url1", "url2"],
  "sellerId": "merchant-id",
  "variantGroups": [
    {
      "name": "Color",
      "values": ["Red", "Blue", "Green"]
    },
    {
      "name": "Size",
      "values": ["S", "M", "L", "XL"]
    }
  ],
  "variants": [
    {
      "attributes": {"color": "Red", "size": "M"},
      "sku": "TSHIRT-RED-M",
      "price": 29.99,
      "stock": 50,
      "images": []
    },
    // ... more variants
  ]
}
```

#### PUT /api/products/{id} (Update)
Same structure as create - replaces variant groups and variants completely.

#### GET /api/products
Response now includes:
- `variantGroups`: Available variant dimensions
- `variants`: Array of active variants with full details
- `totalStock`: Total inventory across all variants

### 3. UI Changes

#### New Product Creation (`/sellers/products/new`)

**Workflow:**
1. Enter basic product info (name, description, base price, category)
2. Choose to add variants OR keep simple (no variants needed)
3. If adding variants:
   - Add variant groups (e.g., "Color")
   - Add values to each group (e.g., "Red", "Blue")
   - System auto-generates all combinations
   - Customize each variant's SKU, price, stock
4. Upload primary images
5. Submit

**Features:**
- Visual variant group management
- Auto-generation of all combinations
- Individual SKU and price configuration
- Per-variant stock tracking
- Reset/regenerate functionality

#### Product Listing (`/sellers/products`)
- Shows products with variant information
- Displays total stock across all variants

## Modern E-commerce Standards

### Similarities to eBay
✓ Variants are attributes (Color, Size, etc.)
✓ Each variant combination gets unique SKU
✓ Individual stock per variant
✓ Optional variant-specific pricing
✓ Efficient inventory management

### Similarities to Shopify
✓ Variant groups define attribute types
✓ Automatic combination generation
✓ Per-variant pricing override
✓ Separate images per variant option
✓ Weight/dimensions per variant

## Examples

### Simple Product (No Variants)
```json
{
  "name": "Coffee Mug",
  "price": 12.99,
  "category": "Home & Garden",
  "images": ["mug.jpg"],
  "sellerId": "seller-123"
  // No variantGroups or variants
}
```

### T-Shirt with Color & Size
```json
{
  "name": "Premium Cotton T-Shirt",
  "price": 29.99,
  "variantGroups": [
    { "name": "Color", "values": ["Black", "White", "Blue"] },
    { "name": "Size", "values": ["XS", "S", "M", "L", "XL"] }
  ],
  "variants": [
    // 15 combinations (3 colors × 5 sizes)
    { "attributes": {"color": "Black", "size": "XS"}, "sku": "TS-BLACK-XS", "stock": 10 },
    { "attributes": {"color": "Black", "size": "S"}, "sku": "TS-BLACK-S", "stock": 15 },
    // ... etc
  ]
}
```

### Product with Price Variation
```json
{
  "name": "Custom Widget",
  "price": 50.00,  // Base price
  "variantGroups": [
    { "name": "Size", "values": ["Small", "Large"] }
  ],
  "variants": [
    { 
      "attributes": {"size": "Small"}, 
      "sku": "WIDGET-S",
      "price": 50.00,  // Uses base
      "stock": 20 
    },
    { 
      "attributes": {"size": "Large"}, 
      "sku": "WIDGET-L",
      "price": 75.00,  // Premium price
      "stock": 15 
    }
  ]
}
```

## Migration Notes

### For Existing Products
The system maintains backward compatibility:
- Products without variants continue to work
- Old "colors" and "types" arrays were removed from schema
- Existing products can be migrated or recreated with new variant system
- Orders preserve variant data in OrderItem.variantData

### For Customers
- When purchasing variant products, they select specific variant combination
- Order shows which specific SKU was purchased
- Stock is properly decremented from correct variant

## Benefits

1. **Inventory Accuracy**: Each SKU tracked independently
2. **Flexible Pricing**: Different prices for different combinations
3. **Scalability**: Support unlimited variant combinations
4. **Professional**: Matches industry standards (eBay, Amazon, Shopify)
5. **Data Rich**: Complete history of variant attributes in orders
6. **Variant Images**: Different images per variant (future enhancement)

## Implementation Status

✓ Database schema updated
✓ API endpoints updated (POST, PUT, GET)
✓ Product creation UI redesigned
✓ Variant group management
✓ Auto-combination generation
✓ Individual variant configuration
✓ Product listing compatibility
✓ OrderItem updated for variant tracking

## Next Steps

1. Update product edit page for variant management
2. Update marketplace display to show variant selectors
3. Add variant images support in product display
4. Create variant-aware shopping cart
5. Update order management to show variant details
6. Add bulk variant operations
7. Support variant import/export

## Testing Checklist

- [ ] Create simple product (no variants)
- [ ] Create product with color variants
- [ ] Create product with color + size variants
- [ ] Auto-generate combinations
- [ ] Customize SKUs and pricing
- [ ] Verify stock calculation
- [ ] Edit existing product variants
- [ ] Delete variant groups
- [ ] Check product listing shows variant info
- [ ] Verify order saves variant data
