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
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Consistent background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background/80 to-background/90 -z-10" />

      <nav className="border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-success transition-all duration-300 hover:translate-x-1"
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
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-success/20 mb-6 animate-bounce-slow">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-foreground">Account Created Successfully!</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 text-pretty">
              Welcome to B2Zi! Your customer account is ready.
            </p>
            <Badge
              className="bg-success/20 text-success border-success/30 px-4 py-2 text-base animate-bounce-slow"
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
                className="p-6 border border-border hover:border-success/50 hover:shadow-lg transition-all duration-300 bg-background/90 backdrop-blur"
              >
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center border border-success/30">
                    <benefit.icon className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Next Steps */}
          <Card className="p-8 md:p-10 shadow-xl border border-border mb-8 animate-fade-in-up animation-delay-200 bg-background/90 backdrop-blur">
            <h2 className="text-2xl font-bold mb-6 text-foreground">What Happens Next?</h2>

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
                  className="flex gap-4 p-4 rounded-lg bg-success/5 border border-success/20 hover:border-success/40 hover:bg-success/10 transition-all duration-300"
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center border border-success/30">
                    <step.icon className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Action Card */}
          <Card className="p-6 bg-gradient-to-br from-success/5 to-success/5 border border-success/20 mb-8 animate-fade-in-up animation-delay-300">
            <p className="text-base text-muted-foreground leading-relaxed">
              <strong className="text-success">Ready to shop?</strong> Your account is fully activated and you can start browsing and purchasing right away. Visit the marketplace to discover amazing products!
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button
              onClick={() => router.push("/marketplace")}
              size="lg"
              className="bg-success hover:bg-success/90 text-background text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 h-auto border-2 border-border text-foreground hover:border-success/50 hover:bg-success/5"
            >
              Return to Home
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t border-border text-center animate-fade-in-up animation-delay-500">
            <p className="text-muted-foreground mb-4">Need help getting started?</p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 text-success font-semibold hover:text-success/90 transition-colors"
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
