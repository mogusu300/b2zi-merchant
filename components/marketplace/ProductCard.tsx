"use client"

import type React from "react"
import { useState } from "react"
import type { Product, ProductVariant } from "@/types"
import { Star, ShoppingCart, Heart, Plus, Minus } from "lucide-react"

interface ProductCardProps {
  product: Product & {
    variantGroups?: Array<{ name: string; values: string[] }>
    variants?: ProductVariant[]
  }
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product, quantity: number) => void
  isFavorited?: boolean
  onToggleFavorite?: (productId: string) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onProductClick, 
  onAddToCart, 
  isFavorited = false,
  onToggleFavorite 
}) => {
  const [quantity, setQuantity] = useState(1)
  const [isHovered, setIsHovered] = useState(false)

  const currentPrice = product.price

  // Get colors from variantGroups or fall back to colors array
  const colorGroup = product.variantGroups?.find(g => g.name.toLowerCase() === 'color')
  const displayColors = colorGroup?.values?.slice(0, 5) || product.colors?.slice(0, 5) || []
  const totalColors = colorGroup?.values?.length || product.colors?.length || 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart(product, quantity)
    setQuantity(1)
  }

  return (
    <>
      <div
        className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border transition-all duration-300 hover:border-primary/60 hover:shadow-md group cursor-pointer"
        onClick={() => onProductClick(product)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section - Cleaner image with refined hover effect */}
        <div className="relative overflow-hidden bg-secondary aspect-square flex-shrink-0">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Stock Badge - Top right corner */}
          <div className="absolute top-3 right-3">
            {product.inStock && (
              <div className="bg-success text-background px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-sm">
                <span className="w-1 h-1 bg-background rounded-full"></span>
                In Stock
              </div>
            )}
          </div>

          {/* Out of Stock Overlay - Cleaner overlay without blur */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <p className="text-white font-semibold text-sm">Out of Stock</p>
            </div>
          )}

          {/* Favorite Button - Top left */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite?.(product.id)
            }}
            className="absolute top-3 left-3 p-2 bg-background rounded-lg shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200"
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                isFavorited ? "fill-accent text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            />
          </button>

          {/* Color Swatches - Bottom with cleaner styling */}
          {displayColors && displayColors.length > 0 && (
            <div className="absolute bottom-3 left-3 flex gap-1.5 bg-background/95 rounded-lg p-2 shadow-sm">
              {displayColors.map((color, idx) => (
                <div
                  key={idx}
                  className="w-5 h-5 rounded-md border border-border cursor-pointer hover:border-primary/70 transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: color.toLowerCase(),
                    ...(color.toLowerCase() === "white" && { backgroundColor: "#ffffff", borderColor: "#d1d5db" }),
                  }}
                  title={color}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                />
              ))}
              {totalColors > 5 && (
                <div className="w-5 h-5 rounded-md bg-secondary/80 flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                  +{totalColors - 5}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Section - Better spacing, cleaner typography */}
        <div className="p-3.5 flex flex-col flex-grow">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-semibold tracking-wide">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating!) ? "fill-accent text-accent" : "text-border"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {product.rating}
                {product.reviews && <span className="text-border ml-0.5">({product.reviews})</span>}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mb-3 mt-auto">
            <p className="text-xl font-bold text-foreground">${currentPrice.toFixed(2)}</p>
          </div>

          {/* Quantity and Button Section */}
          <div className="flex gap-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-border rounded-lg bg-secondary/50">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuantity(Math.max(1, quantity - 1))
                }}
                className="p-1 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-medium text-foreground">{quantity}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuantity(quantity + 1)
                }}
                className="p-1 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${
                product.inStock
                  ? "bg-primary text-background hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-95"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
