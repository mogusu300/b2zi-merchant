'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FormData {
  name: string
  description: string
  price: string
  category: string
  stock: string
  colors: string
  types: string
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

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    colors: '',
    types: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (response.ok) {
          const product = await response.json()
          setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            category: product.category,
            stock: (product.stock || 0).toString(),
            colors: product.colors?.join(', ') || '',
            types: product.types?.join(', ') || '',
          })
          setImages(product.images || [])
        }
      } catch (err) {
        console.error('Failed to load product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

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

        // Validate file
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`)
          continue
        }

        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is larger than 10MB`)
          continue
        }

        // Upload file
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!formData.name || !formData.price || !formData.category) {
        setError('Please fill in all required fields')
        setSubmitting(false)
        return
      }

      if (images.length === 0) {
        setError('Please upload at least one product image')
        setSubmitting(false)
        return
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock: parseInt(formData.stock) || 0,
          colors: formData.colors.split(',').map((c) => c.trim()).filter(Boolean),
          types: formData.types.split(',').map((t) => t.trim()).filter(Boolean),
          images: images,
        }),
      })

      if (response.ok) {
        router.push('/sellers/products')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update product')
      }
    } catch (err) {
      console.error('Submit failed:', err)
      setError('An error occurred while updating the product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Product Name */}
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="mt-1"
                disabled={submitting}
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
                placeholder="Enter product description"
                className="mt-1"
                rows={4}
                disabled={submitting}
              />
            </div>

            {/* Price & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="mt-1"
                  disabled={submitting}
                />
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

            {/* Stock */}
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="mt-1"
                disabled={submitting}
              />
            </div>

            {/* Colors */}
            <div>
              <Label htmlFor="colors">Available Colors (comma-separated)</Label>
              <Input
                id="colors"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                placeholder="e.g., Red, Blue, Green"
                className="mt-1"
                disabled={submitting}
              />
            </div>

            {/* Types */}
            <div>
              <Label htmlFor="types">Available Types (comma-separated)</Label>
              <Input
                id="types"
                name="types"
                value={formData.types}
                onChange={handleChange}
                placeholder="e.g., Small, Medium, Large"
                className="mt-1"
                disabled={submitting}
              />
            </div>

            {/* Images */}
            <div>
              <Label htmlFor="images">Product Images *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-600 transition mt-1">
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
                  <span className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</span>
                </label>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Uploaded Images ({images.length})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                          <div className="absolute top-1 left-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <Link href="/sellers/products" className="flex-1">
                <Button variant="outline" className="w-full" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
