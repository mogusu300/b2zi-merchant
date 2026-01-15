"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  inStock: boolean
  totalStock?: number
  stock?: number
  description?: string
  variantGroups?: Array<{ name: string; values: string[] }>
  variants?: Array<{ 
    id: string
    attributes: Record<string, string>
    sku: string
    price?: number
    stock: number
    images?: string[]
  }>
}

export default function ProductsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const merchantData = localStorage.getItem("b2zi_merchant")
        if (!merchantData) return

        const merchant = JSON.parse(merchantData)

        const res = await fetch("/api/products")
        const allProducts = await res.json()

        // Filter products by merchant
        const merchantProducts = allProducts.filter((p: any) => p.sellerId === merchant.id)
        setProducts(merchantProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleDelete = async (productId: string) => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        alert("Failed to delete product")
        return
      }

      setProducts(products.filter(p => p.id !== productId))
      setDeleteConfirm(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error deleting product")
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (productId: string) => {
    router.push(`/sellers/dashboard/products/edit?id=${productId}`)
  }

  const handleView = (productId: string, productName: string) => {
    // For now, show basic product details in an alert
    const product = products.find(p => p.id === productId)
    if (product) {
      alert(
        `Product: ${product.name}\n\nPrice: $${product.price.toFixed(2)}\nStock: ${product.stock || 0}\n\nDescription: ${product.description || "No description"}`
      )
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const isActuallyInStock = (product.totalStock ?? 0) > 0
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActuallyInStock) ||
      (statusFilter === "out-of-stock" && !isActuallyInStock)
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Link href="/sellers/dashboard/products/new">
          <Button className="bg-primary hover:bg-primary/90 text-background">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-lg">{product.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">${product.price.toFixed(2)}</span>
                        {product.totalStock !== undefined && (
                          <span className="text-muted-foreground">Stock: {product.totalStock}</span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            (product.totalStock ?? 0) > 0
                              ? "bg-success/20 text-success"
                              : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {(product.totalStock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/sellers/dashboard/products/${product.id}/variants`)}
                        className="flex-1 sm:flex-none bg-primary/10 text-primary hover:bg-primary/20 border-primary/30"
                        title="View color and size variants"
                      >
                        <span className="hidden sm:inline">Variants</span>
                        <span className="sm:hidden">Vars</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(product.id, product.name)}
                        className="flex-1 sm:flex-none bg-transparent"
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product.id)}
                        className="flex-1 sm:flex-none bg-transparent"
                      >
                        <Edit className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(product.id)}
                        className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delete Confirmation Modal */}
              {deleteConfirm === product.id && (
                <Card className="border-destructive/30 bg-destructive/10 mt-2">
                  <CardContent className="p-4">
                    <p className="text-destructive font-medium mb-4">
                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteConfirm(null)}
                        disabled={deleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-destructive hover:bg-destructive/90 text-background"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {products.length === 0 ? "No products yet. Create your first product!" : "No products match your filters."}
          </div>
        )}
      </div>
    </div>
  )
}
