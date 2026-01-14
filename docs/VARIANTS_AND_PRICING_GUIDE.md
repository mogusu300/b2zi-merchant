# Variants and Pricing Guide

## Overview
The B2Z Marketplace supports product variants with individual pricing and stock management. This guide walks you through creating products with variants like colors, sizes, and setting custom prices for each variant.

## What Are Product Variants?

Variants allow you to create different versions of the same product. For example:
- **T-Shirt** with variants: Colors (Red, Blue, Green) and Sizes (S, M, L, XL)
- This creates 12 different combinations (3 colors × 4 sizes)
- Each combination can have its own price and stock quantity

## How to Add Product Variants

### Step 1: Fill in Basic Product Information
1. Enter the product **name**
2. Enter a **description** 
3. Set a **base price** (used if no variant price is set)
4. Select a **category**

### Step 2: Add Variant Groups

**What is a Variant Group?**
A variant group is a category of variation, like "Color" or "Size".

1. Scroll to the **"Variant Setup"** section (blue card)
2. Enter a **Variant Type** (e.g., "Color", "Size", "Material")
3. Enter **Values** separated by commas (e.g., "Red, Blue, Green")
4. Click **"Add Variant Group"**

**Example:**
- Variant Type: `Color`
- Values: `Red, Blue, Green, Black`

The form will disable the inputs once a variant group is added to prevent confusion.

### Step 3: Generate All Variant Combinations

1. After adding variant groups, click **"Generate All Variant Combinations"**
2. This automatically creates all possible combinations

**Example:**
- If you have Color (Red, Blue) + Size (S, M, L)
- This generates 6 variants:
  - Red - S
  - Red - M
  - Red - L
  - Blue - S
  - Blue - M
  - Blue - L

### Step 4: Set Variant Prices and Stock

**For each variant combination:**

1. **SKU** (optional)
   - Unique identifier for the variant
   - Auto-generated if left blank
   - Example: `TSHIRT-RED-M`

2. **Price Override** ($)
   - Leave blank to use the base product price
   - Enter a custom price for this specific variant
   - Example: Red T-Shirt costs $25, Blue costs $30

3. **Stock Units** (required)
   - How many units you have in stock
   - Can be 0 (out of stock)
   - The total across all variants is displayed

**Important Notes:**
- If you leave the price field blank, the marketplace will use the base product price
- The form shows the calculated total stock across all variants
- Stock indicators show:
  - ✓ IN STOCK (more than 5 units)
  - ⚠️ LOW STOCK (1-4 units)
  - ❌ OUT OF STOCK (0 units)

## Example: T-Shirt with Colors and Prices

### Setup:
- **Product Name:** Classic T-Shirt
- **Base Price:** $25.00
- **Category:** Clothing

### Variants:
1. Color: Red, Blue, Green

### Generated Variants (3 total):
| Variant | Price | Stock | Notes |
|---------|-------|-------|-------|
| Red | $25.00 | 15 | Uses base price |
| Blue | $28.00 | 10 | Custom price |
| Green | $30.00 | 8 | Custom price |

## How Variant Pricing Works

### Displaying Prices to Customers

**On Product Listing Card:**
- Shows dynamic price based on selected variant
- If variant has custom price → shows variant price
- If variant has no price → shows base product price
- Shows strikethrough of base price when variant price differs

**On Product Detail Modal:**
- Shows variant selection options (colors, sizes, etc.)
- Price updates when customer selects different variant
- Shows stock availability for selected variant
- Shows SKU when viewing variant details

## Marketplace Customer Experience

### Customers See:
1. Product card with initial variant selection
2. Dynamic price that updates when they change variant
3. Real-time stock availability for selected variant
4. Ability to select quantity before adding to cart
5. Color thumbnails showing available variants

### Price Behavior:
- Default view shows first variant or base price
- Selecting Red variant: See Red price
- Selecting Blue variant: See Blue price
- Price updates instantly without reload

## Tips for Success

### ✅ DO:
- Set meaningful variant names (Color, Size, Material)
- Set stock for each variant accurately
- Use custom prices for different variants
- Review total stock before submitting
- Test variant selection on marketplace after publishing

### ❌ DON'T:
- Add too many variants (keep under 20-30 combinations)
- Set stock to 0 unless product is truly unavailable
- Leave price and stock blank
- Forget to click "Generate All Variant Combinations"
- Create duplicate variant groups

## Troubleshooting

### Issue: Can't add variant groups
**Solution:** The form prevents adding multiple groups to avoid confusion. Complete the current group first by clicking "Generate All Variant Combinations".

### Issue: Prices aren't showing on marketplace
**Solution:** 
1. Make sure you filled in the price field for each variant
2. Or leave it blank to use the base product price
3. Refresh the marketplace page

### Issue: Stock numbers are wrong
**Solution:** Check the total stock display (blue card). It should match sum of all variant stocks.

### Issue: Customer can't select variant
**Solution:** Make sure the variant has stock > 0. Out of stock variants may not be selectable.

## Need Help?

For issues with variant creation:
1. Check this guide above
2. Verify all required fields are filled
3. Ensure at least one variant has stock > 0
4. Make sure variant combinations were generated successfully

## Related Topics
- Product Management Guide
- Pricing Strategy Guide
- Inventory Management
