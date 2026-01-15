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
        className="relative p-2.5 hover:bg-secondary rounded-full transition-all duration-200 group"
        aria-label="User profile"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e3621] to-[#b1c98d] flex items-center justify-center text-background shadow-md group-hover:shadow-lg transition-shadow">
          <User className="w-5 h-5" />
        </div>
        {/* Online indicator */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background shadow-md" />
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
            <div className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#2e3621] to-[#b1c98d] px-6 py-8 text-background relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-background/10 rounded-full -mr-12 -mt-12" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-background/5 rounded-full -ml-8 -mb-8" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-background/20 flex items-center justify-center backdrop-blur-sm border border-background/30">
                      <User className="w-8 h-8 text-background" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-background mb-1">
                        {user.name || "User"}
                      </h3>
                      <p className="text-background/80 text-sm">{user.email}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-background/20 mb-4" />

                  {/* Stats */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <p className="text-background/80 text-xs font-medium mb-1">
                        Favorites
                      </p>
                      <p className="text-2xl font-bold text-background flex items-center gap-1">
                        <Heart className="w-5 h-5 fill-background" />
                        {favorites}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-background/80 text-xs font-medium mb-1">
                        Member Since
                      </p>
                      <p className="text-sm font-semibold text-background/90">
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors duration-200 group"
                  onClick={() => {
                    router.push("/profile")
                    setIsOpen(false)
                  }}
                >
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">View Profile</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors duration-200 group"
                  onClick={() => {
                    router.push("/settings")
                    setIsOpen(false)
                  }}
                >
                  <div className="p-2 rounded-lg bg-pending/10 group-hover:bg-pending/20 transition-colors">
                    <Settings className="w-4 h-4 text-pending" />
                  </div>
                  <span className="font-medium">Settings</span>
                </button>
              </div>

              {/* Footer - Logout Button */}
              <div className="px-6 py-3 bg-secondary border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold rounded-lg transition-colors duration-200 group"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>

              {/* Footer info */}
              <div className="px-6 py-3 bg-secondary border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
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
