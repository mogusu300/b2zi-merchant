# Product Variants UI - Visual Reference

## New Product Creation Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    ADD NEW PRODUCT                             │
│   Create a product with variants similar to eBay and modern    │
│   e-commerce platforms                                         │
└────────────────────────────────────────────────────────────────┘

SECTION 1: BASIC INFORMATION
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│ Product Name *                                               │
│ [e.g., Men's Casual T-Shirt_____________________________]    │
│                                                               │
│ Description                                                  │
│ [Describe your product in detail...                         │
│  _________________________________________________________] │
│                                                               │
│ Base Price ($) *  │  Category *                              │
│ [0.00________]    │  [Select category ▼]                    │
│ Variants can override │                                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘

SECTION 2: PRODUCT VARIANTS
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│ Add variant groups (e.g., Color, Size) to create multiple    │
│ SKUs. This is optional - simple products don't need variants.│
│                                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Variant Type (e.g., Color, Size)                       │  │
│ │ [Color_________________________________]               │  │
│ │                                                          │  │
│ │ Values (comma-separated)                               │  │
│ │ [Red, Blue, Green_____________________]                │  │
│ │                                                          │  │
│ │ [+ Add Variant Group]                                  │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                               │
│ Current Variant Groups:                                      │
│ ┌──────────────────────────────────────────┐               │
│ │ Color                              [✕]    │               │
│ │ Red, Blue, Green                           │               │
│ └──────────────────────────────────────────┘               │
│ ┌──────────────────────────────────────────┐               │
│ │ Size                               [✕]    │               │
│ │ S, M, L, XL                                │               │
│ └──────────────────────────────────────────┘               │
│                                                               │
│ [Generate All Variant Combinations]                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘

SECTION 3: VARIANT DETAILS (After Generation)
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│ Set SKU, price override, and stock for each variant.         │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Red - S                                           [✕]  │  │
│ │                                                        │  │
│ │ SKU              │ Price Override  │ Stock            │  │
│ │ [MEN-S-T-RED] │ [base price___] │ [10___]          │  │
│ └────────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Red - M                                           [✕]  │  │
│ │                                                        │  │
│ │ SKU              │ Price Override  │ Stock            │  │
│ │ [MEN-S-T-RED] │ [base price___] │ [25___]          │  │
│ └────────────────────────────────────────────────────────┘  │
│ ... (12 more variants for full 3 colors × 5 sizes)          │
│                                                               │
└──────────────────────────────────────────────────────────────┘

SECTION 4: PRODUCT IMAGES
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ ┌──────────┐                                          │    │
│ │ │          │ Click to upload or drag and drop         │    │
│ │ │ [📤]     │ PNG, JPG, WebP up to 10MB each           │    │
│ │ │          │                                          │    │
│ │ └──────────┘                                          │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                               │
│ Uploaded Images (3)                                          │
│ ┌──────┐  ┌──────┐  ┌──────┐                                │
│ │ [✓]  │  │      │  │      │                                │
│ │Prime │  │Image2│  │Image3│                                │
│ │      │  │      │  │      │                                │
│ └──────┘  └──────┘  └──────┘                                │
│                                                               │
└──────────────────────────────────────────────────────────────┘

FOOTER BUTTONS
[Cancel]                                [Create Product]
```

## Section-by-Section Breakdown

### Basic Information Section
```
PURPOSE: Collect essential product metadata

Fields:
├─ Product Name: Text input (required)
│  └─ Example: "Men's Casual T-Shirt"
│
├─ Description: Text area (optional)
│  └─ Example: "Made from 100% cotton, comfortable fit, available
│     in multiple colors and sizes. Perfect for everyday wear."
│
├─ Base Price: Number input (required)
│  └─ Default: Used for all variants unless overridden
│     Example: 29.99
│
└─ Category: Dropdown selector (required)
   └─ Options: Electronics, Clothing, Home & Garden, etc.

UI Pattern: Card layout with clear labels and placeholders
Validation: All marked with * are required before submit
```

### Product Variants Section
```
PURPOSE: Define variant dimensions and generate combinations

Workflow:
1. Input variant type and values
   ├─ Type: Single word (Color, Size, Material)
   └─ Values: Comma-separated list (Red, Blue, Green)

2. Click "Add Variant Group"
   └─ Group added to list

3. System shows current variant groups
   ├─ Displays name and values
   └─ Option to remove each group

4. Once groups defined, generate combinations
   └─ Automatically creates all SKUs

UI Components:
├─ Input fields (disabled after first group until reset)
├─ Button to add group
├─ List of added groups with delete buttons
├─ Generation button (appears when groups defined)
└─ Reset button (appears when variants generated)

Constraints:
├─ Can only add one variant type at a time
├─ Must complete setup before adding another
└─ Can reset and start over
```

### Variant Details Section
```
PURPOSE: Customize each generated variant

Appears Only When: Variants have been generated

For Each Variant Shows:
├─ Attribute combination display
│  └─ "Red - S", "Red - M", "Blue - L", etc.
│
└─ Three configurable fields:
   ├─ SKU (Stock Keeping Unit)
   │  ├─ Auto-generated initially
   │  ├─ Editable by seller
   │  └─ Must be unique per product
   │
   ├─ Price Override (optional)
   │  ├─ Placeholder shows "base price"
   │  ├─ Leave blank to use product base price
   │  └─ Enter custom price if needed
   │
   └─ Stock (required for each variant)
      ├─ Must be number
      └─ Can be 0 (out of stock)

Layout:
├─ Each variant in scrollable container
├─ 3-column grid for SKU | Price | Stock
├─ Delete button for each variant (✕)
└─ Compact, scannable layout

Max Height: 400px with vertical scroll for many variants
```

### Product Images Section
```
PURPOSE: Upload primary product images

Features:
├─ Drag & drop upload area
├─ Click to browse files
├─ Multiple file selection
├─ Progress indicator while uploading
├─ Image preview grid after upload
├─ Remove button on hover
└─ Primary image badge on first image

Upload Validation:
├─ File type: Must be image (PNG, JPG, WebP)
├─ File size: Max 10MB per file
├─ File count: No limit, but at least 1 required
└─ Error messages shown inline

Preview Layout:
├─ 4-column grid on desktop
├─ 2-column grid on mobile
├─ Aspect ratio: 1:1 (square)
├─ Shows image thumbnail
├─ Delete button on hover
└─ "Primary" badge on first image

Notes:
├─ First uploaded image = primary/thumbnail
├─ Used in product listings
└─ Additional images for detail view
```

## User Interactions

### Happy Path: Create T-Shirt with Colors and Sizes

```
Step 1: Fill Basic Info
  │
  ├─ Name: "Men's Premium Cotton T-Shirt" ✓
  ├─ Description: "High-quality 100% cotton..." ✓
  ├─ Price: "29.99" ✓
  └─ Category: "Clothing" ✓

Step 2: Add Color Variant
  │
  ├─ Type: "Color"
  ├─ Values: "Black, White, Blue, Red"
  └─ Click "Add Variant Group" ✓

Step 3: Add Size Variant
  │
  ├─ Type: "Size"
  ├─ Values: "XS, S, M, L, XL, 2XL"
  └─ Click "Add Variant Group" ✓

Step 4: Generate Combinations
  │
  └─ Click "Generate All Variant Combinations" ✓
     (System creates 24 variants: 4 colors × 6 sizes)

Step 5: Configure Variants
  │
  ├─ Review auto-generated SKUs
  ├─ Edit if needed (e.g., "TS-BLACK-XS" instead of auto)
  ├─ Set stock for each (e.g., Black-S: 50, Black-M: 75, etc.)
  └─ Leave price blank (uses base $29.99) ✓

Step 6: Upload Images
  │
  ├─ Drag photos into upload area
  └─ 4 images uploaded ✓

Step 7: Submit
  │
  └─ Click "Create Product" ✓
     → Product created with 24 variants
     → Redirected to products list
```

### Alternative: Create Simple Product (No Variants)

```
Step 1: Fill Basic Info
  │
  ├─ Name: "Coffee Mug" ✓
  ├─ Description: "Ceramic mug, 12oz" ✓
  ├─ Price: "12.99" ✓
  └─ Category: "Home & Garden" ✓

Step 2: Skip Variants
  │
  └─ Leave "Variant Type" empty
     (Variants section is optional)

Step 3: Upload Image
  │
  └─ Upload mug photo ✓

Step 4: Submit
  │
  └─ Click "Create Product" ✓
     → Simple product created
     → No variants, just one listing
```

## Responsive Design

### Desktop (1200px+)
```
┌─────────────────────────────────────────────────┐
│ Basic Information                               │
│ ┌─────────────────┐  ┌─────────────────┐       │
│ │ Price input     │  │ Category select │       │
│ └─────────────────┘  └─────────────────┘       │
│                                                  │
│ Variant Details                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ SKU | Price Override | Stock             │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ Images                                          │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐                           │
│ │  │ │  │ │  │ │  │  (4 columns)               │
│ └──┘ └──┘ └──┘ └──┘                           │
└─────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌────────────────────────────────────┐
│ Basic Information                  │
│ ┌──────────────┐ ┌──────────────┐ │
│ │ Price        │ │ Category     │ │
│ └──────────────┘ └──────────────┘ │
│                                     │
│ Variant Details                     │
│ ┌──────────────┐ ┌──────────────┐ │
│ │ SKU          │ │ Price        │ │
│ │ Stock        │ │              │ │
│ └──────────────┘ └──────────────┘ │
│                                     │
│ Images (2 columns)                  │
│ ┌──────┐ ┌──────┐                  │
│ │      │ │      │                  │
│ └──────┘ └──────┘                  │
└────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────────┐
│ Product Name         │
│ [_________________]  │
│                      │
│ Price                │
│ [_________]          │
│                      │
│ Category             │
│ [▼ Select]           │
│                      │
│ Variant Type         │
│ [_________________]  │
│                      │
│ Values               │
│ [_________________]  │
│ [+ Add Group]        │
│                      │
│ Variants             │
│ [Config 1          ] │
│ [Config 2          ] │
│ ... (scrollable)     │
│                      │
│ Images (1 column)    │
│ [__________________] │
│ [__________________] │
│                      │
│ [Cancel] [Create]    │
└──────────────────────┘
```

## Error States

### Missing Required Field
```
┌────────────────────────────────────┐
│ ⚠️ Please fill in all required      │
│    fields                           │
│    - Product Name                  │
│    - Base Price                    │
│    - Category                      │
└────────────────────────────────────┘
```

### Invalid Stock Setup
```
┌────────────────────────────────────┐
│ ⚠️ At least one variant needs stock │
│    to be greater than 0            │
└────────────────────────────────────┘
```

### Duplicate SKU
```
┌────────────────────────────────────┐
│ ⚠️ SKU "TS-RED-M" already used.     │
│    Please use unique SKU.          │
└────────────────────────────────────┘
```

## Loading States

### Image Upload Progress
```
Uploading... [████████░░] 80%
```

### Variant Generation
```
Generating 24 variants...
[████████████░░░] Processing
```

### Product Creation
```
Creating... Please wait
[████████████████] 100%
```

## Success State

```
✓ Product created successfully!
  
  Product: Men's T-Shirt
  Variants: 24
  Total Stock: 485 units
  
  Redirecting to products list...
```
