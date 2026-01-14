"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Lock, CheckCircle2, ShoppingBag, Truck, Shield, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import CustomerRegisterBackground from "./background"

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

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || `Registration failed (${response.status})`)
        setIsSubmitting(false)
        return
      }

      // Registration successful
      if (data.customer) {
        localStorage.setItem("b2zi_user", JSON.stringify(data.customer))
        console.log("Registration successful, user saved to localStorage:", data.customer)
      }
      
      // Clear form
      setFormData({ name: "", email: "", password: "", confirmPassword: "" })
      
      // Redirect to marketplace
      console.log("Redirecting to marketplace...")
      router.replace("/marketplace")
    } catch (error) {
      console.error("Registration error:", error)
      setErrorMessage(error instanceof Error ? error.message : "An error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Unique background for Customer Register */}
      <div className="fixed inset-0 -z-20">
        <CustomerRegisterBackground />
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-white/80 to-white/90 -z-10" />

      <nav className="border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition-all duration-300 hover:translate-x-1"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 hover:-translate-x-1" />
              <span className="font-semibold text-sm">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left side - Benefits */}
            <div className="space-y-8 text-gray-800">
              <div className="animate-fade-in-up">
                <Badge
                  className="mb-4 bg-green-100/70 text-green-700 border-green-300 animate-bounce-slow"
                  variant="outline"
                >
                  Join Thousands of Happy Shoppers
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-gray-900">
                  Start Shopping Today
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed text-pretty">
                  Create your free account and get access to thousands of verified products from trusted sellers across Zimbabwe.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: ShoppingBag,
                    title: "Browse Thousands of Products",
                    description: "Discover quality products from electronics to fashion, all verified and trusted.",
                  },
                  {
                    icon: Truck,
                    title: "Fast & Reliable Delivery",
                    description: "Track your orders and get reliable delivery across Zimbabwe.",
                  },
                  {
                    icon: Shield,
                    title: "Secure Shopping",
                    description: "Shop with confidence knowing your data and transactions are secure.",
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex gap-4 animate-fade-in-up group hover:translate-x-2 transition-transform duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-green-100/50 flex items-center justify-center transition-all duration-300 group-hover:bg-green-100 group-hover:scale-110 border border-green-200">
                      <benefit.icon className="h-6 w-6 text-green-700 transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-lg text-gray-900">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="p-6 bg-green-50/60 border-green-200 animate-fade-in-up animation-delay-300 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-green-700">New Shopper?</strong> Sign up now and get ready to explore Zimbabwe's premier marketplace.
                </p>
              </Card>
            </div>

            {/* Right side - Registration Form */}
            <div className="animate-fade-in-up animation-delay-200">
              <Card className="p-8 md:p-10 shadow-2xl border border-green-200 hover:shadow-2xl transition-shadow duration-500 bg-white/90 backdrop-blur hover:border-green-400">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                  <p className="text-gray-600">Join B2Zi and start shopping today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium text-gray-900">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-green-600" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all"
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium text-gray-900">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-green-600" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-green-600 transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-medium text-gray-900">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-green-600" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base font-medium text-gray-900">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-green-600" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-green-700 hover:bg-green-800 text-white transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Create Account
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>

                  <div className="mt-8 space-y-4 border-t border-gray-200 pt-8">
                    <p className="text-center text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link
                        href="/customers/login"
                        className="text-green-700 font-semibold hover:text-green-800 transition-colors"
                      >
                        Sign In
                      </Link>
                    </p>
                    <p className="text-center text-sm text-gray-600">
                      <Link href="/" className="text-green-700 font-semibold hover:text-green-800 transition-colors">
                        Back to Home
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
