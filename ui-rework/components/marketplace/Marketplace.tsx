"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import type { Product, CartItem } from "@/types"
import { ProductCard } from "./ProductCard"
import { ProductDetail } from "./ProductDetail"
import { CartSidebar } from "./CartSidebar"
import { Search, SlidersHorizontal, LogIn, ShoppingBag, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProfileDropdown } from "@/components/ProfileDropdown"
import {
  useUserSession,
  useMarketplacePreferences,
  useFavorites,
  useSearchHistory,
  useViewedProducts,
  useActivityTracking,
} from "@/hooks/use-session"

interface MarketplaceProps {
  initialProducts?: Product[]
}

export const Marketplace: React.FC<MarketplaceProps> = ({ initialProducts = [] }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  // Session hooks
  const { user } = useUserSession()
  const { preferences, updatePreferences } = useMarketplacePreferences()
  const { favorites, toggleFavorite } = useFavorites()
  const { addQuery } = useSearchHistory()
  const { addViewed } = useViewedProducts()
  const { track } = useActivityTracking()

  const selectedCategory = preferences.selectedCategory || "all"
  const sortBy = preferences.sortBy || "newest"

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
          const uniqueCategories = [...new Set(data.map((p: Product) => p.category))]
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setLoading(false)
      }
    }

    if (initialProducts.length === 0) {
      loadProducts()
    } else {
      const uniqueCategories = [...new Set(initialProducts.map((p) => p.category))]
      setCategories(uniqueCategories)
      setLoading(false)
    }
  }, [initialProducts.length])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("b2zi_cart")
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to load cart:", error)
      }
    }
    // Track session start
    track('marketplace_visit')
  }, [track])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("b2zi_cart", JSON.stringify(cartItems))
  }, [cartItems])

  const filteredAndSortedProducts = useMemo(() => {
    // Filter
    let filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })

    // Sort
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price)
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price)
      case 'rating':
        return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'newest':
      default:
        return filtered
    }
  }, [selectedCategory, searchQuery, products, sortBy])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      addQuery(query)
      track('search', { query })
    }
  }

  const handleLoginClick = () => {
    router.push("/login")
  }

  const handleLogout = () => {
    // This will be called after logout
  }

  const handleCategoryChange = (category: string) => {
    updatePreferences({ selectedCategory: category })
    track('category_filter', { category })
  }

  const handleSortChange = (sort: string) => {
    updatePreferences({ sortBy: sort as any })
    track('sort_change', { sortBy: sort })
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    addViewed(product.id, product.name)
    track('product_view', { productId: product.id, productName: product.name })
  }

  const handleProductClose = () => {
    setSelectedProduct(null)
  }

  const handleAddToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === product.id &&
          item.selectedColor === color &&
          item.selectedType === size,
      )
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id &&
          item.selectedColor === color &&
          item.selectedType === size
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [
        ...prev,
        { productId: product.id, product, quantity, selectedColor: color, selectedType: size },
      ]
    })
    track('add_to_cart', { productId: product.id, quantity, color, size })
    setIsCartOpen(true)
  }

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite(productId)
    track('favorite_toggle', { productId, isFavorite: !favorites.includes(productId) })
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index)
    } else {
      const newItems = [...cartItems]
      newItems[index].quantity = quantity
      setCartItems(newItems)
    }
  }

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Navigation - Modern & Clean */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-1 group">
              <span className="text-3xl font-serif font-black text-gray-900 tracking-tighter group-hover:opacity-80 transition-opacity">
                B<span className="text-[#2e3621]">2</span>Z<span className="text-[#b1c98d]">i</span>
              </span>
            </a>

            {/* Right side items */}
            <div className="flex items-center gap-4">
              {/* User Info or Profile Dropdown */}
              {user ? (
                <ProfileDropdown 
                  user={user}
                  favorites={favorites.length}
                  onLogout={handleLogout}
                />
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="flex items-center gap-2 px-4 py-2.5 text-[#2e3621] font-semibold hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative px-4 py-2.5 bg-[#2e3621] text-white font-semibold rounded-lg hover:bg-black transition-all active:scale-95 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                Cart ({cartTotal})
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#2e3621] mb-4"></div>
              <p className="text-gray-500 font-medium">Loading amazing products...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="mb-12">
              <div className="relative rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden h-80 flex items-center justify-center bg-gradient-to-r from-[#2e3621] to-[#b1c98d]">
                {/* Animated Background with Trippy Design */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-20"
                  viewBox="0 0 1200 400"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <style>{`
                      @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(5deg); }
                      }
                      @keyframes spin-slow {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                      @keyframes pulse-glow {
                        0%, 100% { opacity: 0.5; }
                        50% { opacity: 1; }
                      }
                      .float-shape { animation: float 4s ease-in-out infinite; }
                      .spin-shape { animation: spin-slow 8s linear infinite; }
                      .pulse-shape { animation: pulse-glow 3s ease-in-out infinite; }
                    `}</style>
                  </defs>

                  {/* Floating geometric shapes */}
                  <circle cx="100" cy="80" r="60" fill="rgba(255,255,255,0.3)" className="float-shape" />
                  <circle cx="1100" cy="320" r="80" fill="rgba(255,255,255,0.2)" className="float-shape" />

                  {/* Spinning circles */}
                  <g className="spin-shape">
                    <circle cx="600" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    <circle cx="600" cy="200" r="140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  </g>

                  {/* Pulsing accent circles */}
                  <circle cx="300" cy="150" r="40" fill="rgba(255,255,255,0.3)" className="pulse-shape" />
                  <circle cx="900" cy="250" r="50" fill="rgba(255,255,255,0.2)" className="pulse-shape" />
                </svg>

                {/* Content overlay */}
                <div className="relative z-10 text-center max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white drop-shadow-lg">
                    Discover Quality Products
                  </h1>
                  <p className="text-white/80 text-lg drop-shadow-md">Shop curated products from trusted sellers</p>
                </div>
              </div>
            </div>

            {/* Search & Filters - Organized layout */}
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex gap-3 items-center">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-gray-900 placeholder:text-gray-500"
                  />
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filters Panel - Sorting & View */}
              {showFilters && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e3621]"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Categories - Horizontal scroll */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedCategory === "all"
                      ? "bg-[#2e3621] text-white shadow-md"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-[#b1c98d] hover:bg-gray-50"
                  }`}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? "bg-[#2e3621] text-white shadow-md"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-[#b1c98d] hover:bg-gray-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {selectedCategory === "all" ? "All Products" : selectedCategory}
              </h2>
              <p className="text-gray-600">{filteredAndSortedProducts.length} products available</p>
            </div>

            {/* Products Grid - Responsive and clean */}
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                    onAddToCart={(product, quantity) =>
                      handleAddToCart(product, quantity)
                    }
                    isFavorited={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-medium mb-4">No products found</p>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                  className="px-6 py-2.5 bg-[#2e3621] text-white font-semibold rounded-lg hover:bg-black transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        isAuthenticated={!!user && !!user.id}
      />
    </div>
  )
}
