"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowRight, Mail, Clock, ShoppingCart, Truck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Consistent background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/80 to-white/90 -z-10" />

      <nav className="border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-green-700 transition-all duration-300 hover:translate-x-1"
            >
              <span className="font-semibold text-sm">← Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100/70 mb-6 animate-bounce-slow">
              <CheckCircle2 className="h-12 w-12 text-green-700" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-gray-900">Account Created Successfully!</h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-6 text-pretty">
              Welcome to B2Zi! Your customer account is ready.
            </p>
            <Badge
              className="bg-green-100/70 text-green-700 border-green-300 px-4 py-2 text-base animate-bounce-slow"
              variant="outline"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Account Verified & Active
            </Badge>
          </div>

          {/* Benefits Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 animate-fade-in-up animation-delay-100">
            {[
              {
                icon: ShoppingCart,
                title: "Start Shopping",
                description: "Browse thousands of products from trusted sellers across Zimbabwe.",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Track your orders and get reliable delivery to your doorstep.",
              },
              {
                icon: Shield,
                title: "Secure Transactions",
                description: "Your data and payments are protected with industry-leading security.",
              },
              {
                icon: Mail,
                title: "Order Updates",
                description: "Receive notifications for every step of your shopping journey.",
              },
            ].map((benefit, index) => (
              <Card
                key={index}
                className="p-6 border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur"
              >
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-green-100/50 flex items-center justify-center border border-green-200">
                    <benefit.icon className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Next Steps */}
          <Card className="p-8 md:p-10 shadow-xl border border-gray-200 mb-8 animate-fade-in-up animation-delay-200 bg-white/90 backdrop-blur">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">What Happens Next?</h2>

            <div className="space-y-6">
              {[
                {
                  icon: CheckCircle2,
                  title: "Account Activated",
                  description:
                    "Your account is ready to use immediately. You can start exploring products right away.",
                },
                {
                  icon: ShoppingCart,
                  title: "Browse Products",
                  description:
                    "Visit the marketplace to discover thousands of quality products from verified sellers.",
                },
                {
                  icon: Clock,
                  title: "Make Your First Purchase",
                  description:
                    "Add items to your cart, proceed to checkout, and enjoy seamless shopping with real-time order tracking.",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-lg bg-green-50/50 border border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300"
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-green-100/50 flex items-center justify-center border border-green-200">
                    <step.icon className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Action Card */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200 mb-8 animate-fade-in-up animation-delay-300">
            <p className="text-base text-gray-700 leading-relaxed">
              <strong className="text-green-700">Ready to shop?</strong> Your account is fully activated and you can start browsing and purchasing right away. Visit the marketplace to discover amazing products!
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button
              onClick={() => router.push("/marketplace")}
              size="lg"
              className="bg-green-700 hover:bg-green-800 text-white text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 h-auto border-2 border-gray-300 text-gray-900 hover:border-green-400 hover:bg-green-50"
            >
              Return to Home
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center animate-fade-in-up animation-delay-500">
            <p className="text-gray-600 mb-4">Need help getting started?</p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors"
            >
              Contact Our Support Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
