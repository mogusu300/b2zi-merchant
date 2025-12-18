"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import type { Product, CartItem } from "@/types"
import { ProductCard } from "./ProductCard"
import { ProductDetail } from "./ProductDetail"
import { CartSidebar } from "./CartSidebar"
import { mockProducts, mockCategories } from "@/lib/mock-data"
import { Search, SlidersHorizontal, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

export const Marketplace: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("b2zi_user")
    setIsAuthenticated(!!user)
  }, [])

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  const handleAddToCart = (product: Product, quantity = 1, color?: string, type?: string) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prev, { product, quantity, selectedColor: color, selectedType: type }]
    })
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
    } else {
      setCartItems((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
    }
  }

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#2e3621]">B2Zi Marketplace</h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative px-4 py-2 bg-[#b1c98d] text-[#2e3621] font-bold rounded-lg hover:bg-[#2e3621] hover:text-white transition-all"
                >
                  🛒 Cart ({cartItems.length})
                </button>
              ) : (
                <button
                  onClick={() => router.push("/customers/login")}
                  className="px-4 py-2 bg-[#2e3621] text-white font-bold rounded-lg hover:bg-black transition-all flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#2e3621] to-[#000000] text-white rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
          <div className="relative max-w-2xl">
            <h1 className="text-4xl font-black mb-3">Discover Amazing Products</h1>
            <p className="text-[#b1c98d] text-lg">Shop quality products from trusted sellers across Zimbabwe</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b1c98d] focus:border-[#2e3621] transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-[#b1c98d]/10 hover:bg-[#b1c98d]/20 text-[#2e3621] font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {mockCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-[#2e3621] text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#000000]">
              {selectedCategory === "all"
                ? "All Products"
                : mockCategories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={setSelectedProduct}
              onAddToCart={(product) => handleAddToCart(product)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No products found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="mt-4 px-6 py-3 bg-[#2e3621] text-white font-bold rounded-xl hover:bg-[#000000] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 animate-in slide-in-from-bottom-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2e3621] to-[#000000] rounded-2xl mb-4">
                <LogIn className="w-8 h-8 text-[#b1c98d]" />
              </div>
              <h3 className="text-2xl font-black text-[#000000] mb-2">Sign In Required</h3>
              <p className="text-gray-600 mb-6">Please sign in to add items to your cart and complete your purchase</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={() => router.push("/customers/login")}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#2e3621] to-[#000000] text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  )
}
