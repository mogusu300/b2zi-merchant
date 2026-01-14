"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const products = [
    {
      id: 1,
      name: "Handcrafted Basket",
      price: "$25.00",
      stock: 15,
      status: "Active",
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200",
    },
    {
      id: 2,
      name: "Organic Honey 500g",
      price: "$12.50",
      stock: 30,
      status: "Active",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=200",
    },
    {
      id: 3,
      name: "Traditional Clothing",
      price: "$45.00",
      stock: 8,
      status: "Active",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200",
    },
    {
      id: 4,
      name: "Wooden Sculpture",
      price: "$85.00",
      stock: 3,
      status: "Low Stock",
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200",
    },
    {
      id: 5,
      name: "Handmade Jewelry Set",
      price: "$35.00",
      stock: 0,
      status: "Out of Stock",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-b2zi-black">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Link href="/sellers/dashboard/products/new">
          <Button className="bg-b2zi-dark hover:bg-b2zi-black text-white">
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
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-b2zi-dark">
              <option>All Status</option>
              <option>Active</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-b2zi-black text-lg">{product.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <span className="font-semibold text-b2zi-dark">{product.price}</span>
                    <span>Stock: {product.stock}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : product.status === "Low Stock"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                    <Eye className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                    <Edit className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
