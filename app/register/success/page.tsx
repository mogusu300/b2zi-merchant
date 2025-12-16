"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, Sparkles, ArrowRight, Mail, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SuccessPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-20">
        <img
          src="/success-digital-business-growth-celebration-zimb.jpg"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-background/95 via-background/90 to-accent/20 -z-10" />

      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Image
              src="/images/whatsapp-20image-202025-11-23-20at-207.jpeg"
              alt="B2Zi Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-accent/20 mb-6 animate-bounce-slow">
              <CheckCircle2 className="h-12 w-12 text-accent" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">Welcome to B2Zi!</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 text-pretty">
              Your merchant account has been successfully registered.
            </p>
            <Badge
              className="bg-accent/20 text-accent-foreground border-accent/30 px-4 py-2 text-base"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              You're among the first merchants to join!
            </Badge>
          </div>

          <Card className="p-8 md:p-10 shadow-xl border-2 border-accent/20 mb-8 animate-fade-in-up animation-delay-100">
            <h2 className="text-2xl font-bold mb-6 text-center">What Happens Next?</h2>

            <div className="space-y-6">
              {[
                {
                  icon: Mail,
                  title: "Check Your Email",
                  description:
                    "We will notify you via mail Your merchant store is ready.",
                },
                {
                  icon: Shield,
                  title: "Identity Verification",
                  description:
                    "Our team will review your submitted documents within 24-48 hours. You'll receive an email once verification is complete.",
                },
                {
                  icon: Calendar,
                  title: "Platform Launch",
                  description:
                    "We'll notify you as soon as the platform launches. You'll be among the first to set up your products and start selling.",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border hover:border-accent transition-all duration-300 hover:translate-x-2"
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-lg">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-0 shadow-xl mb-8 animate-fade-in-up animation-delay-200">
            <h3 className="text-2xl font-bold mb-4 text-center">Early Merchant Benefits</h3>
            <ul className="space-y-3">
              {[
                "Priority placement in search results and category pages",
                "Featured merchant badge on your storefront",
                "50% fee reduction for the first 6 months",
                "Dedicated onboarding support and training",
                "Early access to premium features and analytics",
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="text-center space-y-4 animate-fade-in-up animation-delay-300">
            <p className="text-lg text-muted-foreground">Questions about your registration or the platform?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Return to Homepage
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-8 py-6 h-auto border-2 bg-transparent">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
