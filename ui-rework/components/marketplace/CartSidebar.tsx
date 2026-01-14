"use client"

import type React from "react"
import type { CartItem } from "@/types"
import { X, Plus, Minus, Trash2, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

interface CartSidebarProps {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onUpdateQuantity: (index: number, quantity: number) => void
  onRemoveItem: (index: number) => void
  isAuthenticated?: boolean
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  isAuthenticated = false,
}) => {
  const router = useRouter()
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/customers/register')
      return
    }
    router.push('/customers/checkout')
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col transition-transform duration-300 animate-in slide-in-from-right-full ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="text-gray-600 font-medium">Your cart is empty</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4">
                {/* Product Image */}
                <img
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-full aspect-square object-cover rounded-lg mb-3 bg-gray-100"
                />

                {/* Product Info */}
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.product.name}</h3>
                
                {/* Selected Variants */}
                {(item.selectedColor || item.selectedType) && (
                  <p className="text-xs text-gray-500 mb-2">
                    {[item.selectedColor, item.selectedType].filter(Boolean).join(" • ")}
                  </p>
                )}
                
                <p className="text-sm text-gray-600 mb-3">${item.product.price.toFixed(2)} each</p>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50/30">
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right text-sm font-semibold text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 text-center font-medium">
                Sign up first to proceed to checkout
              </div>
            )}
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-[#2e3621] text-white font-semibold rounded-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {!isAuthenticated && <LogIn className="w-4 h-4" />}
              {isAuthenticated ? 'Proceed to Checkout' : 'Sign Up to Checkout'}
            </button>
          </div>
        )}
        {items.length === 0 && (
          <div className="border-t border-gray-200 p-6 text-center text-gray-500 text-sm">
            Add items to cart to get started
          </div>
        )}
      </div>
    </>
  )
}
