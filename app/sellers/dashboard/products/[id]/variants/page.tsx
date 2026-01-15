"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"

interface ProductVariant {
  id: string
  attributes: Record<string, string>
  sku: string
  price?: number
  stock: number
  images?: string[]
}

interface VariantGroup {
  name: string
  values: string[]
}

interface Product {
  id: string
  name: string
  price: number
  variantGroups?: VariantGroup[]
  variants?: ProductVariant[]
}

export default function ProductVariantsPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products`)
        const allProducts = await res.json()
        const foundProduct = allProducts.find((p: any) => p.id === productId)

        if (!foundProduct) {
          setError("Product not found")
          return
        }

        setProduct(foundProduct)
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  if (loading) {
    return <div className="text-center py-12">Loading product...</div>
  }

  if (!product) {
    return <div className="text-center py-12 text-destructive">{error}</div>
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
          <h1 className="text-3xl font-bold text-foreground">Product Variants</h1>
          <p className="text-muted-foreground mt-1">{product.name} - Base Price: ${product.price.toFixed(2)}</p>
        </div>
      </div>

      {/* Variant Groups */}
      {product.variantGroups && product.variantGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variant Types</CardTitle>
            <CardDescription>Attribute groups for this product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.variantGroups.map((group, idx) => (
                <div key={idx} className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value, vIdx) => (
                      <span key={vIdx} className="px-3 py-1 bg-secondary rounded-full text-sm">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Variants</CardTitle>
            <CardDescription>Specific variant combinations available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 font-semibold">Attributes</th>
                    <th className="text-left py-2 px-4 font-semibold">SKU</th>
                    <th className="text-left py-2 px-4 font-semibold">Price</th>
                    <th className="text-left py-2 px-4 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant) => (
                    <tr key={variant.id} className="border-b border-border/50 hover:bg-secondary">
                      <td className="py-3 px-4">
                        {Object.entries(variant.attributes)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ") || "-"}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{variant.sku}</td>
                      <td className="py-3 px-4">
                        {variant.price ? (
                          <span className="font-semibold">${variant.price.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">Base (${product.price.toFixed(2)})</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            variant.stock > 0
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {variant.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Variants Message */}
      {(!product.variants || product.variants.length === 0) && (
        <div className="text-center py-12 bg-secondary rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">No variants configured for this product</p>
          <Link href={`/sellers/dashboard/products/edit?id=${product.id}`}>
            <Button className="bg-[#2e3621] hover:bg-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Variants
            </Button>
          </Link>
        </div>
      )}

      {/* Edit Button */}
      <div className="flex justify-end gap-4">
        <Link href={`/sellers/dashboard/products/edit?id=${product.id}`}>
          <Button className="bg-[#2e3621] hover:bg-black">Edit Product</Button>
        </Link>
      </div>
    </div>
  )
}
