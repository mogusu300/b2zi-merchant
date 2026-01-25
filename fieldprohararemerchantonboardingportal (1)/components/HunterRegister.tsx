"use client"

import React, { useState } from "react"
import { Loader2, Mail, User, Lock, Phone, MapPin, ArrowRight } from "lucide-react"

interface HunterRegisterProps {
  onBack: () => void
  onRegisterSuccess: (token: string, hunter: any) => void
}

export const HunterRegister: React.FC<HunterRegisterProps> = ({ onBack, onRegisterSuccess }) => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [region, setRegion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL
    }
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
      console.log('[HunterRegister] Registering at:', apiUrl)
      
      // Try with JSON first
      const response = await fetch(`${apiUrl}/api/v1/auth/hunter/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          region,
        }),
      })

      console.log('[HunterRegister] Response status:', response.status)
      
      const contentType = response.headers.get("content-type") || ""
      let data
      try {
        data = contentType.includes("application/json") ? await response.json() : await response.text()
      } catch (parseErr) {
        console.error('[HunterRegister] Parse error:', parseErr)
        throw new Error(`Invalid response format from server`)
      }

      console.log('[HunterRegister] Response data:', data)

      if (!response.ok) {
        let errorMsg = "Registration failed"
        
        if (typeof data === "string") {
          errorMsg = data
        } else if (data?.error?.message) {
          errorMsg = data.error.message
        } else if (data?.message) {
          errorMsg = data.message
        }
        
        throw new Error(errorMsg)
      }

      const accessToken = (data as any)?.data?.accessToken
      const refreshToken = (data as any)?.data?.refreshToken
      const hunter = (data as any)?.data?.hunter || (data as any)?.data

      if (!accessToken || !hunter) {
        console.warn('[HunterRegister] Missing accessToken or hunter data')
        onBack()
        return
      }

      localStorage.setItem("hunterToken", accessToken)
      if (refreshToken) localStorage.setItem("hunterRefreshToken", refreshToken)
      localStorage.setItem("hunterData", JSON.stringify(hunter))

      try { 
        window.history.replaceState({}, '', '/') 
      } catch {}
      
      onRegisterSuccess(accessToken, hunter)
    } catch (err: any) {
      console.error('[HunterRegister] Error:', err)
      const errorMsg = err?.message || "Registration failed. Please try again."
      setError(errorMsg)
      
      // For debugging - show full error details
      if (err.name === 'TypeError') {
        setError(`Network error: ${err.message} - Backend at ${getApiUrl()} may be unreachable`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    try { window.history.replaceState({}, '', '/hunter/register') } catch {}
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a14] via-[#2e3621] to-[#1f2917] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#b1c98d]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#b1c98d]/5 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Header with Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#b1c98d] rounded-xl flex items-center justify-center font-bold text-[#2e3621]">
              b2
            </div>
            <span className="text-3xl font-bold text-white">b2zi</span>
          </div>
          <p className="text-[#b1c98d]/60 text-sm tracking-wider uppercase">Join the Network</p>
        </div>

        {/* Main Card */}
        <div className="bg-[#2e3621]/80 backdrop-blur-xl border border-[#b1c98d]/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-[#b1c98d]/70 text-sm">Join b2zi and start onboarding merchants today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm mb-4">
                {error}
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#b1c98d] text-sm font-medium mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b1c98d]/40" size={16} />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-[#b1c98d]/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#b1c98d]/50 focus:bg-white/10 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#b1c98d] text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-2.5 bg-white/5 border border-[#b1c98d]/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#b1c98d]/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[#b1c98d] text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b1c98d]/40" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@b2zi.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-[#b1c98d]/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#b1c98d]/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-[#b1c98d] text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b1c98d]/40" size={16} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+263771234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-[#b1c98d]/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#b1c98d]/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Region Field */}
            <div>
              <label className="block text-[#b1c98d] text-sm font-medium mb-2">Region (Optional)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b1c98d]/40" size={16} />
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Harare CBD"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-[#b1c98d]/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#b1c98d]/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[#b1c98d] text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b1c98d]/40" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-[#b1c98d]/20 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#b1c98d]/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password || !firstName || !lastName}
              className="w-full mt-6 bg-[#b1c98d] hover:bg-[#c8daa5] text-[#2e3621] py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-6 border-t border-[#b1c98d]/10">
              <p className="text-white/60 text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onBack}
                  className="text-[#b1c98d] hover:text-[#c8daa5] font-semibold transition-colors"
                >
                  Sign in
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
