"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Heart } from "lucide-react"

interface MarketplaceNavProps {
  cartCount: number
  onCartClick: () => void
}

export const MarketplaceNav: React.FC<MarketplaceNavProps> = ({ cartCount, onCartClick }) => {
  const [user] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("b2zi_user")
      return stored ? JSON.parse(stored) : null
    }
    return null
  })

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/marketplace" className="flex items-center gap-1 group">
            <span className="text-3xl font-serif font-black text-b2zi-black tracking-tighter group-hover:opacity-80 transition-opacity">
              B<span className="text-b2zi-dark">2</span>Z<span className="text-b2zi-light">i</span>
            </span>
            <span className="ml-2 px-2 py-0.5 bg-b2zi-light/20 text-b2zi-dark text-xs font-bold rounded-full">
              SHOP
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-b2zi-dark hover:bg-gray-100 rounded-full transition-all">
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={onCartClick}
              className="p-2 text-gray-600 hover:text-b2zi-dark hover:bg-gray-100 rounded-full transition-all relative group"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-b2zi-dark text-white text-xs flex items-center justify-center rounded-full font-bold group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>
            {user ? (
              <Link
                href="/orders"
                className="flex items-center gap-2 px-3 py-2 bg-b2zi-light/10 hover:bg-b2zi-light/20 rounded-full transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-b2zi-dark text-white flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-b2zi-dark hidden sm:block">{user.name}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-b2zi-dark hover:bg-black text-white font-bold rounded-full transition-colors text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
