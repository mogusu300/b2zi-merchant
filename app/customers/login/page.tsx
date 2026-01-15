"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Lock, LogIn, ShoppingBag, Truck, Shield, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import CustomerLoginBackground from "./background"

export default function CustomerLoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess) {
      console.log('[CUSTOMER LOGIN PAGE] 🚀 Redirecting to marketplace...')
      router.push('/marketplace')
    }
  }, [loginSuccess, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      console.log("Starting customer login...")
      const result = await login(formData.email, formData.password, "customer")
      console.log("Login result:", result)
      
      if (!result.success) {
        const error = result.error || "Login failed"
        console.error("Login failed:", error)
        setErrorMessage(error)
        setIsSubmitting(false)
        return
      }

      // Save user to localStorage for marketplace
      if (result.user) {
        localStorage.setItem("b2zi_user", JSON.stringify(result.user))
        console.log("Login successful, user saved to localStorage:", result.user)
      }

      // Clear form
      setFormData({ email: "", password: "" })
      
      // Trigger redirect via state change (React will handle timing properly)
      console.log('[CUSTOMER LOGIN PAGE] ✅ Login successful, triggering redirect...')
      setLoginSuccess(true)
    } catch (error) {
      console.error("Login error:", error)
      const errorMsg = error instanceof Error ? error.message : "An error occurred. Please try again."
      setErrorMessage(errorMsg)
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Unique background for Customer Login */}
      <div className="fixed inset-0 -z-20">
        <CustomerLoginBackground />
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-white/80 to-white/90 -z-10" />

      <nav className="border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-all duration-300 hover:translate-x-1"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 hover:-translate-x-1" />
              <span className="font-semibold text-sm">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Benefits */}
            <div className="space-y-8 text-foreground">
              <div className="animate-fade-in-up">
                <Badge
                  className="mb-4 bg-primary/10 text-primary border-primary/30 animate-bounce-slow"
                  variant="outline"
                >
                  Customer Portal
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-foreground">
                  Welcome Back, Shopper!
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                  Sign in to continue exploring thousands of amazing products from trusted sellers across Zimbabwe.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: ShoppingBag,
                    title: "Easy Shopping",
                    description: "Browse and purchase from your favorite stores with just a few clicks.",
                  },
                  {
                    icon: Truck,
                    title: "Fast Delivery",
                    description: "Track your orders in real-time and know exactly when they arrive.",
                  },
                  {
                    icon: Shield,
                    title: "Safe & Secure",
                    description: "Your data and transactions are protected with industry-leading security.",
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex gap-4 animate-fade-in-up group hover:translate-x-2 transition-transform duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 border border-primary/30">
                      <benefit.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-lg text-foreground">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="p-6 bg-primary/10 border-primary/30 animate-fade-in-up animation-delay-300 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <p className="text-sm text-foreground leading-relaxed">
                  <strong className="text-primary">Tip:</strong> Sign in to save your favorites, track orders, and enjoy personalized recommendations.
                </p>
              </Card>
            </div>

            {/* Right side - Login Form */}
            <div className="animate-fade-in-up animation-delay-200">
              <Card className="p-8 md:p-10 shadow-2xl border border-primary/30 hover:shadow-2xl transition-shadow duration-500 bg-background/90 backdrop-blur hover:border-primary/50">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Sign In</h2>
                  <p className="text-muted-foreground">Enter your credentials to access your account and continue shopping</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <p className="text-sm text-destructive">{errorMessage}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium text-foreground">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base font-medium text-foreground">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-11 h-12 text-base bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-background transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-8 space-y-4 border-t border-border pt-8">
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/customers/register" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                      Create one now
                    </Link>
                  </p>
                  <p className="text-center text-sm text-muted-foreground">
                    Are you a seller?{" "}
                    <Link href="/sellers/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
