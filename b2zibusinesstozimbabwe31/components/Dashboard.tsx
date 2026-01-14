"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Timeline } from "./Timeline"
import { Bell, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export const Dashboard: React.FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("b2zi_user")
    if (!stored) {
      router.push("/register")
    } else {
      setUser(JSON.parse(stored))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("b2zi_user")
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-b2zi-gray">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-black text-b2zi-black tracking-tighter">
                B2Z<span className="text-b2zi-light">i</span>
                <span className="text-b2zi-dark">.</span>
              </h1>
              <span className="ml-4 px-3 py-1 bg-b2zi-light/20 rounded-full text-xs font-bold text-b2zi-dark uppercase tracking-wide">
                Merchant Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/notifications"
                className="p-2 text-gray-400 hover:text-b2zi-dark hover:bg-gray-100 rounded-full transition-colors relative"
                title="View Updates"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </Link>
              <div className="relative flex items-center gap-2 cursor-pointer group" onClick={handleLogout}>
                <div className="w-8 h-8 rounded-full bg-b2zi-dark text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                  {user.name}
                </span>
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-b2zi-black">Welcome, {user.name} 👋</h1>
          <p className="mt-2 text-gray-600">
            We are getting everything ready for the big launch. Here is what is happening next.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Timeline */}
          <div className="lg:col-span-2">
            <Timeline />
          </div>

          {/* Sidebar - Quick Stats / Info */}
          <div className="space-y-8">
            <div className="bg-b2zi-dark rounded-2xl shadow-xl p-6 text-white border-2 border-b2zi-dark">
              <h3 className="text-lg font-semibold mb-2 text-b2zi-light">Merchant ID</h3>
              <p className="text-3xl font-mono opacity-90">PENDING</p>
              <p className="text-sm mt-4 opacity-75">
                Your documents are being reviewed. We will notify you via email once verified.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-b2zi-light/30">
              <h3 className="text-lg font-bold text-b2zi-black mb-4">Support</h3>
              <p className="text-gray-600 text-sm mb-4">Have questions about the launch?</p>
              <button className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
