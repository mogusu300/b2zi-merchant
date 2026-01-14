"use client"

import type React from "react"
import type { CartItem } from "@/types"
import { X, Plus, Minus, Trash2 } from "lucide-react"

interface CartSidebarProps {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ items, isOpen, onClose, onUpdateQuantity, onRemoveItem }) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-background border-l border-border z-50 flex flex-col transition-transform duration-300 animate-in slide-in-from-right-full ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <p className="text-muted-foreground font-medium">Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="border border-border rounded-xl p-4">
                {/* Product Image */}
                <img
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  className="w-full aspect-square object-cover rounded-lg mb-3 bg-secondary"
                />

                {/* Product Info */}
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{item.product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">${item.product.price.toFixed(2)} each</p>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center border border-border rounded-lg bg-secondary/30">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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
            <div className="flex items-center justify-between text-lg font-bold text-foreground">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="w-full py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-all active:scale-95">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
