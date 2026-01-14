"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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

export default function ProductsPageContent() {
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
    ? availableColors.filter((color) => color.toLowerCase().includes(colorSearchQuery.toLowerCase()))
    : availableColors

  const handleAddColor = (color: string) => {
    if (!colorVariants.some((c) => c.color === color)) {
      setColorVariants([...colorVariants, { color }])
    }
    setColorSearchQuery("")
    setColorSearchOpen(false)
  }

  const handleRemoveColor = (index: number) => {
    setColorVariants(colorVariants.filter((_, i) => i !== index))
  }

  const handleAddType = () => {
    if (newType.trim() && !typeVariants.some((t) => t.type === newType.trim())) {
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
        price: Number.parseFloat(formData.price),
        category: formData.category,
        stock: Number.parseInt(formData.stock) || 0,
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
      <div className="flex items-center gap-4">
        <Link href="/sellers/dashboard/products">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-black">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update your product details</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      <div className="text-center py-8 text-gray-500">
        Edit form content - implement full form based on your original file
      </div>
    </div>
  )
}
