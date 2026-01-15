"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Download, Calendar } from "lucide-react"

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    conversionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const merchantData = localStorage.getItem("b2zi_merchant")
        if (!merchantData) return

        const merchant = JSON.parse(merchantData)

        // Fetch products and orders
        const [productsRes, ordersRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/orders"),
        ])

        const allProducts = await productsRes.json()
        const allOrders = await ordersRes.json()

        const merchantProducts = allProducts.filter((p: any) => p.sellerId === merchant.id)
        const merchantOrders = allOrders.filter((o: any) =>
          merchantProducts.some((p: any) => o.items?.some((item: any) => item.productId === p.id))
        )

        // Calculate stats
        const totalRevenue = merchantOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
        const avgOrderValue = merchantOrders.length > 0 ? totalRevenue / merchantOrders.length : 0

        setStats({
          totalRevenue,
          totalOrders: merchantOrders.length,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          conversionRate: 3.24, // Placeholder
        })

        // Build revenue by category data
        const categoryMap = new Map<string, number>()
        merchantProducts.forEach((p: any) => {
          const category = p.category || "Uncategorized"
          const currentCount = categoryMap.get(category) || 0
          categoryMap.set(category, currentCount + 1)
        })

        const colors = ["#4B8BBE", "#7C4DFF", "#FF6B6B", "#4ECDC4", "#95A5A6"]
        const categoryArray = Array.from(categoryMap.entries())
          .map(([name, value], idx) => ({
            name,
            value,
            color: colors[idx % colors.length],
          }))
          .sort((a, b) => b.value - a.value)

        setCategoryData(categoryArray)

        // Get top products by order count
        const productSalesMap = new Map<string, { name: string; sales: number; revenue: number }>()
        merchantOrders.forEach((order: any) => {
          order.items?.forEach((item: any) => {
            const product = merchantProducts.find((p: any) => p.id === item.productId)
            if (product) {
              const existing = productSalesMap.get(product.id) || {
                name: product.name,
                sales: 0,
                revenue: 0,
              }
              existing.sales += 1
              existing.revenue += product.price * item.quantity
              productSalesMap.set(product.id, existing)
            }
          })
        })

        const topProdsArray = Array.from(productSalesMap.values())
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5)

        setTopProducts(topProdsArray)

        // Build revenue data (simplified - last 7 days)
        const last7Days = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

          const dayOrders = merchantOrders.filter((o: any) => {
            const orderDate = new Date(o.createdAt)
            return orderDate.toLocaleDateString() === date.toLocaleDateString()
          })

          const revenue = dayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
          last7Days.push({
            date: dateStr,
            revenue: Math.round(revenue * 100) / 100,
            orders: dayOrders.length,
          })
        }

        setRevenueData(last7Days)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your store performance and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select defaultValue="7days">
            <SelectTrigger className="w-full sm:w-[160px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${stats.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-sm text-success mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>From all orders</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>Total orders received</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${stats.avgOrderValue.toFixed(2)}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>Average per order</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{categoryData.reduce((sum, c) => sum + c.value, 0)}</div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>In your catalog</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Orders Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Orders Overview</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 4 }}
                    name="Revenue ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ fill: "var(--accent)", r: 4 }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of products</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="var(--primary)"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No products added yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performers</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-background flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No sales data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Your product breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="space-y-3">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm font-bold">{category.value} products</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No products added yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key observations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.totalRevenue > 0 ? (
              <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-medium text-success">Revenue Generated</h4>
                    <p className="text-sm text-success/80 mt-1">
                      You've generated ${stats.totalRevenue.toFixed(2)} in total revenue.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ShoppingCart className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary">Get Started</h4>
                    <p className="text-sm text-primary/80 mt-1">
                      Add products and wait for orders to see analytics here.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-4 bg-pending/10 border border-pending/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-pending mt-0.5" />
                <div>
                  <h4 className="font-medium text-pending">Product Categories</h4>
                  <p className="text-sm text-pending/80 mt-1">
                    You have {categoryData.reduce((sum, c) => sum + c.value, 0)} products across{" "}
                    {categoryData.length} categories.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-accent mt-0.5" />
                <div>
                  <h4 className="font-medium text-accent">Orders</h4>
                  <p className="text-sm text-accent/80 mt-1">
                    You have received {stats.totalOrders} orders. Keep them coming!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
