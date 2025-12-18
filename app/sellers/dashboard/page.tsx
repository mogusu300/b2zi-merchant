'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ShoppingCart, Package, TrendingUp, Users } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalViews: number
}

interface SalesData {
  month: string
  revenue: number
  orders: number
}

export default function SellerDashboard() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalViews: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const salesData: SalesData[] = [
    { month: 'Jan', revenue: 4000, orders: 24 },
    { month: 'Feb', revenue: 3000, orders: 13 },
    { month: 'Mar', revenue: 2000, orders: 9 },
    { month: 'Apr', revenue: 2780, orders: 39 },
    { month: 'May', revenue: 1890, orders: 22 },
    { month: 'Jun', revenue: 2390, orders: 22 },
  ]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if merchant is logged in
        const merchantData = localStorage.getItem('b2zi_merchant')
        if (!merchantData) {
          router.push('/admin')
          return
        }

        const merchant = JSON.parse(merchantData)
        setMerchant(merchant)

        // Fetch merchant stats
        const response = await fetch(`/api/merchants/${merchant.id}/stats`)
        if (response.ok) {
          const statsData = await response.json()
          setStats(statsData)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        setError('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('b2zi_merchant')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/admin')}>Go to Login</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {merchant?.name || 'Seller'}!</p>
            </div>
            <div className="flex gap-4">
              <Link href="/sellers/products">
                <Button variant="outline">Manage Products</Button>
              </Link>
              <Button onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
              </div>
              <Package className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <Users className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: '#16a34a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Orders Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Orders Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/sellers/products">
              <Button className="w-full" variant="outline">
                View All Products
              </Button>
            </Link>
            <Link href="/sellers/products/new">
              <Button className="w-full">Add New Product</Button>
            </Link>
            <Link href="/sellers/orders">
              <Button className="w-full" variant="outline">
                View Recent Orders
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
