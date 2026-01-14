# Sellers Guide: Using the New Product Variants System

## What's New?

The product creation system has been completely redesigned to match modern e-commerce platforms like eBay and Shopify. You can now create products with variants - different combinations of attributes like color and size - each with their own inventory and pricing.

## Quick Start

### Creating a Simple Product (No Variants)

If your product comes in only one version:

1. Go to **Sellers → Products → Add Product**
2. Fill in:
   - **Product Name**: e.g., "Coffee Mug"
   - **Description**: Details about your product
   - **Base Price**: The selling price
   - **Category**: Select from dropdown
3. **Skip the Variants section** (leave blank)
4. Upload at least one product image
5. Click **Create Product**

✓ Done! Your simple product is ready to sell.

---

### Creating a Product with Variants

For products that come in different options (colors, sizes, etc.):

#### Step 1: Basic Information
```
Name: Men's T-Shirt
Price: $29.99
Category: Clothing
Description: High-quality cotton t-shirt
```

#### Step 2: Define Variant Groups
This is where you specify what options your product comes in.

For a t-shirt with colors and sizes:

1. Under "Product Variants" section:
   - **Variant Type**: Type "Color"
   - **Values**: Type "Red, Blue, Green"
   - Click "Add Variant Group"

2. Now add sizes:
   - **Variant Type**: Type "Size"
   - **Values**: Type "XS, S, M, L, XL"
   - Click "Add Variant Group"

✓ The system now knows you have 2 variant groups

#### Step 3: Generate Combinations
Click "Generate All Variant Combinations"

The system automatically creates all combinations:
- Red-XS, Red-S, Red-M, Red-L, Red-XL
- Blue-XS, Blue-S, Blue-M, Blue-L, Blue-XL
- Green-XS, Green-S, Green-M, Green-L, Green-XL

**Total: 15 variants** (3 colors × 5 sizes)

#### Step 4: Configure Each Variant
For each combination, set:

**SKU** (Stock Keeping Unit)
- Unique code for tracking
- Auto-generated: `MEN-S-T-SHIRT-RED-XS`
- You can customize: `TS-RED-XS`

**Price Override** (optional)
- Leave blank to use base price ($29.99)
- Enter different price if needed (e.g., XL sizes cost more)

**Stock**
- How many units you have of this specific combination
- E.g., Red-M: 50 units, Red-L: 30 units

Example:
```
Red-XS:  SKU=TS-RED-XS,   Stock=15
Red-S:   SKU=TS-RED-S,    Stock=25
Red-M:   SKU=TS-RED-M,    Stock=50
Red-L:   SKU=TS-RED-L,    Stock=30
Red-XL:  SKU=TS-RED-XL,   Stock=10
(... repeat for Blue and Green)
```

#### Step 5: Upload Images
Upload photos of your product. The first image is the primary image used in listings.

#### Step 6: Create
Click **Create Product** and you're done!

---

## Advanced Features

### Variant-Specific Pricing

If different variants have different prices:

Example: T-shirt that costs more in larger sizes
```
Base Price: $29.99

Variants:
- XS, S, M, L: Keep blank (uses base $29.99)
- XL: Set to $34.99 (premium price)
- 2XL: Set to $39.99
```

When customers see your product, each size option shows its actual price.

### Smart SKU Generation

SKU (Stock Keeping Unit) is your internal tracking code. The system auto-generates them:
- **Auto**: `PRODUCT-NAME-RED-M`
- **Custom**: Edit to `TS-RED-M` or whatever you prefer

SKUs help you:
- Track specific variant inventory
- Match with supplier orders
- Generate barcodes
- Manage shipping/fulfillment

### Stock Management

Each variant has separate inventory:

```
Red-S:  10 in stock
Red-M:  50 in stock
Red-L:  25 in stock
Blue-S: 0 in stock (out of stock)
```

**Total Stock**: 85 units

Customers can only buy what's in stock for that specific variant.

---

## Common Scenarios

### Clothing Store
- **Variant Groups**: Color, Size
- **Colors**: Black, White, Navy, Gray
- **Sizes**: XS, S, M, L, XL, 2XL
- **Combinations**: 24 variants
- **Why**: Different colors and sizes need different inventory tracking

### Electronics Store
- **Variant Groups**: Color, Storage
- **Colors**: Space Gray, Silver, Gold
- **Storage**: 64GB, 128GB, 256GB
- **Combinations**: 9 variants
- **Price Variation**: 256GB costs more

### Home Goods
- **Variant Groups**: Color, Size
- **Colors**: Black, White, Gray
- **Size**: Small, Medium, Large
- **Combinations**: 9 variants
- **No Price Variation**: All same price

### Simple Product
- **No Variant Groups**
- Example: Coffee Mug (one size, one color)
- Just fill basic info and upload image

---

## FAQ

**Q: Do I have to use variants?**
A: No! Simple products work great too. Only use variants if your product comes in multiple options.

**Q: Can I change variants after creating a product?**
A: Yes! Go to edit the product and you can:
- Change variant groups
- Add/remove specific variants
- Update SKUs, prices, and stock

**Q: What if I add variants later?**
A: You can always edit your product and add variants. Just click "Reset & Regenerate Variants" and set everything up fresh.

**Q: How do customers choose variants?**
A: When viewing your product, they see dropdown menus:
- Select Color: [Red ▼]
- Select Size: [M ▼]
- Then click Add to Cart

**Q: What if one variant runs out?**
A: That specific variant shows as "Out of Stock" but other variants stay available.

**Q: Can two variants have the same SKU?**
A: No. The system prevents duplicate SKUs. Each variant must be unique for tracking.

**Q: What's the maximum number of variants?**
A: The system can handle hundreds of variants, but practically:
- 2 groups with 10 values each = 100 variants
- 3 groups with 5 values each = 125 variants

---

## Pro Tips

1. **Organize SKUs logically**
   - ❌ Bad: `ABC123`, `XYZ456`
   - ✓ Good: `TS-RED-M`, `TS-BLUE-L`

2. **Keep variant groups simple**
   - Use standard attribute names: Color, Size, Material
   - Use standard values: XS/S/M/L/XL not "small", "medium"

3. **Accurate stock counts**
   - Count your actual inventory before entering numbers
   - Keep stock updated as items sell
   - Use negative stock adjustment if needed

4. **Price strategically**
   - Premium colors? Use price override
   - Bulk discount sizes? Lower price for bulk
   - Standard cost? Use base price for all

5. **Image quality**
   - Upload clear photos of product variants
   - Show color accuracy
   - Include product in use (optional)

---

## Support

For issues with variants or product creation:
- Check this guide first
- Contact seller support with product details
- Provide SKU and description of the issue
