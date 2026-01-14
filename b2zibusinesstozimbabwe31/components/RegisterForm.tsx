"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Mail, Lock, Phone, ArrowLeft, ShoppingBag } from "lucide-react"

export const RegisterForm: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const userData = { name: formData.name, email: formData.email, password: formData.password }
      localStorage.setItem("b2zi_account_data", JSON.stringify(userData))
      localStorage.setItem("b2zi_user", JSON.stringify({ name: formData.name, email: formData.email }))
      router.push("/marketplace")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e3621] via-[#000000] to-[#2e3621] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#b1c98d] rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#b1c98d] rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-[#8ba970] rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-[#b1c98d] hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl border border-[#b1c98d]/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#2e3621] to-[#000000] rounded-2xl mb-4 shadow-lg">
              <ShoppingBag className="w-10 h-10 text-[#b1c98d]" />
            </div>
            <h2 className="text-3xl font-black text-[#000000] mb-2">Join B2Zi</h2>
            <p className="text-gray-600">Start your shopping journey today</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-[#2e3621] mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b1c98d] focus:border-[#2e3621] transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2e3621] mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b1c98d] focus:border-[#2e3621] transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2e3621] mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b1c98d] focus:border-[#2e3621] transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="+263 77 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2e3621] mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b1c98d] focus:border-[#2e3621] transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#2e3621] to-[#000000] hover:from-[#000000] hover:to-[#2e3621] text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-[#2e3621] text-[#2e3621] font-bold rounded-xl hover:bg-[#2e3621] hover:text-white transition-all"
            >
              Sign In Instead
            </Link>
          </div>
        </div>

        <p className="text-center text-[#b1c98d] text-sm mt-6">Join thousands of happy shoppers on B2Zi</p>
      </div>
    </div>
  )
}
