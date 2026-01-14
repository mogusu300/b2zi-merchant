"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import type { Product, CartItem } from "@/types"
import { ProductCard } from "./ProductCard"
import { ProductDetail } from "./ProductDetail"
import { CartSidebar } from "./CartSidebar"
import { Search, SlidersHorizontal, LogIn, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import MarketplaceBackground from "@/app/marketplace-background"

export const Marketplace: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Mock products data
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Premium Wireless Headphones",
        description: "High-quality sound with noise cancellation",
        price: 129.99,
        originalPrice: 179.99,
        category: "Electronics",
        rating: 4.5,
        reviews: 128,
        images: ["/premium-wireless-headphones.png"],
        inStock: true,
        colors: ["Black", "Silver", "Blue", "Gold"],
      },
      {
        id: "2",
        name: "Organic Cotton T-Shirt",
        description: "Comfortable and eco-friendly apparel",
        price: 34.99,
        originalPrice: 49.99,
        category: "Fashion",
        rating: 4.8,
        reviews: 92,
        images: ["/cotton-tshirt.png"],
        inStock: true,
        colors: ["White", "Black", "Navy", "Gray"],
      },
      {
        id: "3",
        name: "Stainless Steel Water Bottle",
        description: "Keep drinks cold for 24 hours",
        price: 44.99,
        originalPrice: 59.99,
        category: "Lifestyle",
        rating: 4.6,
        reviews: 245,
        images: ["/water-bottle-stainless.jpg"],
        inStock: true,
        colors: ["White", "Black", "Red", "Midnight Blue"],
      },
      {
        id: "4",
        name: "Smartphone Stand",
        description: "Adjustable phone holder for any device",
        price: 19.99,
        originalPrice: 29.99,
        category: "Electronics",
        rating: 4.3,
        reviews: 67,
        images: ["/phone-stand.jpg"],
        inStock: false,
        colors: ["Black", "Silver"],
      },
      {
        id: "5",
        name: "Bamboo Cutting Board",
        description: "Durable and sustainable kitchen essential",
        price: 39.99,
        originalPrice: 54.99,
        category: "Home",
        rating: 4.7,
        reviews: 156,
        images: ["/bamboo-cutting-board.png"],
        inStock: true,
        colors: ["Natural", "Dark Brown"],
      },
      {
        id: "6",
        name: "Minimalist Desk Lamp",
        description: "Modern lighting with USB charging port",
        price: 59.99,
        originalPrice: 79.99,
        category: "Home",
        rating: 4.4,
        reviews: 83,
        images: ["/desk-lamp-modern.jpg"],
        inStock: true,
        colors: ["Black", "White", "Rose Gold"],
      },
      {
        id: "7",
        name: "Leather Crossbody Bag",
        description: "Stylish and functional everyday bag",
        price: 89.99,
        originalPrice: 129.99,
        category: "Fashion",
        rating: 4.9,
        reviews: 201,
        images: ["/leather-crossbody-bag.png"],
        inStock: true,
        colors: ["Cognac", "Black", "Tan", "Chocolate"],
      },
      {
        id: "8",
        name: "Yoga Mat Premium",
        description: "Non-slip, eco-friendly exercise mat",
        price: 54.99,
        originalPrice: 74.99,
        category: "Sports",
        rating: 4.7,
        reviews: 134,
        images: ["/premium-yoga-mat.png"],
        inStock: true,
        colors: ["Purple", "Teal", "Gray", "Pink"],
      },
    ]

    // Extract unique categories
    const uniqueCategories = [...new Set(mockProducts.map((p) => p.category))]

    // Set mock data
    setProducts(mockProducts)
    setCategories(uniqueCategories)
    setLoading(false)
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery, products])

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
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-20">
        <MarketplaceBackground />
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-background to-secondary/30 -z-10" />

      {/* Navigation - Modern & Clean */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-1 group">
              <span className="text-3xl font-serif font-black text-foreground tracking-tighter group-hover:opacity-80 transition-opacity">
                B<span className="text-[#2e3621]">2</span>Z<span className="text-[#b1c98d]">i</span>
              </span>
            </a>

            {/* Auth Button */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative px-4 py-2.5 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Cart ({cartItems.length})
                </button>
              ) : (
                <button
                  onClick={() => router.push("/customers/login")}
                  className="px-4 py-2.5 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mb-4"></div>
              <p className="text-muted-foreground font-medium">Loading amazing products...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="mb-12">
              <div className="relative rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden h-80 flex items-center justify-center">
                {/* Animated Background with Trippy Design */}
                <svg
                  className="absolute inset-0 w-full h-full"
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
                    <linearGradient id="trippy1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#2e3621", stopOpacity: 0.9 }} />
                      <stop offset="50%" style={{ stopColor: "#b1c98d", stopOpacity: 0.7 }} />
                      <stop offset="100%" style={{ stopColor: "#35a646", stopOpacity: 0.8 }} />
                    </linearGradient>
                    <linearGradient id="trippy2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#35a646", stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: "#2e3621", stopOpacity: 0.7 }} />
                    </linearGradient>
                  </defs>

                  {/* Main gradient background */}
                  <rect width="1200" height="400" fill="url(#trippy1)" />

                  {/* Floating geometric shapes */}
                  <circle cx="100" cy="80" r="60" fill="url(#trippy2)" opacity="0.6" className="float-shape" />
                  <circle cx="1100" cy="320" r="80" fill="url(#trippy1)" opacity="0.5" className="float-shape" />

                  {/* Spinning circles */}
                  <g className="spin-shape">
                    <circle cx="600" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                    <circle cx="600" cy="200" r="140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  </g>

                  {/* Pulsing accent circles */}
                  <circle cx="300" cy="150" r="40" fill="rgba(255,255,255,0.3)" className="pulse-shape" />
                  <circle cx="900" cy="250" r="50" fill="rgba(255,255,255,0.2)" className="pulse-shape" />

                  {/* Wavy pattern */}
                  <path
                    d="M 0 250 Q 150 200 300 250 T 600 250 T 900 250 T 1200 250 L 1200 400 L 0 400 Z"
                    fill="rgba(255,255,255,0.1)"
                  />
                  <path
                    d="M 0 280 Q 200 240 400 280 T 800 280 T 1200 280 L 1200 400 L 0 400 Z"
                    fill="rgba(255,255,255,0.08)"
                  />
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
              <div className="bg-background rounded-2xl shadow-sm border border-border p-4">
                <div className="flex gap-3 items-center">
                  <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Categories - Horizontal scroll */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedCategory === "all"
                      ? "bg-primary text-background shadow-md"
                      : "bg-background border border-border text-foreground hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-background shadow-md"
                        : "bg-background border border-border text-foreground hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-1">
                {selectedCategory === "all" ? "All Products" : selectedCategory}
              </h2>
              <p className="text-muted-foreground">{filteredProducts.length} products available</p>
            </div>

            {/* Products Grid - Responsive and clean */}
            {filteredProducts.length > 0 ? (
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
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl mb-4">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg font-medium mb-4">No products found</p>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                  className="px-6 py-2.5 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in scale-in-95">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h3>
              <p className="text-muted-foreground mb-6">Please sign in to add items to your cart</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-3 px-4 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition-all"
                >
                  Continue Browsing
                </button>
                <button
                  onClick={() => router.push("/customers/login")}
                  className="flex-1 py-3 px-4 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-all"
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
