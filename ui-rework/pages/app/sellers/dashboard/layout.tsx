'use client'

import type React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  DollarSign,
  BarChart3,
  Users,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/sellers/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/sellers/dashboard/products', icon: Package },
  { name: 'Orders', href: '/sellers/dashboard/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/sellers/dashboard/customers', icon: Users },
  { name: 'Analytics', href: '/sellers/dashboard/analytics', icon: BarChart3 },
  { name: 'Store Settings', href: '/sellers/dashboard/settings', icon: Settings },
]

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Prevent infinite redirect loops
    if (hasRedirected) {
      console.log('[DASHBOARD LAYOUT] Already redirected, skipping check')
      return
    }

    // Check if merchant is logged in
    const checkMerchantAuth = () => {
      const merchantData = localStorage.getItem('b2zi_merchant')
      if (!merchantData) {
        console.log('[DASHBOARD LAYOUT] ⚠️ No merchant data in localStorage, redirecting to login')
        setHasRedirected(true)
        setLoading(false)
        router.replace('/sellers/login')  // Use replace instead of push
        return
      }

      try {
        const parsed = JSON.parse(merchantData)
        console.log('[DASHBOARD LAYOUT] ✅ Merchant loaded:', parsed.email)
        setMerchant(parsed)
        setLoading(false)
      } catch (err) {
        console.error('[DASHBOARD LAYOUT] ❌ Error parsing merchant data:', err)
        setHasRedirected(true)
        setLoading(false)
        router.replace('/sellers/login')  // Use replace instead of push
      }
    }

    // Check immediately without delay
    checkMerchantAuth()
  }, [hasRedirected, router])

  const handleLogout = () => {
    localStorage.removeItem('b2zi_merchant')
    router.push('/sellers/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-3xl font-serif font-black text-black tracking-tighter group-hover:opacity-80 transition-opacity">
                B<span className="text-[#2e3621]">2</span>Z<span className="text-[#b1c98d]">i</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Store Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#b1c98d] rounded-lg">
                <Store className="w-5 h-5 text-[#2e3621]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black truncate">
                  {merchant?.businessName || merchant?.ownerName || 'Store'}
                </p>
                <p className="text-xs text-gray-500 truncate">Active Seller</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#2e3621] text-white'
                        : 'text-gray-700 hover:bg-[#b1c98d]/20 hover:text-[#2e3621]'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-transparent"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-black">
                {merchant?.ownerName || 'Merchant'}
              </p>
              <p className="text-xs text-gray-500">{merchant?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#b1c98d] flex items-center justify-center text-[#2e3621] font-bold">
              {merchant?.ownerName?.charAt(0) || 'M'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
