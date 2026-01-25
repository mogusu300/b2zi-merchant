"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Phone, Lock, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"

interface MerchantLoginProps {
  onBack: () => void
  onLoginSuccess: (token: string, merchant: any) => void
}

export const MerchantLogin: React.FC<MerchantLoginProps> = ({ onBack, onLoginSuccess }) => {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [useOtp, setUseOtp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const endpoint = useOtp
        ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/auth/merchant/login?useOtp=true`
        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/auth/merchant/login`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          password: useOtp ? undefined : password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Login failed")
      }

      // Store token
      localStorage.setItem("merchantToken", data.data.accessToken)
      localStorage.setItem("refreshToken", data.data.refreshToken)
      localStorage.setItem("merchantData", JSON.stringify(data.data.merchant))

      onLoginSuccess(data.data.accessToken, data.data.merchant)
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-custom-olive/10 to-custom-sage/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-custom-olive mb-8 hover:gap-3 transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <Card className="p-8 border border-custom-olive/20 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-custom-olive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-custom-olive" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-custom-olive">Merchant Login</h1>
            <p className="text-gray-600 mt-2">Access your merchant portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+263 77 123 4567"
                  className="pl-10 py-3 text-lg border-2 border-gray-200 focus:border-custom-olive"
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Registered phone number</p>
            </div>

            {/* Password or OTP Toggle */}
            {!useOtp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 py-3 border-2 border-gray-200 focus:border-custom-olive"
                    disabled={isLoading}
                    required={!useOtp}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP Message */}
            {useOtp && (
              <div className="p-4 bg-custom-sage/10 border border-custom-sage/30 rounded-lg text-sm text-gray-700">
                An OTP will be sent to your registered phone number
              </div>
            )}

            {/* Toggle OTP */}
            <button
              type="button"
              onClick={() => {
                setUseOtp(!useOtp)
                setPassword("")
                setError("")
              }}
              className="text-sm text-custom-olive hover:underline font-medium"
            >
              {useOtp ? "Use Password Instead" : "Use OTP Instead"}
            </button>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !phone || (!useOtp && !password)}
              className="w-full bg-custom-olive hover:bg-custom-olive/90 text-white py-3 font-semibold text-lg rounded-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Don't have an account yet?</span>
            </div>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-gray-600">
            <p>Your merchant account is created during onboarding</p>
            <p className="mt-2 text-xs">Contact a FieldPro agent to get started</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
