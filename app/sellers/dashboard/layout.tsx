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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-3xl font-serif font-black text-foreground tracking-tighter group-hover:opacity-80 transition-opacity">
                B<span className="text-primary">2</span>Z<span className="text-accent">i</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Store Info */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent rounded-lg">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {merchant?.businessName || merchant?.ownerName || 'Store'}
                </p>
                <p className="text-xs text-muted-foreground truncate">Active Seller</p>
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
                        ? 'bg-primary text-background'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
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
          <div className="p-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive bg-transparent"
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
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">
                {merchant?.ownerName || 'Merchant'}
              </p>
              <p className="text-xs text-muted-foreground">{merchant?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
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
