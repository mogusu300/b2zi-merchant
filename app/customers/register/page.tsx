"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Lock, CheckCircle2, ShoppingBag, Truck, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function CustomerRegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Registration failed')
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
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#b1c98d] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-[#b1c98d] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-40 w-96 h-96 bg-[#b1c98d] rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000" />
      </div>

      <nav className="border-b border-[#2e3621]/20 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#2e3621] hover:text-[#b1c98d] transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left side - Benefits */}
            <div className="space-y-8 text-black">
              <div>
                <Badge className="mb-4 bg-[#b1c98d]/30 text-[#2e3621] border-[#b1c98d]/50">
                  Join Thousands of Happy Shoppers
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Start Shopping on Zimbabwe's Premier Marketplace
                </h1>
                <p className="text-xl text-[#2e3621]">
                  Create your free account and get access to thousands of products from verified sellers.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: ShoppingBag,
                    title: "Browse Thousands of Products",
                    description: "Discover quality products from electronics to fashion, all verified.",
                  },
                  {
                    icon: Truck,
                    title: "Fast & Reliable Delivery",
                    description: "Track your orders and get delivery across Zimbabwe.",
                  },
                  {
                    icon: Shield,
                    title: "Secure Shopping",
                    description: "Shop with confidence knowing your data is secure.",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-[#b1c98d]/30 flex items-center justify-center border border-[#b1c98d]/50">
                      <benefit.icon className="h-6 w-6 text-[#2e3621]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-lg">{benefit.title}</h3>
                      <p className="text-[#2e3621]/70 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Registration Form */}
            <div>
              <Card className="p-8 md:p-10 shadow-xl border-2 border-[#b1c98d]/30 bg-white">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-black mb-2">Create Your Account</h2>
                  <p className="text-[#2e3621]">Join B2Zi and start shopping today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium text-black">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2e3621]/50" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium text-black">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2e3621]/50" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-medium text-black">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2e3621]/50" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base"
                        required
                        minLength={6}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base font-medium text-black">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2e3621]/50" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base"
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
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Create Account
                      </div>
                    )}
                  </Button>

                  <div className="text-center pt-4 border-t border-[#2e3621]/20">
                    <p className="text-sm text-[#2e3621]">
                      Already have an account?{" "}
                      <Link
                        href="/customers/login"
                        className="font-semibold text-[#2e3621] hover:text-[#b1c98d] underline"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
