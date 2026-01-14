# Quick Start: Adding Products with Variants & Pricing

## 5-Minute Quick Guide

### What You'll Learn
✅ Create a product with 2 colors (Red, Blue)  
✅ Set different prices for each color ($25 and $28)  
✅ Set stock quantities per color  
✅ See prices update on the marketplace  

### Example: Selling T-Shirts with Color Variants

## Step 1: Go to Product Creation (2 minutes)
1. Go to: `http://localhost:3000/sellers/products/new`
2. Fill in:
   - **Product Name:** Classic T-Shirt
   - **Description:** Comfortable cotton t-shirt
   - **Base Price:** $25.00 ← Used if no variant price set
   - **Category:** Clothing
3. **Upload Images:** Click "Add Product Images" and upload at least one image

✅ Basic product info complete!

---

## Step 2: Add Variant Group (1 minute)

In the **"Variant Setup"** section (blue card):

1. **Variant Type:** Enter `Color`
2. **Values:** Enter `Red, Blue`
   - Each value separated by comma
   - No extra spaces needed
3. Click **"Add Variant Group"** button

You'll see a green message: ✓ Added: "Color"  
The form inputs now show: "Complete variant setup before adding another group"

✅ Variant group added!

---

## Step 3: Generate Variants (30 seconds)

In the **"Generate Variants"** section (yellow card):

Click **"Generate All Variant Combinations"** button

The system creates all combinations:
- Red
- Blue

✅ 2 variants generated!

---

## Step 4: Set Prices & Stock (1.5 minutes)

In the **"Variant Details"** section (green card):

For **RED** variant:
- SKU: Leave blank (auto-generated)
- **Price Override:** Leave blank (uses base price $25.00)
- **Stock Units:** 15

For **BLUE** variant:
- SKU: Leave blank
- **Price Override:** 28.00 (custom price)
- **Stock Units:** 10

**Total Stock:** Should show 25 (15 + 10)

✅ Prices and stock set!

---

## Step 5: Submit Product (30 seconds)

Click **"Create Product"** button at the bottom

Wait for page redirect to product list.

✅ Product created successfully!

---

## Step 6: View on Marketplace (1 minute)

1. Go to: `http://localhost:3000/marketplace`
2. Find your "Classic T-Shirt" product
3. **On the product card:**
   - See variant options: Red, Blue
   - Default shows Red: **$25.00**
   - Click "Blue": Price changes to **$28.00** ✨

4. **Click product card** to open detail modal:
   - See Color selection buttons
   - See stock count for selected color
   - See SKU
   - Add to cart with quantity

✅ Everything working!

---

## What to Notice

### Price Display
- Default: First variant or base price
- When selecting Red: Shows $25.00
- When selecting Blue: Shows $28.00 with strikethrough of $25
- Happens instantly, no page reload!

### Stock Availability
- Red: 15 in stock ✓
- Blue: 10 in stock ✓
- Out of stock variants show ❌

### Customer Experience
Customer sees:
1. Product card with variant buttons
2. Dynamic price that changes instantly
3. Real-time stock count
4. Color thumbnails (if included)

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Can't add variant groups" | Click "Generate All Variant Combinations" first |
| Price shows as "$0" | Make sure base price or variant price is filled |
| Stock shows 0 | Check that stock units field has a number |
| Variants not selectable | Ensure stock > 0 for that variant |

---

## Key Concept: When to Set Variant Price

### Blank = Use Base Price
```
Base Price: $25.00
Red variant price: [blank]
Blue variant price: [blank]
Result: Both colors = $25.00
```

### Custom Price = Override Base
```
Base Price: $25.00
Red variant price: [blank]
Blue variant price: 28.00
Result: Red = $25, Blue = $28
```

---

## Pro Tips

✅ **Multiple Variant Groups?**
- Currently: One group per product (Color OR Size)
- Future: Will support Color + Size simultaneously

✅ **Bulk Price Changes?**
- Create new product with updated prices
- Edit directly in form before submitting

✅ **SKU Management?**
- Auto-generated: PRODUCTNAME-RED, PRODUCTNAME-BLUE
- Custom: Set your own values

✅ **Stock Management?**
- Total shows sum of all variants
- 0 stock = Out of stock for that variant
- Minimum stock check when adding to cart

---

## Next Steps

✅ Create your first product with variants!  
✅ Check it on the marketplace  
✅ Test variant selection and pricing  
✅ Read full guide: [VARIANTS_AND_PRICING_GUIDE.md](./VARIANTS_AND_PRICING_GUIDE.md)  

---

## Detailed Guide

For complete documentation:
- 📖 [Variants & Pricing Guide](./VARIANTS_AND_PRICING_GUIDE.md)
- 🔧 [Implementation Details](./VARIANTS_AND_PRICING_IMPLEMENTATION.md)

## Need Help?

1. **Form won't accept input?**
   - Check if variant group was added
   - Click "Generate" to create variant cards

2. **Price not showing on marketplace?**
   - Refresh browser
   - Check that product was created successfully

3. **Stock numbers wrong?**
   - Make sure each variant has a stock value
   - Check total = sum of all variant stocks

---

**You're all set! 🎉 Happy selling!**
