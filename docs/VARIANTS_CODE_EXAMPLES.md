# Product Variants System - Code Examples & Integration Guide

## API Integration Examples

### Example 1: Creating a Simple Product (No Variants)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coffee Mug",
    "description": "Ceramic coffee mug, 12oz capacity",
    "price": 12.99,
    "category": "Home & Garden",
    "images": ["https://example.com/mug.jpg"],
    "sellerId": "seller-123"
  }'
```

**Response**:
```json
{
  "id": "prod-001",
  "name": "Coffee Mug",
  "price": 12.99,
  "category": "Home & Garden",
  "images": ["https://example.com/mug.jpg"],
  "sellerId": "seller-123",
  "totalStock": 0,
  "inStock": false,
  "variantGroups": [],
  "variants": [],
  "createdAt": "2024-01-02T10:00:00Z"
}
```

### Example 2: Creating a Product with Color Variants

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Men'\''s T-Shirt",
    "description": "Premium cotton t-shirt",
    "price": 29.99,
    "category": "Clothing",
    "images": ["https://example.com/tshirt.jpg"],
    "sellerId": "seller-456",
    "variantGroups": [
      {
        "name": "Color",
        "values": ["Black", "White", "Blue"]
      }
    ],
    "variants": [
      {
        "attributes": {"color": "Black"},
        "sku": "TS-BLACK",
        "price": 29.99,
        "stock": 50,
        "images": []
      },
      {
        "attributes": {"color": "White"},
        "sku": "TS-WHITE",
        "price": 29.99,
        "stock": 35,
        "images": []
      },
      {
        "attributes": {"color": "Blue"},
        "sku": "TS-BLUE",
        "price": 29.99,
        "stock": 25,
        "images": []
      }
    ]
  }'
```

**Response**:
```json
{
  "id": "prod-002",
  "name": "Men's T-Shirt",
  "price": 29.99,
  "category": "Clothing",
  "images": ["https://example.com/tshirt.jpg"],
  "totalStock": 110,
  "inStock": true,
  "variantGroups": [
    {
      "name": "Color",
      "values": ["Black", "White", "Blue"]
    }
  ],
  "variants": [
    {
      "id": "var-001",
      "attributes": {"color": "Black"},
      "sku": "TS-BLACK",
      "price": 29.99,
      "stock": 50,
      "reserved": 0
    },
    {
      "id": "var-002",
      "attributes": {"color": "White"},
      "sku": "TS-WHITE",
      "price": 29.99,
      "stock": 35,
      "reserved": 0
    },
    {
      "id": "var-003",
      "attributes": {"color": "Blue"},
      "sku": "TS-BLUE",
      "price": 29.99,
      "stock": 25,
      "reserved": 0
    }
  ]
}
```

### Example 3: Product with Color + Size Variants

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Hoodie",
    "description": "High-quality hoodie",
    "price": 49.99,
    "category": "Clothing",
    "images": ["https://example.com/hoodie.jpg"],
    "sellerId": "seller-789",
    "variantGroups": [
      {
        "name": "Color",
        "values": ["Black", "Gray"]
      },
      {
        "name": "Size",
        "values": ["S", "M", "L", "XL"]
      }
    ],
    "variants": [
      {
        "attributes": {"color": "Black", "size": "S"},
        "sku": "HD-BLACK-S",
        "stock": 20
      },
      {
        "attributes": {"color": "Black", "size": "M"},
        "sku": "HD-BLACK-M",
        "stock": 30
      },
      {
        "attributes": {"color": "Black", "size": "L"},
        "sku": "HD-BLACK-L",
        "stock": 25,
        "price": 54.99
      },
      {
        "attributes": {"color": "Black", "size": "XL"},
        "sku": "HD-BLACK-XL",
        "stock": 15,
        "price": 54.99
      },
      {
        "attributes": {"color": "Gray", "size": "S"},
        "sku": "HD-GRAY-S",
        "stock": 18
      },
      {
        "attributes": {"color": "Gray", "size": "M"},
        "sku": "HD-GRAY-M",
        "stock": 28
      },
      {
        "attributes": {"color": "Gray", "size": "L"},
        "sku": "HD-GRAY-L",
        "stock": 22,
        "price": 54.99
      },
      {
        "attributes": {"color": "Gray", "size": "XL"},
        "sku": "HD-GRAY-XL",
        "stock": 12,
        "price": 54.99
      }
    ]
  }'
```

### Example 4: Updating Product Variants

```bash
curl -X PUT http://localhost:3000/api/products/prod-002 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Men'\''s T-Shirt",
    "description": "Premium cotton t-shirt - Updated",
    "price": 32.99,
    "category": "Clothing",
    "images": ["https://example.com/tshirt-v2.jpg"],
    "variantGroups": [
      {
        "name": "Color",
        "values": ["Black", "White", "Blue", "Red"]
      }
    ],
    "variants": [
      {
        "attributes": {"color": "Black"},
        "sku": "TS-BLACK",
        "stock": 60,
        "price": 32.99
      },
      {
        "attributes": {"color": "White"},
        "sku": "TS-WHITE",
        "stock": 45,
        "price": 32.99
      },
      {
        "attributes": {"color": "Blue"},
        "sku": "TS-BLUE",
        "stock": 30,
        "price": 32.99
      },
      {
        "attributes": {"color": "Red"},
        "sku": "TS-RED",
        "stock": 0,
        "price": 34.99
      }
    ]
  }'
```

## Frontend Implementation Examples

### React Hook: useProductForm

```typescript
import { useState } from 'react'

interface Variant {
  id: string
  attributes: Record<string, string>
  sku: string
  price: string
  stock: string
  images: string[]
}

interface VariantGroup {
  id: string
  name: string
  values: string[]
}

export function useProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [error, setError] = useState('')

  const generateVariantCombinations = (groups: VariantGroup[]) => {
    const combinations: Record<string, string>[] = []

    function recurse(index: number, current: Record<string, string>) {
      if (index === groups.length) {
        combinations.push({ ...current })
        return
      }

      const group = groups[index]
      for (const value of group.values) {
        current[group.name] = value
        recurse(index + 1, current)
      }
    }

    recurse(0, {})
    return combinations
  }

  const handleGenerateVariants = () => {
    const combinations = generateVariantCombinations(variantGroups)
    const newVariants = combinations.map((attrs, idx) => {
      const attrStr = Object.values(attrs).join('-')
      return {
        id: Date.now().toString() + idx,
        attributes: attrs,
        sku: `${formData.name.toUpperCase()}-${attrStr}`,
        price: formData.price,
        stock: '0',
        images: [],
      }
    })
    setVariants(newVariants)
  }

  return {
    formData,
    setFormData,
    images,
    setImages,
    variantGroups,
    setVariantGroups,
    variants,
    setVariants,
    error,
    setError,
    generateVariantCombinations: handleGenerateVariants,
  }
}
```

### Component: VariantConfigurator

```typescript
interface VariantConfiguratorProps {
  variants: Variant[]
  onVariantUpdate: (id: string, field: string, value: string) => void
  onVariantRemove: (id: string) => void
}

export function VariantConfigurator({
  variants,
  onVariantUpdate,
  onVariantRemove,
}: VariantConfiguratorProps) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {variants.map((variant) => (
        <div key={variant.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <p className="font-semibold text-gray-900">
              {Object.values(variant.attributes).join(' - ')}
            </p>
            <button
              onClick={() => onVariantRemove(variant.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              value={variant.sku}
              onChange={(e) =>
                onVariantUpdate(variant.id, 'sku', e.target.value)
              }
              placeholder="SKU"
              className="px-3 py-2 border rounded"
            />
            <input
              type="number"
              step="0.01"
              value={variant.price}
              onChange={(e) =>
                onVariantUpdate(variant.id, 'price', e.target.value)
              }
              placeholder="Price override"
              className="px-3 py-2 border rounded"
            />
            <input
              type="number"
              value={variant.stock}
              onChange={(e) =>
                onVariantUpdate(variant.id, 'stock', e.target.value)
              }
              placeholder="Stock"
              className="px-3 py-2 border rounded"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Form Submission Handler

```typescript
async function handleSubmitProduct(
  formData: FormData,
  images: string[],
  variantGroups: VariantGroup[],
  variants: Variant[]
) {
  // Validate
  if (!formData.name || !formData.price || !formData.category) {
    throw new Error('Missing required fields')
  }

  if (images.length === 0) {
    throw new Error('At least one image required')
  }

  if (variants.length > 0 && variants.some(v => !v.stock)) {
    throw new Error('All variants need stock level')
  }

  // Prepare variant data
  const variantData = variants.length > 0 ? variants.map(v => ({
    attributes: v.attributes,
    sku: v.sku,
    price: v.price ? parseFloat(v.price) : undefined,
    stock: parseInt(v.stock) || 0,
    images: v.images,
  })) : undefined

  // Submit to API
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      images,
      sellerId: 'merchant-id',
      variantGroups: variantGroups.length > 0 ? variantGroups.map(g => ({
        name: g.name,
        values: g.values,
      })) : undefined,
      variants: variantData,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create product')
  }

  return response.json()
}
```

## Database Query Examples

### Prisma: Create Product with Variants

```typescript
const product = await prisma.product.create({
  data: {
    name: 'Men\'s T-Shirt',
    description: 'Premium cotton t-shirt',
    price: 29.99,
    category: 'Clothing',
    images: ['url1', 'url2'],
    sellerId: 'seller-123',
    totalStock: 110,
    inStock: true,
    variantGroups: {
      create: [
        {
          name: 'Color',
          values: ['Black', 'White', 'Blue'],
        },
      ],
    },
    variants: {
      create: [
        {
          attributes: { color: 'Black' },
          sku: 'TS-BLACK',
          price: 29.99,
          stock: 50,
        },
        {
          attributes: { color: 'White' },
          sku: 'TS-WHITE',
          price: 29.99,
          stock: 35,
        },
        {
          attributes: { color: 'Blue' },
          sku: 'TS-BLUE',
          price: 29.99,
          stock: 25,
        },
      ],
    },
  },
  include: {
    variantGroups: true,
    variants: true,
  },
})
```

### Prisma: Fetch Product with Variants

```typescript
const product = await prisma.product.findUnique({
  where: { id: 'prod-001' },
  include: {
    seller: {
      select: {
        id: true,
        businessName: true,
      },
    },
    variantGroups: {
      select: {
        name: true,
        values: true,
      },
    },
    variants: {
      where: { active: true },
      select: {
        id: true,
        attributes: true,
        sku: true,
        price: true,
        stock: true,
        weight: true,
        dimensions: true,
      },
    },
  },
})
```

### Prisma: Find Variant by Attributes

```typescript
const variant = await prisma.productVariant.findFirst({
  where: {
    productId: 'prod-001',
    attributes: {
      equals: { color: 'Black', size: 'M' },
    },
  },
})
```

### Prisma: Update Variant Stock

```typescript
const updated = await prisma.productVariant.update({
  where: { id: 'var-001' },
  data: {
    stock: 45,
  },
})

// Also update product totalStock
const newTotal = await prisma.productVariant.aggregate({
  where: { productId: 'prod-001' },
  _sum: { stock: true },
})

await prisma.product.update({
  where: { id: 'prod-001' },
  data: {
    totalStock: newTotal._sum.stock || 0,
  },
})
```

## Shopping Cart Integration

### Adding Variant to Cart

```typescript
interface CartItem {
  productId: string
  variantId: string
  variantAttributes: Record<string, string>
  sku: string
  price: number
  quantity: number
}

function addToCart(
  productId: string,
  variantId: string | undefined,
  variantAttributes: Record<string, string>,
  quantity: number,
  price: number,
  sku: string
) {
  const cartItem: CartItem = {
    productId,
    variantId: variantId || '',
    variantAttributes,
    sku,
    price,
    quantity,
  }

  // Add to cart context/state
  addItem(cartItem)
}
```

### Cart Display Component

```typescript
export function CartItems({ items }: { items: CartItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.variantId} className="flex justify-between border-b p-4">
          <div>
            <p className="font-semibold">{item.productId}</p>
            {Object.entries(item.variantAttributes).length > 0 && (
              <p className="text-sm text-gray-600">
                {Object.entries(item.variantAttributes)
                  .map(([key, val]) => `${key}: ${val}`)
                  .join(', ')}
              </p>
            )}
            <p className="text-xs text-gray-500">SKU: {item.sku}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">${item.price.toFixed(2)}</p>
            <p className="text-sm">Qty: {item.quantity}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Migration Scripts

### Creating Variants from Existing Products

```typescript
// If you have products with old color/type arrays and want to migrate them

async function migrateProductToVariants(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) return

  // Create variant groups from colors and types
  const groups = []

  if (product.colors && product.colors.length > 0) {
    groups.push({
      name: 'Color',
      values: product.colors,
    })
  }

  if (product.types && product.types.length > 0) {
    groups.push({
      name: 'Type',
      values: product.types,
    })
  }

  // Generate combinations
  const combinations = generateCartesian(groups)

  // Create variants
  const variants = combinations.map((combo) => ({
    attributes: combo,
    sku: `${product.name.toUpperCase()}-${Object.values(combo).join('-')}`,
    stock: product.stock || 0,
    price: undefined, // Use base price
  }))

  // Update product
  await prisma.product.update({
    where: { id: productId },
    data: {
      variantGroups: {
        create: groups,
      },
      variants: {
        create: variants,
      },
      totalStock: (product.stock || 0) * Math.max(1, variants.length),
    },
  })
}
```

## Testing Examples

### Test: Create Product with Variants

```typescript
describe('POST /api/products', () => {
  it('should create product with variants', async () => {
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test T-Shirt',
        price: 29.99,
        category: 'Clothing',
        images: ['test.jpg'],
        sellerId: 'seller-123',
        variantGroups: [
          { name: 'Color', values: ['Red', 'Blue'] },
          { name: 'Size', values: ['S', 'M'] },
        ],
        variants: [
          { attributes: { color: 'Red', size: 'S' }, sku: 'TS-RED-S', stock: 10 },
          { attributes: { color: 'Red', size: 'M' }, sku: 'TS-RED-M', stock: 15 },
          { attributes: { color: 'Blue', size: 'S' }, sku: 'TS-BLUE-S', stock: 20 },
          { attributes: { color: 'Blue', size: 'M' }, sku: 'TS-BLUE-M', stock: 25 },
        ],
      }),
    })

    expect(response.status).toBe(201)
    const product = await response.json()
    expect(product.totalStock).toBe(70)
    expect(product.variants).toHaveLength(4)
  })
})
```

### Test: Variant Generation Algorithm

```typescript
describe('generateVariantCombinations', () => {
  it('should generate all combinations', () => {
    const groups = [
      { name: 'Color', values: ['Red', 'Blue'] },
      { name: 'Size', values: ['S', 'M', 'L'] },
    ]

    const combinations = generateVariantCombinations(groups)

    expect(combinations).toHaveLength(6) // 2 × 3
    expect(combinations).toContainEqual({ color: 'Red', size: 'S' })
    expect(combinations).toContainEqual({ color: 'Blue', size: 'L' })
  })
})
```

## Troubleshooting Guide

### Issue: Variant SKU Conflicts

**Problem**: Duplicate SKU error when creating variants

**Solution**: Ensure each SKU is unique:
```typescript
// Bad
variants: [
  { sku: 'TS-001', attributes: { color: 'Red' } },
  { sku: 'TS-001', attributes: { color: 'Blue' } }, // Duplicate!
]

// Good
variants: [
  { sku: 'TS-RED', attributes: { color: 'Red' } },
  { sku: 'TS-BLUE', attributes: { color: 'Blue' } },
]
```

### Issue: Stock Calculation Wrong

**Problem**: totalStock doesn't match variant stocks

**Solution**: Check variant creation query:
```typescript
// Ensure all variants are created
const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0)

await prisma.product.update({
  where: { id: productId },
  data: { totalStock }, // Set correct total
})
```

### Issue: Variants Not Showing

**Problem**: Query doesn't return variants

**Solution**: Use correct select/include:
```typescript
// Correct
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    variants: { where: { active: true } },
  },
})

// Wrong (missing include)
const product = await prisma.product.findUnique({
  where: { id: productId },
})
```
