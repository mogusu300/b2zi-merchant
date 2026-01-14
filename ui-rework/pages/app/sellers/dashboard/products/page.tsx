"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, X, Upload, ChevronDown } from "lucide-react"
import Link from "next/link"

interface ColorVariant {
  color: string
}

interface TypeVariant {
  type: string
  price?: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  colors?: string[]
  colorVariants?: ColorVariant[]
  types?: string[]
  typeVariants?: TypeVariant[]
  inStock: boolean
}

export default function EditProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Handicrafts",
    stock: "10",
  })
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([])
  const [typeVariants, setTypeVariant] = useState<TypeVariant[]>([])
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [colorSearchOpen, setColorSearchOpen] = useState(false)
  const [colorSearchQuery, setColorSearchQuery] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [newType, setNewType] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Fetch available colors
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const products = await response.json()
          const colors = new Set<string>()
          products.forEach((product: any) => {
            if (product.variants) {
              product.variants.forEach((variant: any) => {
                if (variant.attributes?.color) {
                  colors.add(variant.attributes.color)
                }
              })
            }
          })
          setAvailableColors(Array.from(colors).sort())
        }
      } catch (err) {
        console.error("Failed to fetch colors:", err)
      }
    }
    fetchColors()
  }, [])

  // Fetch product data
  useEffect(() => {
    if (!productId) {
      router.push("/sellers/dashboard/products")
      return
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products`)
        const allProducts = await res.json()
        const product = allProducts.find((p: any) => p.id === productId)

        if (!product) {
          setError("Product not found")
          return
        }

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          stock: (product.totalStock || 10).toString(),
        })
        setImages(product.images || [])

        // Try to get color and type variants from the product metadata if available
        if (product.colorVariants && Array.isArray(product.colorVariants)) {
          setColorVariants(product.colorVariants)
        }
        if (product.typeVariants && Array.isArray(product.typeVariants)) {
          setTypeVariant(product.typeVariants)
        }
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!file.type.startsWith("image/")) {
          setError(`${file.name} is not an image file`)
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is larger than 10MB`)
          continue
        }

        const formDataToUpload = new FormData()
        formDataToUpload.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataToUpload,
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Upload failed")
          continue
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
      }

      setImages([...images, ...uploadedUrls])
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      e.currentTarget.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const filteredColors = colorSearchQuery
    ? availableColors.filter(color => 
        color.toLowerCase().includes(colorSearchQuery.toLowerCase())
      )
    : availableColors

  const handleAddColor = (color: string) => {
    if (!colorVariants.some(c => c.color === color)) {
      setColorVariants([...colorVariants, { color }])
    }
    setColorSearchQuery("")
    setColorSearchOpen(false)
  }

  const handleRemoveColor = (index: number) => {
    setColorVariants(colorVariants.filter((_, i) => i !== index))
  }

  const handleAddType = () => {
    if (newType.trim() && !typeVariants.some(t => t.type === newType.trim())) {
      setTypeVariant([...typeVariants, { type: newType.trim(), price: undefined }])
      setNewType("")
    }
  }

  const handleRemoveType = (index: number) => {
    setTypeVariant(typeVariants.filter((_, i) => i !== index))
  }

  const updateTypePrice = (index: number, price: string) => {
    const updated = [...typeVariants]
    updated[index].price = price
    setTypeVariant(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        setError("Please fill in all required fields")
        setSaving(false)
        return
      }

      if (images.length === 0) {
        setError("Please keep at least one product image")
        setSaving(false)
        return
      }

      const merchantData = localStorage.getItem("b2zi_merchant")
      if (!merchantData) {
        setError("You must be logged in to edit products")
        setSaving(false)
        return
      }

      const merchant = JSON.parse(merchantData)

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        images: images,
        colorVariants: colorVariants,
        typeVariants: typeVariants,
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to update product")
        return
      }

      router.push("/sellers/dashboard/products")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading product...</div>
  }

  if (error && loading) {
    return <div className="text-center py-12 text-red-600">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sellers/dashboard/products">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-black">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update your product details</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Basic details about your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Handcrafted Basket"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500">
                  {parseInt(formData.stock) > 0 ? "✓ In Stock" : "❌ Out of Stock"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e3621]"
                  required
                >
                  <option>Handicrafts</option>
                  <option>Food & Beverages</option>
                  <option>Clothing & Textiles</option>
                  <option>Electronics</option>
                  <option>Home & Garden</option>
                  <option>Beauty & Health</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images *</CardTitle>
            <CardDescription>Upload images from your device (JPEG, PNG, WebP - Max 10MB each)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#2e3621] transition">
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
                className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? "opacity-50" : ""}`}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                </span>
                <span className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</span>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Images ({images.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                        <div className="absolute top-1 left-1 bg-[#2e3621] text-white px-2 py-1 rounded text-xs">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🎨 Step 1: Add Color Options</span>
            </CardTitle>
            <CardDescription>Select color options from existing colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Dropdown with Search */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setColorSearchOpen(!colorSearchOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 transition"
              >
                <span className="text-gray-600">
                  {colorVariants.length > 0 ? `${colorVariants.length} color(s) selected` : "Select colors..."}
                </span>
                <ChevronDown className={`w-4 h-4 transition ${colorSearchOpen ? 'rotate-180' : ''}`} />
              </button>

              {colorSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <Input
                    type="text"
                    placeholder="Search colors..."
                    value={colorSearchQuery}
                    onChange={(e) => setColorSearchQuery(e.target.value)}
                    className="border-0 border-b rounded-t-lg focus:ring-0"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {filteredColors.length > 0 ? (
                      filteredColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleAddColor(color)}
                          disabled={colorVariants.some(c => c.color === color)}
                          className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" style={{ backgroundColor: color.toLowerCase() }} />
                          {color}
                          {colorVariants.some(c => c.color === color) && (
                            <span className="ml-auto text-blue-600">✓</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">No colors found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Colors */}
            {colorVariants.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Selected Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {colorVariants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" style={{ backgroundColor: variant.color.toLowerCase() }} />
                      <span className="font-medium text-gray-900">{variant.color}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-red-600 hover:text-red-800 ml-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Types/Variants with Pricing */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">📏 Step 2: Add Types/Sizes (Optional)</span>
            </CardTitle>
            <CardDescription>Add different types, sizes, or variants and optional prices for each</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="e.g., Small, Medium, Large"
                onKeyPress={(e) => e.key === "Enter" && handleAddType()}
              />
              <Button type="button" onClick={handleAddType} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4" />
                Add Type
              </Button>
            </div>

            {typeVariants.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Type/Size Options with Prices:</p>
                {typeVariants.map((variant, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-medium text-gray-900 min-w-[80px]">{variant.type}</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Optional price override"
                      value={variant.price || ""}
                      onChange={(e) => updateTypePrice(idx, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    {variant.price && (
                      <span className="text-sm text-gray-500">${parseFloat(variant.price).toFixed(2)}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveType(idx)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Link href="/sellers/dashboard/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving} className="bg-[#2e3621] hover:bg-black">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
