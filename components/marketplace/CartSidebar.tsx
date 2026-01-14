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
        className={`fixed right-0 top-0 h-screen w-full max-w-sm bg-background border-l border-border z-50 flex flex-col transition-transform duration-300 animate-in slide-in-from-right-full ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Your Cart</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="text-foreground font-semibold text-sm mb-1">Cart is Empty</p>
              <p className="text-muted-foreground text-xs">Add items to get started</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="border border-border rounded-lg p-3.5 space-y-3">
                {/* Product Image */}
                <img
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-full aspect-square object-cover rounded-lg bg-secondary"
                />

                {/* Product Info */}
                <div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{item.product.name}</h3>

                  {/* Selected Variants */}
                  {(item.selectedColor || item.selectedType) && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {[item.selectedColor, item.selectedType].filter(Boolean).join(" • ")}
                    </p>
                  )}

                  <p className="text-sm font-medium text-foreground">${item.product.price.toFixed(2)}</p>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-border rounded-lg bg-secondary/50">
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      className="p-1.5 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <span className="w-6 text-center font-semibold text-xs text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="p-1.5 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-destructive ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right text-sm font-semibold text-foreground">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-sm">Total:</span>
              <span className="text-2xl font-bold text-foreground">${total.toFixed(2)}</span>
            </div>
            {!isAuthenticated && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-xs text-primary text-center font-medium">
                Sign up to complete your order
              </div>
            )}
            <button
              onClick={handleCheckout}
              className="w-full py-2.5 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              {!isAuthenticated && <LogIn className="w-4 h-4" />}
              {isAuthenticated ? "Proceed to Checkout" : "Sign Up to Checkout"}
            </button>
          </div>
        )}
        {items.length === 0 && (
          <div className="border-t border-border p-6 text-center text-muted-foreground text-xs font-medium">
            Continue shopping to add items
          </div>
        )}
      </div>
    </>
  )
}
