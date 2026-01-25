"use client"

import React, { useState, useEffect } from "react"
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react"

interface HunterLoginProps {
  onBack: () => void
  onLoginSuccess: (token: string, hunter: any) => void
  onShowRegister?: () => void
}

export const HunterLogin: React.FC<HunterLoginProps> = ({ onBack, onLoginSuccess, onShowRegister }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const getApiUrl = () => {
    // Get API URL from env or construct from current host
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL
    }
    // Replace frontend port (3001) with backend port (5000)
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    const backendPort = "5000"
    return `${protocol}//${hostname}:${backendPort}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const apiUrl = getApiUrl()
      console.log('[HunterLogin] API URL:', apiUrl)
      console.log('[HunterLogin] Attempting login with email:', email)
      
      const response = await fetch(`${apiUrl}/api/v1/auth/hunter/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      console.log('[HunterLogin] Response status:', response.status)
      const contentType = response.headers.get("content-type") || ""
      const data = contentType.includes("application/json") ? await response.json() : await response.text()

      console.log('[HunterLogin] Response data:', data)

      if (!response.ok) {
        const message = typeof data === "string" ? data : data?.error?.message || "Login failed"
        throw new Error(message)
      }

      const accessToken = (data as any)?.data?.accessToken
      const refreshToken = (data as any)?.data?.refreshToken
      const hunter = (data as any)?.data?.hunter

      if (!accessToken || !hunter) {
        throw new Error("Unexpected response from server")
      }

      localStorage.setItem("hunterToken", accessToken)
      if (refreshToken) {
        localStorage.setItem("hunterRefreshToken", refreshToken)
      }
      localStorage.setItem("hunterData", JSON.stringify(hunter))

      try { window.history.replaceState({}, '', '/') } catch {}

      onLoginSuccess(accessToken, hunter)
    } catch (err: any) {
      console.error('[HunterLogin] Caught error:', err)
      console.error('[HunterLogin] Error message:', err?.message)
      console.error('[HunterLogin] Error type:', err?.constructor?.name)
      const apiUrl = getApiUrl()
      setError(`${err.message || "Login failed"}\n\nDebug: API URL = ${apiUrl}\nHostname = ${window.location.hostname}`)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    try { window.history.replaceState({}, '', '/hunter/login') } catch {}
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a14] via-[#2e3621] to-[#1f2917] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#b1c98d]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#b1c98d]/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#b1c98d] rounded-xl flex items-center justify-center font-bold text-[#2e3621]">
              b2
            </div>
            <span className="text-3xl font-bold text-white">b2zi</span>
          </div>
          <p className="text-[#b1c98d]/60 text-sm tracking-wider uppercase">Agent Portal</p>
        </div>

        {/* Main Card */}
        <div className="bg-[#2e3621]/80 backdrop-blur-xl border border-[#b1c98d]/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-[#b1c98d]/70 text-sm">Access your merchant onboarding dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm space-y-2">
                <div><strong>Error:</strong> {error}</div>
                <div className="text-xs opacity-70">API URL: {getApiUrl()}</div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[#b1c98d] text-sm font-medium mb-3">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b1c98d]/40" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@b2zi.io"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-[#b1c98d]/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#b1c98d]/50 focus:bg-white/10 transition-all"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[#b1c98d] text-sm font-medium mb-3">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b1c98d]/40" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-[#b1c98d]/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#b1c98d]/50 focus:bg-white/10 transition-all"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full mt-8 bg-[#b1c98d] hover:bg-[#c8daa5] text-[#2e3621] py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-6 border-t border-[#b1c98d]/10">
              <p className="text-white/60 text-sm">
                New to b2zi?{" "}
                <button
                  type="button"
                  onClick={() => onShowRegister && onShowRegister()}
                  className="text-[#b1c98d] hover:text-[#c8daa5] font-semibold transition-colors"
                >
                  Create an account
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/30 text-xs">
          <p>© 2026 b2zi. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
