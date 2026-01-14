'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Eye,
} from 'lucide-react'

interface Order {
  id: string
  customer: { name: string }
  total: number
  status: string
  createdAt: string
}

export default function SellerDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, views: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const merchantData = localStorage.getItem('b2zi_merchant')
        if (!merchantData) return

        const merchant = JSON.parse(merchantData)
        console.log('[DASHBOARD] Merchant ID:', merchant.id)

        // Fetch products for this merchant
        const productsRes = await fetch('/api/products')
        if (!productsRes.ok) {
          throw new Error('Failed to fetch products')
        }
        const products = await productsRes.json()
        console.log('[DASHBOARD] All products:', products)

        const merchantProducts = products.filter((p: any) => p.sellerId === merchant.id)
        console.log('[DASHBOARD] Merchant products:', merchantProducts)

        // For now, just use product stats (orders can be added later with merchant order history)
        const totalRevenue = merchantProducts.reduce((sum: number, product: any) => sum + (product.price || 0), 0)
        const totalOrders = 0 // Will be updated when order history is available
        const totalProducts = merchantProducts.length

        setStats({
          revenue: totalRevenue,
          orders: totalOrders,
          products: totalProducts,
          views: totalProducts * 5, // Estimate views
        })

        // Mock recent orders for now
        setRecentOrders([])
      } catch (error) {
        console.error('[DASHBOARD] Error fetching dashboard data:', error)
        // Set default stats if fetch fails
        setStats({ revenue: 0, orders: 0, products: 0, views: 0 })
        setRecentOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <Card className="border-l-4 border-l-[#2e3621]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-black">${stats.revenue.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">+2.5% from last month</p>
              </div>
              <DollarSign className="w-10 h-10 text-[#b1c98d] opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card className="border-l-4 border-l-[#b1c98d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-black">{stats.orders}</div>
                <p className="text-xs text-gray-500 mt-1">+15% from last month</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-[#2e3621] opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Active Products Card */}
        <Card className="border-l-4 border-l-[#2e3621]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-black">{stats.products}</div>
                <p className="text-xs text-gray-500 mt-1">3 pending review</p>
              </div>
              <Package className="w-10 h-10 text-[#b1c98d] opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Store Views Card */}
        <Card className="border-l-4 border-l-[#b1c98d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Store Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-black">{stats.views}</div>
                <p className="text-xs text-gray-500 mt-1">+8% from last week</p>
              </div>
              <Eye className="w-10 h-10 text-[#2e3621] opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">3.2%</div>
            <p className="text-xs text-gray-500 mt-2">Based on store views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">89</div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              ${recentOrders.length > 0 ? (stats.revenue / recentOrders.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-gray-500 mt-2">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-black">#{order.id.slice(0, 8)}</div>
                    <div className="text-sm text-gray-600">{order.customer?.name || 'Customer'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-black">${order.total.toFixed(2)}</div>
                    <div className={`text-xs font-medium mt-1 ${
                      order.status === 'completed' ? 'text-green-600' :
                      order.status === 'shipped' ? 'text-blue-600' :
                      order.status === 'processing' ? 'text-yellow-600' :
                      'text-orange-600'
                    }`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No orders yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
