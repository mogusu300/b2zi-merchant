"use client"

import type React from "react"
import type { Product } from "@/types"
import { Star, ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: Product
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, onAddToCart }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={() => onProductClick(product)}
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            className="p-2 bg-[#2e3621] hover:bg-black text-white rounded-full shadow-lg transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-[#000000] text-lg line-clamp-1 group-hover:text-[#2e3621] transition-colors">
              {product.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {product.rating && (
            <>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#b1c98d] text-[#b1c98d]" />
                <span className="text-sm font-semibold text-[#000000]">{product.rating}</span>
              </div>
              {product.reviews && <span className="text-xs text-gray-500">({product.reviews} reviews)</span>}
            </>
          )}
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mb-3">
            {product.colors.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                className="w-5 h-5 rounded-full border-2 border-gray-200"
                style={{
                  backgroundColor: color.toLowerCase(),
                  ...(color.toLowerCase() === "white" && { backgroundColor: "#ffffff", borderColor: "#e5e7eb" }),
                }}
                title={color}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-black text-[#2e3621]">${product.price.toFixed(2)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            disabled={!product.inStock}
            className="px-4 py-2 bg-[#b1c98d] hover:bg-[#2e3621] hover:text-white text-[#2e3621] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
