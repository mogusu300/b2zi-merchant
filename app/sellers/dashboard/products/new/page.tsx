"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

export default function AddProductPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Handicrafts",
    stock: "10",
    inStock: true,
  })
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([])
  const [typeVariants, setTypeVariant] = useState<TypeVariant[]>([])
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [colorSearchOpen, setColorSearchOpen] = useState(false)
  const [colorSearchQuery, setColorSearchQuery] = useState("")

  const [images, setImages] = useState<string[]>([])
  const [newType, setNewType] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  // Fetch available colors on mount
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const products = await response.json()
          // Extract unique colors from all products
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle file selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file
        if (!file.type.startsWith("image/")) {
          setError(`${file.name} is not an image file`)
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is larger than 10MB`)
          continue
        }

        // Upload file
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
      setError("") // Clear error if some uploads succeeded
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      e.currentTarget.value = "" // Reset file input
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
    setLoading(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      if (images.length === 0) {
        setError("Please upload at least one product image")
        setLoading(false)
        return
      }

      const merchantData = localStorage.getItem("b2zi_merchant")
      if (!merchantData) {
        setError("You must be logged in to add products")
        setLoading(false)
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
        colors: colorVariants.map(c => c.color),
        types: typeVariants.map(t => t.type),
        colorVariants: colorVariants,
        typeVariants: typeVariants,
        inStock: parseInt(formData.stock) > 0,
        sellerId: merchant.id,
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create product")
        return
      }

      // Redirect back to products page
      router.push("/sellers/dashboard/products")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground mt-1">Create a new product to list in your store</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
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
                <p className="text-xs text-muted-foreground">
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition">
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
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                </span>
                <span className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</span>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Uploaded Images ({images.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full aspect-square bg-secondary rounded-lg overflow-hidden border border-border">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-background p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-background px-2 py-1 rounded text-xs">
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

        {/* Colors with Pricing */}
        <Card className="border-2 border-primary/30 bg-primary/10">
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
                className="w-full px-3 py-2 border border-border rounded-lg flex items-center justify-between bg-background hover:bg-secondary transition"
              >
                <span className="text-muted-foreground">
                  {colorVariants.length > 0 ? `${colorVariants.length} color(s) selected` : "Select colors..."}
                </span>
                <ChevronDown className={`w-4 h-4 transition ${colorSearchOpen ? 'rotate-180' : ''}`} />
              </button>

              {colorSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-10">
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
                          className={`w-full text-left px-4 py-2 hover:bg-primary/10 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-border" style={{ backgroundColor: color.toLowerCase() }} />
                          {color}
                          {colorVariants.some(c => c.color === color) && (
                            <span className="ml-auto text-primary">✓</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-muted-foreground text-sm">No colors found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Colors */}
            {colorVariants.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Selected Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {colorVariants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-border"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-border" style={{ backgroundColor: variant.color.toLowerCase() }} />
                      <span className="font-medium text-foreground">{variant.color}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-destructive hover:text-destructive/80 ml-1"
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
        <Card className="border-2 border-success/30 bg-success/10">
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
              <Button type="button" onClick={handleAddType} className="bg-success hover:bg-success/90">
                <Plus className="w-4 h-4" />
                Add Type
              </Button>
            </div>

            {typeVariants.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Type/Size Options with Prices:</p>
                {typeVariants.map((variant, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                    <span className="font-medium text-foreground min-w-[80px]">{variant.type}</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Optional price override"
                      value={variant.price || ""}
                      onChange={(e) => updateTypePrice(idx, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    {variant.price && (
                      <span className="text-sm text-muted-foreground">${parseFloat(variant.price).toFixed(2)}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveType(idx)}
                      className="text-destructive hover:text-destructive/80 p-1"
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
          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
