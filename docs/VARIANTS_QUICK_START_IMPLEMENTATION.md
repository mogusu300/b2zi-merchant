# Product Variants - Implementation Quick Start

## ⚡ 5-Minute Setup

### What You Get
✅ Dynamic variant pricing on marketplace  
✅ Color swatches for colors  
✅ Smart variant selectors  
✅ Stock tracking per variant  

### Files to Deploy
```
NEW (copy these):
- lib/variant-utils.ts
- components/marketplace/ColorSwatch.tsx
- components/marketplace/VariantSelector.tsx

MODIFY (update these):
- components/marketplace/ProductDetail.tsx
- components/marketplace/ProductCard.tsx
- components/marketplace/Marketplace.tsx
```

---

## 🔧 How Variants Work Now

### Before Integration
```
Product page: Shows base price only ($20)
Modal: Shows variant buttons
Select variant: Price stays $20 ❌
```

### After Integration
```
Product page: Shows dynamic price
Select Color: Price updates to $25
Shows: "$25 (crossed out $20)"
Cart: Correct price $25 ✅
```

---

## 📝 Code Changes Summary

### 1. ProductDetail.tsx
**Added**: Import variant utilities and components
```typescript
import { VariantSelector } from "./VariantSelector"
import { getVariantPrice, findVariantByCombination } from "@/lib/variant-utils"
```

**Changed**: Manual variant logic → Utility functions
```typescript
// OLD: Manual price logic
const currentPrice = selectedVariant?.price || product.price

// NEW: Smart price logic
const currentPrice = getVariantPrice(selectedVariant, product.price)
const priceHasOverride = hasVariantPriceOverride(selectedVariant, product.price)
```

### 2. ProductCard.tsx
**Same changes as ProductDetail.tsx**
- Import utilities
- Use getVariantPrice()
- Use VariantSelector component

### 3. Marketplace.tsx
**Simplified data mapping**
```typescript
// OLD: Manual color extraction
const processedData = data.map(p => ({
  colors: p.colorVariants?.map(v => v.color) : [],
}))

// NEW: Direct API response
setProducts(data) // Already properly structured
```

---

## 🎨 Variant Selector Usage

### Basic Usage
```tsx
<VariantSelector
  groupName="Color"
  allValues={["Red", "Blue", "Green"]}
  selectedValue={selectedColor}
  availableValues={availableColors}
  onSelect={setSelectedColor}
  displayMode="auto"
  showLabels={true}
/>
```

### Result
- **Color variant** → Shows as swatches ✨
- **Size/Type variant** → Shows as buttons
- **Custom variant** → Shows as buttons

---

## 💰 Pricing Logic

### How Price Works Now
```
Base Price: $20
Variant "Premium": price = $25

Display:
✓ Price: $25
✓ Crossed out: $20 (showing it's different)

Cart Price: $25 ✓
Order Price: $25 ✓
```

### Functions Involved
```typescript
// Get price for display
const price = getVariantPrice(variant, basePrice)
// $25 if variant.price is set
// $20 if variant.price is undefined

// Check if price was overridden
const hasOverride = hasVariantPriceOverride(variant, basePrice)
// true if variant.price !== basePrice
```

---

## 📦 Stock Handling

### How Stock Works
```typescript
// Get stock for selected variant
const stock = getVariantStock(selectedVariant, totalStock)
// Returns variant.stock if variant selected
// Returns totalStock if no variant selected

// Check if in stock
const inStock = stock > 0

// Disable "Add to Cart" if out of stock
<button disabled={!inStock}>Add to Cart</button>
```

---

## 🔍 Finding Variants

### Get Variant by Attributes
```typescript
const variant = findVariantByCombination(
  product.variants,
  { Color: "Red", Size: "Large" }
)

// Returns the matching variant or undefined
```

### Get Available Options
```typescript
const availableColors = getAvailableVariantOptions(
  product.variants,
  "Color",
  { Size: "Large" } // Current selection
)

// Returns: ["Red", "Blue"] (available with Large size)
```

---

## 🎨 Color Swatches

### Automatic Color Detection
```typescript
// Color detected automatically
looksLikeColor("Red") → true → Shows as swatch
looksLikeColor("Large") → false → Shows as button
```

### Add Custom Colors
```typescript
// In lib/variant-utils.ts
const colorNames = [
  'red', 'blue', 'green',
  'seafoam',  // Add custom here
  'mauve',
]

const colorMap = {
  'seafoam': '#93E9BE',  // Add hex here
  'mauve': '#E0B0FF',
}
```

---

## ✅ Testing Checklist

### Functional
- [ ] Variant appears in selector
- [ ] Clicking variant changes selection
- [ ] Price updates when variant selected
- [ ] Price shows strikethrough if overridden
- [ ] Stock updates with variant
- [ ] Colors show as swatches
- [ ] Sizes show as buttons

### Visual
- [ ] Color swatches show correct colors
- [ ] Selected state is clear
- [ ] Disabled state is clear
- [ ] Strikethrough price is visible
- [ ] Mobile responsive
- [ ] Smooth transitions

### Integration
- [ ] Works on product card
- [ ] Works on detail modal
- [ ] Cart shows correct price
- [ ] Order shows correct price

---

## 🐛 Troubleshooting

### Variant Not Showing
**Check**: Does product have `variantGroups` array?
```typescript
console.log(product.variantGroups) // Should not be empty
```

### Price Not Updating
**Check**: Are you using `getVariantPrice()`?
```typescript
// RIGHT:
const price = getVariantPrice(variant, basePrice)

// WRONG:
const price = variant.price || basePrice // Falls back when variant.price = 0
```

### Color Not Detected
**Check**: Is color name in colorNames list?
```typescript
// In lib/variant-utils.ts
looksLikeColor("MyCustomColor") // Add to colorNames array
```

### Stock Showing Wrong
**Check**: Are variants updated from API?
```typescript
console.log(product.variants) // Should have stock property
```

---

## 🚀 Deployment Steps

### 1. Copy New Files
```bash
cp lib/variant-utils.ts <project>/lib/
cp components/marketplace/ColorSwatch.tsx <project>/components/marketplace/
cp components/marketplace/VariantSelector.tsx <project>/components/marketplace/
```

### 2. Update Existing Files
```bash
# Update these files with the new imports and logic
- components/marketplace/ProductDetail.tsx
- components/marketplace/ProductCard.tsx
- components/marketplace/Marketplace.tsx
```

### 3. Test
```bash
npm run build  # Should compile without errors
npm run test   # Run your tests
npm run dev    # Test locally
```

### 4. Deploy
```bash
git add .
git commit -m "feat: implement product variants system"
git push
# Deploy to production
```

---

## 📊 API Response Format

Your API should return products like this:
```json
{
  "id": "prod-123",
  "name": "T-Shirt",
  "price": 20.00,
  "category": "Clothing",
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
      "id": "var-1",
      "attributes": { "Color": "Red", "Size": "M" },
      "sku": "TSHIRT-RED-M",
      "price": 25.00,
      "stock": 10,
      "images": []
    }
  ]
}
```

✅ Your API already returns this format!

---

## 🎯 Key Functions to Know

### Price Functions
```typescript
getVariantPrice(variant, basePrice)        // Get display price
hasVariantPriceOverride(variant, basePrice) // Check if price overridden
```

### Stock Functions
```typescript
getVariantStock(variant, totalStock)       // Get variant stock
```

### Finding Functions
```typescript
findVariantByCombination(variants, attrs)  // Find variant by attributes
getAvailableVariantOptions(variants, attr, current) // Get available options
isVariantOptionAvailable(variants, attr, value, current) // Check if available
```

### Utility Functions
```typescript
looksLikeColor(value)                      // Detect if color
colorNameToHex(colorName)                  // Convert color to hex
formatVariantDescription(variant)          // Human-readable description
```

---

## 💡 Pro Tips

### Tip 1: Use getVariantPrice() for all prices
```typescript
// ALWAYS use this:
const price = getVariantPrice(variant, basePrice)

// NOT this:
const price = variant.price || basePrice // Wrong when variant.price = 0
```

### Tip 2: Variants don't need images
```typescript
// Works fine:
variant.images = [] // Optional

// Also works:
variant.images = undefined // Not set
```

### Tip 3: Stock is per variant
```typescript
// Each variant has its own stock
variant.stock = 10 // This is variant stock

// Product totalStock is cached:
product.totalStock = 50 // Sum of all variant stocks
```

### Tip 4: Auto-detection is smart
```typescript
// No need to specify display type:
<VariantSelector displayMode="auto" /> // Smart!

// Detects:
Color → Swatch
Size → Button
Any other → Button
```

---

## 📚 Documentation Links

- **For Details**: See VARIANTS_IMPLEMENTATION_COMPLETE.md
- **For Reference**: See VARIANTS_DEVELOPER_GUIDE.md
- **For Analysis**: See VARIANTS_ANALYSIS_AND_FIXES.md
- **For Business**: See VARIANTS_IMPLEMENTATION_SUMMARY.md

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Copy new files | 2 min |
| Update ProductDetail | 5 min |
| Update ProductCard | 5 min |
| Update Marketplace | 2 min |
| Local testing | 10 min |
| Deploy | 5 min |
| **Total** | **~30 min** |

---

## ✨ That's It!

You now have everything you need to:
✅ Understand the system  
✅ Deploy it to production  
✅ Test and verify it works  
✅ Maintain and extend it  

**Ready to deploy!** 🚀

