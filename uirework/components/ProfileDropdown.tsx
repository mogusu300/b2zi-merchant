"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { User, LogOut, Settings, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { sessionStorage } from "@/lib/session-storage"
import type { UserSession } from "@/lib/session-storage"

interface ProfileDropdownProps {
  user: UserSession | null
  favorites?: number
  onLogout?: () => void
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  favorites = 0,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    sessionStorage.clearUser()
    setIsOpen(false)
    onLogout?.()
    router.push("/")
    router.refresh()
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 group"
        aria-label="User profile"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e3621] to-[#b1c98d] flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
          <User className="w-5 h-5" />
        </div>
        {/* Online indicator */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md" />
      </button>

      {/* Dropdown Menu - Beautiful Pop-out Card */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Card */}
          <div className="absolute right-0 mt-2 w-96 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#2e3621] to-[#b1c98d] px-6 py-8 text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-8 -mb-8" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {user.name || "User"}
                      </h3>
                      <p className="text-white/80 text-sm">{user.email}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-white/20 mb-4" />

                  {/* Stats */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-white/80 text-xs font-medium mb-1">
                        Favorites
                      </p>
                      <p className="text-2xl font-bold text-white flex items-center gap-1">
                        <Heart className="w-5 h-5 fill-white" />
                        {favorites}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/80 text-xs font-medium mb-1">
                        Member Since
                      </p>
                      <p className="text-sm font-semibold text-white/90">
                        {new Date(user.loginTime).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body - Menu Items */}
              <div className="px-6 py-4 space-y-2">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={() => {
                    router.push("/profile")
                    setIsOpen(false)
                  }}
                >
                  <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">View Profile</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={() => {
                    router.push("/settings")
                    setIsOpen(false)
                  }}
                >
                  <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                    <Settings className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Settings</span>
                </button>
              </div>

              {/* Footer - Logout Button */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors duration-200 group"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

              {/* Footer info */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Last login: {new Date(user.loginTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
