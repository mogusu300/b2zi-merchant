"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Timeline } from "./Timeline"
import { Bell, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export const Notifications: React.FC = () => {
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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-1 group">
                <span className="text-3xl font-black text-b2zi-black tracking-tighter">
                  B2Z<span className="text-b2zi-light">i</span>
                  <span className="text-b2zi-dark">.</span>
                </span>
              </Link>
              <span className="ml-4 px-3 py-1 bg-b2zi-light/20 rounded-full text-xs font-bold text-b2zi-dark uppercase tracking-wide">
                Updates
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-b2zi-dark bg-b2zi-light/10 rounded-full">
                <Bell className="w-6 h-6" />
              </button>
              <div className="relative flex items-center gap-2 cursor-pointer group" onClick={handleLogout}>
                <div className="w-8 h-8 rounded-full bg-b2zi-dark text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-500 hover:text-b2zi-dark transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Calendar/Timeline */}
          <div>
            <Timeline />
          </div>

          {/* Right Column: Text Updates */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-b2zi-light/30 h-full">
              <h2 className="text-2xl font-bold text-b2zi-black mb-6 flex items-center gap-2">
                <Bell className="text-b2zi-dark" />
                Platform Updates
              </h2>

              <div className="space-y-8">
                {/* Update Item */}
                <div className="relative pl-6 border-l-4 border-b2zi-dark">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    15 December 2024
                  </span>
                  <h3 className="text-lg font-bold text-b2zi-dark">Merchant Registration Open</h3>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    We are officially accepting merchant registrations! You can now verify your identity and company
                    documents. Please ensure all uploaded photos are clear to avoid delays in the verification process.
                  </p>
                </div>

                {/* You can add more updates here in the future */}
              </div>

              <div className="mt-12 p-4 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
                Check back here regularly for announcements regarding the January 12th Launch.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
