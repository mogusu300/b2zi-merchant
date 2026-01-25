"use client"

import type React from "react"
import { useState } from "react"
import { User, Store, MapPin, Briefcase, Save, CheckCircle, Smartphone, Camera, Mail, Lock, FileText } from "lucide-react"
import type { Merchant } from "../types"
import { isTokenExpired, ensureHunterTokenValid } from "../lib/tokenManager"

interface OnboardingFormProps {
  onSubmit: (merchant: Merchant) => void
  hunterToken?: string
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit, hunterToken }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    businessAddress: "",
    businessType: "",
    email: "",
    phone: "",
    password: "",
    idType: "nrc",
  })
  const [idFront, setIdFront] = useState<File | null>(null)
  const [idBack, setIdBack] = useState<File | null>(null)

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "idFront" | "idBack") => {
    if (e.target.files && e.target.files[0]) {
      if (field === "idFront") {
        setIdFront(e.target.files[0])
      } else {
        setIdBack(e.target.files[0])
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (step === 1) {
      // Just move to step 2
      if (!formData.businessName || !formData.ownerName || !formData.email || !formData.phone || !formData.businessType || !formData.businessAddress || !formData.password) {
        alert("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }
      setStep(2)
      setIsSubmitting(false)
    } else {
      // Step 2: Submit to backend API
      if (!idFront || !idBack) {
        alert("Please upload both ID documents")
        setIsSubmitting(false)
        return
      }

      try {
        console.log('[PWA] Submitting merchant registration')
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        let token = hunterToken || localStorage.getItem('hunterToken')
        
        console.log('[PWA] API URL:', apiUrl)
        console.log('[PWA] Token available:', !!token)
        
        // CHECK TOKEN EXPIRATION AND REFRESH IF NEEDED
        if (token && isTokenExpired(token, 5)) {
          console.log('[PWA] ⚠️  Token expired or expiring soon, attempting refresh...')
          const validToken = await ensureHunterTokenValid()
          if (validToken) {
            token = validToken
            console.log('[PWA] ✅ Token refreshed successfully')
          } else {
            console.error('[PWA] ❌ Token refresh failed - cannot proceed with registration')
            alert('Your login session has expired. Please log in again.')
            setIsSubmitting(false)
            return
          }
        } else {
          console.log('[PWA] ✅ Token is valid')
        }
        
        console.log('[PWA] Token value:', token ? token.slice(0, 20) + '...' : 'NONE')
        
        // Build multipart form data to include ID images
        const form = new FormData()
        form.append('businessName', formData.businessName)
        form.append('ownerName', formData.ownerName)
        form.append('email', formData.email)
        form.append('phone', formData.phone)
        form.append('businessType', formData.businessType)
        form.append('businessAddress', formData.businessAddress)
        form.append('idType', formData.idType)
        form.append('password', formData.password)
        if (idFront) form.append('idFront', idFront)
        if (idBack) form.append('idBack', idBack)

        const headers: Record<string, string> = {}
        if (token) {
          headers.Authorization = `Bearer ${token}`
          console.log('[PWA] Authorization header set')
        } else {
          console.warn('[PWA] WARNING: No token, registering without hunter assignment')
        }

        console.log('[PWA] Sending request to:', `${apiUrl}/api/v1/merchants/onboard`)
        const response = await fetch(`${apiUrl}/api/v1/merchants/onboard`, {
          method: 'POST',
          headers,
          body: form,
        })

        console.log('[PWA] Response status:', response.status)
        const contentType = response.headers.get('content-type') || ''
        const data = contentType.includes('application/json') ? await response.json() : await response.text()
        console.log('[PWA] Response data:', data)

        if (response.ok) {
          // Support different backend shapes: data.merchant.id or data.id
          const merchantId = (data as any)?.data?.merchant?.id || (data as any)?.data?.id || (data as any)?.id

          if (!merchantId) {
            throw new Error('Unexpected response from server')
          }

          console.log('[PWA] Merchant created successfully:', merchantId)

          const newMerchant: Merchant = {
            id: merchantId,
            name: formData.businessName,
            owner: formData.ownerName,
            location: formData.businessAddress,
            category: formData.businessType,
            status: 'Pending',
            dateAdded: new Date().toISOString().split('T')[0],
          }

          console.log('[PWA] Created merchant object:', newMerchant)

          setIsSubmitting(false)
          setShowSuccess(true)

          setTimeout(() => {
            console.log('[PWA] Calling onSubmit with merchant:', newMerchant)
            onSubmit(newMerchant)
          }, 1200)
        } else {
          const message = typeof data === 'string' ? data : (data as any)?.error?.message || (data as any)?.message || 'Unknown error'
          console.error('[PWA] Registration failed:', message)
          alert('Registration failed: ' + message)
          setIsSubmitting(false)
        }
      } catch (error) {
        console.error('[PWA] Registration error:', error)
        console.error('[PWA] Error stack:', (error as any)?.stack)
        alert('Failed to register: ' + (error instanceof Error ? error.message : 'Unknown error'))
        setIsSubmitting(false)
      }
    }
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 text-center animate-fade-in-up">
        <div
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <CheckCircle size={48} />
        </div>
        <h3 className="text-2xl font-bold mb-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Registration Successful!
        </h3>
        <p className="text-gray-500 max-w-sm px-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Merchant data for <strong>{formData.businessName}</strong> has been securely submitted. Verification process usually
          takes 24-48 hours.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">New Field Activation</h2>
        <p className="text-sm text-gray-500">Register a local CBD retailer on the platform</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Step Indicator with smooth animation */}
        <div className="flex h-1">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 transition-colors duration-500 ${step >= s ? "bg-custom-sage" : "bg-gray-100"}`}
            ></div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 ? (
            <div className="space-y-6 animate-slide-in-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Business Name
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Enter your business or store name"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-custom-sage outline-none transition-all active:scale-95"
                    />
                  </div>
                  <p className="text-xs text-gray-400">This is how customers will find you on the platform</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Owner Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-custom-sage outline-none transition-all active:scale-95"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="business@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-custom-sage outline-none transition-all active:scale-95"
                  />
                </div>
                <p className="text-xs text-gray-400">We'll send order notifications and important updates here</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Contact Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+263 7XX XXX XXXX"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-custom-sage outline-none transition-all active:scale-95"
                  />
                </div>
                <p className="text-xs text-gray-400">For urgent order updates and customer communication</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Business Type
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      placeholder="e.g., Retail, Wholesale, Services"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-custom-sage outline-none transition-all active:scale-95"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Business Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      placeholder="Your business location"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-custom-sage outline-none transition-all active:scale-95"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-custom-sage outline-none transition-all active:scale-95"
                  />
                </div>
                <p className="text-xs text-gray-400">Use a strong password with letters, numbers, and symbols</p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-4 bg-custom-olive text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-custom-olive/20 active:scale-95"
              >
                Next Step: Documentation
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-slide-in-left">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
                <FileText className="text-blue-500 flex-shrink-0" size={20} />
                <p className="text-sm text-blue-800">
                  To ensure marketplace security, please upload a clear photo of your National Registration Card (NRC) or Passport. Both front and back images are required.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    ID Document Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="idType"
                        value="nrc"
                        checked={formData.idType === "nrc"}
                        onChange={handleChange}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">National Registration Card</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="idType"
                        value="passport"
                        checked={formData.idType === "passport"}
                        onChange={handleChange}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Passport</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Front of {formData.idType === "nrc" ? "NRC" : "Passport"}
                  </label>
                  <div className="relative">
                    <input
                      id="idFront"
                      name="idFront"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setIdFront(e.target.files[0])
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="idFront"
                      className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-custom-sage hover:bg-custom-sage/5 transition-all group"
                    >
                      {idFront ? (
                        <div className="text-center">
                          <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">{idFront.name}</p>
                          <p className="text-xs text-gray-400">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera size={32} className="text-gray-400 mx-auto mb-2 group-hover:text-custom-sage" />
                          <p className="text-sm font-medium text-gray-600">Click to upload front image</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Back of {formData.idType === "nrc" ? "NRC" : "Passport"}
                  </label>
                  <div className="relative">
                    <input
                      id="idBack"
                      name="idBack"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setIdBack(e.target.files[0])
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="idBack"
                      className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-custom-sage hover:bg-custom-sage/5 transition-all group"
                    >
                      {idBack ? (
                        <div className="text-center">
                          <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700">{idBack.name}</p>
                          <p className="text-xs text-gray-400">Click to change</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera size={32} className="text-gray-400 mx-auto mb-2 group-hover:text-custom-sage" />
                          <p className="text-sm font-medium text-gray-600">Click to upload back image</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !idFront || !idBack}
                  className="flex-[2] py-4 bg-custom-olive text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-custom-olive/20 disabled:opacity-70 active:scale-95"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      Complete Registration <Save size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default OnboardingForm
