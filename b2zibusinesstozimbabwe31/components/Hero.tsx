"use client"

import type React from "react"

import Link from "next/link"
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react"

export const Hero: React.FC = () => {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-b2zi-light/5 to-white pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-24 md:pb-32">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-b2zi-light/30 text-b2zi-dark text-sm font-semibold mb-4 sm:mb-6 border border-b2zi-light">
              <span className="mr-2 px-2 py-0.5 rounded-full bg-b2zi-dark text-white text-xs">COMING SOON</span>
              <span className="hidden sm:inline">Shopping opens Jan 12th</span>
              <span className="sm:hidden">Jan 12th</span>
            </div>
            <h1>
              <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wide text-gray-500 lg:text-sm xl:text-base">
                Zimbabwe's New Marketplace
              </span>
              <span className="mt-1 block text-3xl sm:text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                <span className="block text-b2zi-black">Shop Local</span>
                <span className="block text-b2zi-dark">
                  Get It <span className="text-b2zi-light">Delivered</span>
                </span>
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Discover unique products from local entrepreneurs across Zimbabwe. Fast delivery, secure payments, and
              quality guaranteed. Supporting local businesses has never been easier.
            </p>
            <div className="mt-6 sm:mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-sm sm:text-base font-bold rounded-full text-white bg-b2zi-dark hover:bg-black md:py-4 md:text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Join Waitlist
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>

                <a
                  href="#why-b2zi"
                  onClick={(e) => handleScrollTo(e, "why-b2zi")}
                  className="flex items-center justify-center px-6 sm:px-8 py-3 border-2 border-b2zi-light/50 text-sm sm:text-base font-bold rounded-full text-b2zi-dark bg-b2zi-light/10 hover:bg-b2zi-light/30 md:py-4 md:text-lg transition-colors"
                >
                  Why Shop B2Zi
                  <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </a>

                <a
                  href="#how-it-works"
                  onClick={(e) => handleScrollTo(e, "how-it-works")}
                  className="flex items-center justify-center px-6 sm:px-8 py-3 border border-gray-200 text-sm sm:text-base font-medium rounded-full text-gray-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg transition-colors"
                >
                  How it works
                </a>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-gray-400">
                Free delivery on orders over $10. Shop with confidence.
              </p>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-2xl lg:max-w-md overflow-hidden group border-4 sm:border-8 border-b2zi-light">
              <div className="absolute inset-0 bg-b2zi-dark/10 group-hover:bg-transparent transition-colors z-10"></div>
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800"
                alt="Happy customer receiving shopping delivery"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-b2zi-dark to-transparent p-4 sm:p-6 z-20">
                <div className="flex items-center text-white">
                  <div className="p-2 bg-b2zi-light rounded-lg mr-3 sm:mr-4">
                    <ShoppingBag className="text-b2zi-dark w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm sm:text-base">Shop From Home</p>
                    <p className="text-xs sm:text-sm opacity-80">500+ products launching soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
