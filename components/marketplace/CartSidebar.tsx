"use client"

import type React from "react"
import type { CartItem } from "@/types"
import { X, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface CartSidebarProps {
  items: CartItem[]
  isOpen: boolean
  onClose: () => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ items, isOpen, onClose, onUpdateQuantity, onRemoveItem }) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-200" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#2e3621]" />
            <h2 className="text-xl font-bold text-black">Your Cart</h2>
            <span className="px-2 py-0.5 bg-[#2e3621] text-white rounded-full text-xs font-bold">{items.length}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">Start adding some products!</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <img
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-sm line-clamp-1">{item.product.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{item.product.sellerName}</p>
                    {item.selectedColor && <p className="text-xs text-gray-500 mt-1">Color: {item.selectedColor}</p>}
                    {item.selectedType && <p className="text-xs text-gray-500">Type: {item.selectedType}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-[#2e3621]">${item.product.price.toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 border border-gray-300 rounded font-bold hover:border-[#b1c98d] transition-colors text-sm"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 border border-gray-300 rounded font-bold hover:border-[#b1c98d] transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-bold text-black">Total:</span>
              <span className="text-2xl font-black text-[#2e3621]">${total.toFixed(2)}</span>
            </div>
            <Link
              href="/customers/checkout"
              className="block w-full py-4 bg-[#2e3621] hover:bg-black text-white font-bold rounded-xl transition-all text-center"
              onClick={() => {
                // Save cart to localStorage before redirecting
                localStorage.setItem('b2zi_cart', JSON.stringify(items))
                onClose()
              }}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
