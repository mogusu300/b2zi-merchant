'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VariantGroup {
  id: string
  name: string
  values: string[]
}

interface Variant {
  id: string
  attributes: Record<string, string>
  sku: string
  price: string
  stock: string
  images: string[]
}

interface FormData {
  name: string
  description: string
  price: string
  category: string
}

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Beauty & Personal Care',
  'Toys & Games',
  'Books',
  'Art & Crafts',
]

export default function AddProduct() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupValues, setNewGroupValues] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`)
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is larger than 10MB`)
          continue
        }

        const formDataToUpload = new FormData()
        formDataToUpload.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToUpload,
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Upload failed')
          continue
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
      }

      setImages([...images, ...uploadedUrls])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.currentTarget.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addVariantGroup = () => {
    if (!newGroupName.trim() || !newGroupValues.trim()) {
      setError('Please enter group name and values')
      return
    }

    const values = newGroupValues.split(',').map(v => v.trim()).filter(Boolean)
    if (values.length === 0) {
      setError('Please enter at least one value')
      return
    }

    const newGroup: VariantGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      values,
    }

    setVariantGroups([...variantGroups, newGroup])
    setNewGroupName('')
    setNewGroupValues('')
    setError('')
  }

  const removeVariantGroup = (id: string) => {
    setVariantGroups(variantGroups.filter(g => g.id !== id))
    setVariants(variants.filter(v => {
      const attrs = v.attributes
      return !Object.keys(attrs).some(key => variantGroups.find(g => g.id === id)?.name === key)
    }))
  }

  const generateVariantCombinations = () => {
    if (variantGroups.length === 0) {
      setError('Please add at least one variant group')
      return
    }

    const groups = variantGroups.map(g => ({ name: g.name, values: g.values }))
    const combinations: Record<string, string>[] = []

    function generateCombinations(index: number, current: Record<string, string>) {
      if (index === groups.length) {
        combinations.push({ ...current })
        return
      }

      const group = groups[index]
      for (const value of group.values) {
        current[group.name] = value
        generateCombinations(index + 1, current)
      }
    }

    generateCombinations(0, {})

    const newVariants = combinations.map((attrs, idx) => {
      const attrStr = Object.values(attrs).join('-')
      return {
        id: Date.now().toString() + idx,
        attributes: attrs,
        sku: `${formData.name.toUpperCase()}-${attrStr}`.replace(/\s+/g, '-').substring(0, 50),
        price: formData.price,
        stock: '10', // Default stock of 10 units per variant
        images: [],
      }
    })

    setVariants(newVariants)
    setError('')
  }

  const updateVariant = (id: string, field: string, value: string) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.name || !formData.price || !formData.category) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      if (images.length === 0) {
        setError('Please upload at least one product image')
        setLoading(false)
        return
      }

      const merchant = JSON.parse(localStorage.getItem('b2zi_merchant') || '{}')
      if (!merchant.id) {
        router.push('/admin')
        return
      }

      // If variants are defined, use them; otherwise create a default variant with 10 units
      const variantData = variants.length > 0 ? variants.map(v => ({
        attributes: v.attributes,
        sku: v.sku,
        price: v.price ? parseFloat(v.price) : undefined,
        stock: Math.max(1, parseInt(v.stock) || 10), // Ensure minimum stock of 10
        images: v.images,
      })) : [{
        // Default variant with 10 units if no variants specified
        attributes: {},
        sku: `${formData.name.toUpperCase()}-DEFAULT`,
        price: parseFloat(formData.price),
        stock: 10,
        images: [],
      }]

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          images,
          sellerId: merchant.id,
          variantGroups: variantGroups.length > 0 ? variantGroups.map(g => ({
            name: g.name,
            values: g.values,
          })) : undefined,
          variants: variantData,
        }),
      })

      if (response.ok) {
        router.push('/sellers/products')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create product')
      }
    } catch (err) {
      console.error('Submit failed:', err)
      setError('An error occurred while creating the product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a product with variants similar to eBay and modern e-commerce platforms</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Basic Product Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Basic Information</h2>
            
            {/* Product Name */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Men's Casual T-Shirt"
                  className="mt-1"
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product in detail..."
                  className="mt-1"
                  rows={4}
                  disabled={loading}
                />
              </div>

              {/* Price & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Base Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="mt-1"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Variants can override this price</p>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={handleSelectChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Variant Management */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Product Variants</h2>
            <p className="text-sm text-gray-600 mb-6">
              Add variant groups (e.g., Color, Size) to create multiple SKUs. This is optional - simple products don't need variants.
            </p>

            {/* Variant Groups */}
            <div className="space-y-4">
              {variantGroups.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">Variant Groups</Label>
                  {variantGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                      <div>
                        <p className="font-medium text-gray-900">{group.name}</p>
                        <p className="text-sm text-gray-600">{group.values.join(', ')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariantGroup(group.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Variant Group */}
              <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-blue-900">Step 1: Add a Variant Group</p>
                  <p className="text-xs text-blue-700 mt-1">Create variations like colors, sizes, or materials</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Variant Type (e.g., Color, Size, Material)</Label>
                    <Input
                      id="groupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Color"
                      className="mt-1"
                      disabled={loading || variantGroups.length > 0}
                    />
                    <p className="text-xs text-gray-500 mt-1">Examples: Color, Size, Material, Style</p>
                  </div>
                  <div>
                    <Label htmlFor="groupValues">Variant Values (comma-separated)</Label>
                    <Input
                      id="groupValues"
                      value={newGroupValues}
                      onChange={(e) => setNewGroupValues(e.target.value)}
                      placeholder="e.g., Red, Blue, Green"
                      className="mt-1"
                      disabled={loading || variantGroups.length > 0}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate each option with a comma. Example: Red, Blue, Green, Black</p>
                  </div>
                  <Button
                    type="button"
                    onClick={addVariantGroup}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    disabled={loading || variantGroups.length > 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant Group
                  </Button>
                  {variantGroups.length > 0 && (
                    <div className="bg-green-100 border border-green-300 rounded p-3 mt-4">
                      <p className="text-sm font-semibold text-green-900">✓ Added: {variantGroups.map(g => `"${g.name}"`).join(', ')}</p>
                      <p className="text-xs text-green-700 mt-1">Next: Click "Generate Variants" below to create all combinations</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Generate Variants */}
              {variantGroups.length > 0 && variants.length === 0 && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <p className="text-sm font-semibold text-yellow-900">Step 2: Generate All Variant Combinations</p>
                    <p className="text-xs text-yellow-700 mt-2">
                      This will create all possible combinations. For example:
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      • Color (Red, Blue) + Size (S, M) = 4 variants: Red-S, Red-M, Blue-S, Blue-M
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={generateVariantCombinations}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate All Variant Combinations
                  </Button>
                </div>
              )}

              {/* Reset Variants */}
              {variants.length > 0 && (
                <Button
                  type="button"
                  onClick={() => setVariants([])}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Reset & Regenerate Variants
                </Button>
              )}
            </div>
          </Card>

          {/* Variants Details */}
          {variants.length > 0 && (
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-900">Step 3: Set Variant Prices & Stock</h2>
                <p className="text-sm text-gray-600">
                  Set a custom price and stock quantity for each variant. Leave price blank to use the base price (${formData.price || '0.00'}).
                </p>
              </div>
              
              {/* Total Stock Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">📦 Total Inventory Across All Variants</p>
                    <p className="text-xs text-blue-700 mt-1">Sum of stock from all {variants.length} variant combinations</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-900">
                      {variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0) > 0 ? '✓ In Stock' : '⚠ Out of Stock'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {variants.map((variant) => {
                  const variantStock = parseInt(variant.stock) || 0
                  const isLowStock = variantStock < 5 && variantStock > 0
                  const isOutOfStock = variantStock === 0
                  const displayPrice = variant.price ? `$${parseFloat(variant.price).toFixed(2)}` : `$${formData.price || '0.00'} (base)`
                  
                  return (
                    <div 
                      key={variant.id} 
                      className={`border-2 rounded-lg p-4 ${
                        isOutOfStock ? 'bg-red-50 border-red-200' : 
                        isLowStock ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">
                            {Object.values(variant.attributes).join(' → ')}
                          </p>
                          <p className="text-sm font-semibold text-green-700 mt-1">
                            Price: {displayPrice}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              isOutOfStock ? 'bg-red-100 text-red-800' :
                              isLowStock ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {isOutOfStock ? '❌ OUT OF STOCK' : 
                               isLowStock ? '⚠️ LOW STOCK' :
                               '✓ IN STOCK'}
                            </span>
                            <span className="text-xs text-gray-700 font-medium">
                              {variantStock} unit{variantStock !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 p-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-current border-opacity-20">
                        <div>
                          <Label className="text-xs font-bold">SKU</Label>
                          <Input
                            value={variant.sku}
                            onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                            className="mt-1 text-sm"
                            placeholder="AUTO"
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 mt-1">Unique identifier</p>
                        </div>
                        <div>
                          <Label className="text-xs font-bold text-green-700">Price Override ($)</Label>
                          <Input
                            value={variant.price}
                            onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                            type="number"
                            step="0.01"
                            className="mt-1 text-sm font-semibold"
                            placeholder={formData.price || "0.00"}
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty for base price</p>
                        </div>
                        <div>
                          <Label className="text-xs font-bold">Stock Units *</Label>
                          <Input
                            value={variant.stock}
                            onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                            type="number"
                            min="0"
                            className="mt-1 text-sm font-semibold"
                            placeholder="10"
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 mt-1">Available quantity</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Product Images */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Product Images</h2>
            
            <Label htmlFor="images">Product Images *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-600 transition mt-4">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="images"
                className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50' : ''}`}
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </span>
                <span className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB each</span>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-4">Uploaded Images ({images.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 pb-8">
            <Link href="/sellers/products" className="flex-1">
              <Button variant="outline" className="w-full" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
