"use client"

import type React from "react"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export const LandingNav: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-3xl sm:text-4xl font-serif font-black text-b2zi-black tracking-tighter group-hover:opacity-80 transition-opacity">
                B<span className="text-b2zi-dark">2</span>Z<span className="text-b2zi-light">i</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/marketplace" className="text-gray-600 hover:text-b2zi-dark font-medium transition-colors">
              Marketplace
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-b2zi-dark font-medium transition-colors">
              Sign In
            </Link>
            <Link
              href="/sellers"
              className="inline-flex items-center px-4 sm:px-6 py-2 border border-transparent text-sm font-bold rounded-full shadow-md text-b2zi-dark bg-b2zi-light hover:bg-opacity-90 focus:outline-none transition-colors"
            >
              Seller Portal
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-b2zi-dark p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              <Link
                href="/marketplace"
                className="text-gray-600 hover:text-b2zi-dark font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-b2zi-dark font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/sellers"
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-full shadow-md text-b2zi-dark bg-b2zi-light hover:bg-opacity-90 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Seller Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
