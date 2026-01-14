"use client"

import type React from "react"
import { useState } from "react"
import type { Product } from "@/types"
import { Star, ShoppingCart, X } from "lucide-react"

interface ProductDetailProps {
  product: Product
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0])
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize)
    onClose()
  }

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in scale-in-95">
        {/* Close Button */}
        <div className="sticky top-0 flex justify-end p-4 bg-background border-b border-border">
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* Image Section */}
          <div className="mb-8">
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-2xl bg-secondary"
            />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
              <p className="text-muted-foreground text-base leading-relaxed">{product.description}</p>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating!) ? "fill-accent text-accent" : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  {product.rating} rating
                  {product.reviews && <span> • {product.reviews} reviews</span>}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="border-t border-b border-border py-6">
              <p className="text-4xl font-bold text-foreground">${product.price.toFixed(2)}</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Choose Color</label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        selectedColor === color ? "border-primary scale-110" : "border-border"
                      }`}
                      style={{
                        backgroundColor: color.toLowerCase(),
                        ...(color.toLowerCase() === "white" && { backgroundColor: "#ffffff", borderColor: "#e5e7eb" }),
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Choose Size</label>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-background"
                        : "border-border text-foreground hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <div className="flex items-center gap-2 text-success font-medium">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  In Stock
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <span className="w-2 h-2 bg-destructive rounded-full"></span>
                  Out of Stock
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 pt-4">
              <div className="flex items-center border border-border rounded-lg bg-secondary/30">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  product.inStock
                    ? "bg-primary text-background hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-95"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
