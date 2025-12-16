"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Store,
  Mail,
  Phone,
  Lock,
  Sparkles,
  CheckCircle2,
  Upload,
  FileText,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    businessType: "",
    businessAddress: "",
    password: "",
    idType: "nrc",
  })
  const [files, setFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
  })

  const uploadFile = async (file: File | null): Promise<string | null> => {
    if (!file) return null
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const { url } = await response.json()
      return url
    } catch (error) {
      console.error('[Registration] Upload error:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.businessName || !formData.ownerName || !formData.email || !formData.phone || !formData.businessType || !formData.businessAddress || !formData.password) {
        setErrorMessage("Please fill in all required fields")
        return
      }
      setCurrentStep(2)
    } else {
      // Validate step 2 files
      if (!files.idFront || !files.idBack) {
        setErrorMessage("Please upload both ID documents")
        return
      }

      setIsSubmitting(true)
      try {
        // Upload ID files
        const [idFrontUrl, idBackUrl] = await Promise.all([
          uploadFile(files.idFront),
          uploadFile(files.idBack)
        ])

        // Submit registration
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            email: formData.email,
            phone: formData.phone,
            businessType: formData.businessType,
            businessAddress: formData.businessAddress,
            idType: formData.idType,
            password: formData.password,
            idFrontUrl,
            idBackUrl,
          })
        })

        if (response.ok) {
          router.push("/register/success")
        } else {
          const error = await response.json()
          setErrorMessage(error.error || 'Registration failed')
        }
      } catch (error) {
        console.error('[Registration] Error:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Failed to complete registration')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "idFront" | "idBack") => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] })
    }
  }

  const progress = (currentStep / 2) * 100

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-20">
        <img
          src="/modern-african-storefront-shop-business-owner-zimb.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-background/95 via-background/90 to-secondary/30 -z-10" />

      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:translate-x-1"
            >
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 hover:-translate-x-1" />
              <div className="flex items-center gap-2">
                <Image
                  src="/images/whatsapp-20image-202025-11-23-20at-207.jpeg"
                  alt="B2Zi Logo"
                  width={100}
                  height={33}
                  className="h-8 w-auto"
                />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="animate-fade-in-up">
                <Badge
                  className="mb-4 bg-accent/20 text-accent-foreground border-accent/30 animate-bounce-slow"
                  variant="outline"
                >
                  Limited Spots Available
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                  Join Zimbabwe's Premier Digital Marketplace
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                  Secure your merchant account with B2Zi before launch. Early registrants get priority placement,
                  featured listings, and dedicated support to ensure your success.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full font-semibold transition-all duration-300 ${
                      currentStep >= 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
                  </div>
                  <div>
                    <h3 className="font-semibold">Business Information</h3>
                    <p className="text-sm text-muted-foreground">Basic details about your business</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full font-semibold transition-all duration-300 ${
                      currentStep >= 2 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Identity Verification</h3>
                    <p className="text-sm text-muted-foreground">Upload your ID document</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Sparkles,
                    title: "Zero Launch Fees",
                    description:
                      "Register completely free with no setup costs or monthly charges during our launch period.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Early Merchant Benefits",
                    description:
                      "Priority search placement, featured product listings, and personalized onboarding assistance.",
                  },
                  {
                    icon: Store,
                    title: "Complete Merchant Platform",
                    description:
                      "Professional dashboard with analytics, inventory management, customer messaging, and order tracking.",
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex gap-4 animate-fade-in-up group hover:translate-x-2 transition-transform duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
                      <benefit.icon className="h-6 w-6 text-accent transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-lg">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="p-6 bg-muted/50 border-accent/20 animate-fade-in-up animation-delay-300 hover:border-accent transition-all duration-300 hover:shadow-lg">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Launch Bonus:</strong> The first 250 merchants to register will
                  receive lifetime fee reductions of up to 50% plus premium features at no additional cost.
                </p>
              </Card>
            </div>

            <div className="animate-fade-in-up animation-delay-200">
              <Card className="p-8 md:p-10 shadow-xl border-2 hover:shadow-2xl transition-shadow duration-500 bg-card/95 backdrop-blur">
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold">
                      {currentStep === 1 ? "Create Your Account" : "Verify Your Identity"}
                    </h2>
                    <span className="text-sm text-muted-foreground">Step {currentStep} of 2</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-muted-foreground mt-2">
                    {currentStep === 1 ? "Enter your business details" : "Upload your identification document"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <p className="text-sm text-destructive">{errorMessage}</p>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-base font-medium">
                          Business Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative group">
                          <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-accent" />
                          <Input
                            id="businessName"
                            name="businessName"
                            type="text"
                            placeholder="Enter your business or store name"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="pl-11 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent focus:border-accent"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          This is how customers will find you on the platform
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ownerName" className="text-base font-medium">
                          Owner Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative group">
                          <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-accent" />
                          <Input
                            id="ownerName"
                            name="ownerName"
                            type="text"
                            placeholder="Your full name"
                            value={formData.ownerName}
                            onChange={handleChange}
                            className="pl-11 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent focus:border-accent"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-medium">
                          Business Email <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-accent" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="business@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-11 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent focus:border-accent"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          We'll send order notifications and important updates here
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base font-medium">
                          Contact Number <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-accent" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+263 7XX XXX XXXX"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-11 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent focus:border-accent"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          For urgent order updates and customer communication
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessType" className="text-base font-medium">
                          Business Type <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="businessType"
                          name="businessType"
                          type="text"
                          placeholder="e.g., Retail, Wholesale, Services"
                          value={formData.businessType}
                          onChange={handleChange}
                          className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent focus:border-accent"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessAddress" className="text-base font-medium">
                          Business Address <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="businessAddress"
                          name="businessAddress"
                          type="text"
                          placeholder="Your business location"
                          value={formData.businessAddress}
                          onChange={handleChange}
                          className="h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent focus:border-accent"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-base font-medium">
                          Create Password <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-accent" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-11 h-12 text-base transition-all duration-300 focus:ring-2 focus:ring-accent focus:border-accent"
                            required
                            minLength={8}
                            disabled={isSubmitting}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use a strong password with letters, numbers, and symbols
                        </p>
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg border border-accent/20">
                          <div className="flex gap-3 items-start">
                            <FileText className="h-5 w-5 text-accent mt-0.5" />
                            <div>
                              <h4 className="font-semibold mb-1">Identity Verification Required</h4>
                              <p className="text-sm text-muted-foreground">
                                To ensure marketplace security, please upload a clear photo of your National
                                Registration Card (NRC) or Passport. Both front and back images are required.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-medium">ID Document Type</Label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="idType"
                                value="nrc"
                                checked={formData.idType === "nrc"}
                                onChange={handleChange}
                                className="h-4 w-4 text-accent"
                              />
                              <span>National Registration Card</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="idType"
                                value="passport"
                                checked={formData.idType === "passport"}
                                onChange={handleChange}
                                className="h-4 w-4 text-accent"
                              />
                              <span>Passport</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="idFront" className="text-base font-medium">
                            Front of {formData.idType === "nrc" ? "NRC" : "Passport"}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="idFront"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, "idFront")}
                              className="hidden"
                              required
                            />
                            <label
                              htmlFor="idFront"
                              className="flex items-center justify-center gap-3 h-32 border-2 border-dashed border-border hover:border-accent rounded-lg cursor-pointer transition-all duration-300 hover:bg-accent/5"
                            >
                              {files.idFront ? (
                                <div className="text-center">
                                  <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
                                  <p className="text-sm font-medium">{files.idFront.name}</p>
                                  <p className="text-xs text-muted-foreground">Click to change</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm font-medium">Click to upload front image</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="idBack" className="text-base font-medium">
                            Back of {formData.idType === "nrc" ? "NRC" : "Passport"}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="idBack"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, "idBack")}
                              className="hidden"
                              required
                            />
                            <label
                              htmlFor="idBack"
                              className="flex items-center justify-center gap-3 h-32 border-2 border-dashed border-border hover:border-accent rounded-lg cursor-pointer transition-all duration-300 hover:bg-accent/5"
                            >
                              {files.idBack ? (
                                <div className="text-center">
                                  <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
                                  <p className="text-sm font-medium">{files.idBack.name}</p>
                                  <p className="text-xs text-muted-foreground">Click to change</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="text-sm font-medium">Click to upload back image</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                          <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Tip:</strong> Ensure your ID is clearly visible,
                            well-lit, and all text is readable for faster verification.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 pt-4">
                    {currentStep === 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 h-12 text-base font-semibold"
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          {currentStep === 1 ? "Processing..." : "Submitting..."}
                        </>
                      ) : currentStep === 1 ? (
                        <>
                          Continue to Verification
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>

                  {currentStep === 1 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        By registering, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  )}
                </form>

                <div className="mt-8 pt-8 border-t text-center">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent animate-pulse" />
                    Your information is encrypted and secure
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
