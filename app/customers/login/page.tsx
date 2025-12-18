"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Lock, LogIn, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CustomerLoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Login failed')
        return
      }

      // Save customer to localStorage
      localStorage.setItem('b2zi_user', JSON.stringify(data.customer))
      router.push('/marketplace')
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#b1c98d] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-[#b1c98d] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-40 w-96 h-96 bg-[#b1c98d] rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000" />
      </div>

      <nav className="fixed top-0 left-0 right-0 border-b border-[#2e3621]/20 bg-white/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#2e3621] hover:text-[#b1c98d] transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b1c98d] mb-4">
              <ShoppingBag className="h-8 w-8 text-[#2e3621]" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-2">Welcome Back!</h1>
            <p className="text-[#2e3621] text-lg">Sign in to continue shopping</p>
          </div>

          <Card className="p-8 shadow-2xl border-2 border-[#b1c98d]/30 bg-white animate-fade-in-up animation-delay-200 hover:border-[#b1c98d] transition-all duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-black">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2e3621]/50 transition-colors duration-300 group-focus-within:text-[#b1c98d]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-11 h-12 text-base border-[#2e3621]/30 focus:border-[#b1c98d] focus:ring-[#b1c98d] transition-all"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-black">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2e3621]/50 transition-colors duration-300 group-focus-within:text-[#b1c98d]" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-11 h-12 text-base border-[#2e3621]/30 focus:border-[#b1c98d] focus:ring-[#b1c98d] transition-all"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-[#2e3621] hover:bg-[#b1c98d] text-white hover:text-black transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </div>
                )}
              </Button>

              <div className="text-center pt-4 border-t border-[#2e3621]/20">
                <p className="text-sm text-[#2e3621]">
                  Don't have an account?{" "}
                  <Link
                    href="/customers/register"
                    className="font-semibold text-[#2e3621] hover:text-[#b1c98d] underline"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
