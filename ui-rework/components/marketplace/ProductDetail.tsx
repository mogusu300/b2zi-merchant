"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import type { Product } from "@/types"
import { Star, ShoppingCart, X, ChevronLeft, ChevronRight } from "lucide-react"

interface ProductDetailProps {
  product: Product
  onClose: () => void
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Extract color and non-color variants
  const colorGroup = useMemo(() => product.variantGroups?.find(g => g.name.toLowerCase() === 'color'), [product.variantGroups])
  const otherVariantGroups = useMemo(() => product.variantGroups?.filter(g => g.name.toLowerCase() !== 'color') || [], [product.variantGroups])

  // Get the current image
  const images = product.images || []
  const currentImage = images[currentImageIndex] || "/placeholder.svg"

  // Initialize selected color if available
  useEffect(() => {
    if (colorGroup && colorGroup.values.length > 0 && !selectedVariants['color']) {
      setSelectedVariants(prev => ({ ...prev, color: colorGroup.values[0] }))
    }
  }, [colorGroup, selectedVariants])

  const handleAddToCart = () => {
    onAddToCart(
      product, 
      quantity, 
      selectedVariants['color'],
      selectedVariants['size'] || selectedVariants[otherVariantGroups[0]?.name] || undefined
    )
    onClose()
  }

  const handleVariantSelect = (groupName: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [groupName.toLowerCase()]: value
    }))
  }

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

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
          {/* Image Section with Navigation */}
          <div className="mb-8">
            <div className="relative w-full aspect-square bg-secondary rounded-2xl overflow-hidden">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Buttons - Show only if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-background hover:bg-secondary rounded-full shadow-lg border border-border transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-background hover:bg-secondary rounded-full shadow-lg border border-border transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </div>

            {/* Image Counter and Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 space-y-3">
                {/* Counter */}
                <p className="text-sm text-muted-foreground text-center font-medium">
                  {currentImageIndex + 1} of {images.length}
                </p>

                {/* Thumbnail Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex ? "border-primary scale-105" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
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

            {/* Seller Information */}
            {product.sellerName && (
              <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-3">
                  {product.sellerAvatar && (
                    <img
                      src={product.sellerAvatar}
                      alt={product.sellerName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-border"
                    />
                  )}
                  {!product.sellerAvatar && (
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center border-2 border-border">
                      <span className="text-lg font-bold text-primary">{product.sellerName[0]}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sold by</p>
                    <h3 className="text-base font-bold text-foreground">{product.sellerName}</h3>
                    {product.sellerCompany && (
                      <p className="text-xs text-muted-foreground mt-0.5">{product.sellerCompany}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="border-t border-b border-border py-6">
              <p className="text-4xl font-bold text-foreground">${product.price.toFixed(2)}</p>
            </div>

            {/* Color Selection - From variantGroups */}
            {colorGroup && colorGroup.values.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Choose Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorGroup.values.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVariantSelect('color', color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        selectedVariants['color'] === color ? "border-primary scale-110" : "border-border"
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

            {/* Dynamic Variant Groups from Database */}
            {otherVariantGroups.map((variantGroup) => (
              <div key={variantGroup.name}>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Choose {variantGroup.name}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {variantGroup.values.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleVariantSelect(variantGroup.name, value)}
                      className={`px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                        selectedVariants[variantGroup.name.toLowerCase()] === value
                          ? "border-primary bg-primary text-background"
                          : "border-border text-foreground hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

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
