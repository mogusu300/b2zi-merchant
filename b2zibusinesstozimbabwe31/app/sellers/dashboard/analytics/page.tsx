"use client"

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

// Mock data for charts
const revenueData = [
  { month: "Jul", revenue: 4200, orders: 45 },
  { month: "Aug", revenue: 5100, orders: 52 },
  { month: "Sep", revenue: 4800, orders: 48 },
  { month: "Oct", revenue: 6200, orders: 61 },
  { month: "Nov", revenue: 7500, orders: 72 },
  { month: "Dec", revenue: 8900, orders: 85 },
  { month: "Jan", revenue: 9200, orders: 89 },
]

const categoryData = [
  { name: "Electronics", value: 35, color: "#4B8BBE" },
  { name: "Fashion", value: 28, color: "#7C4DFF" },
  { name: "Home & Garden", value: 18, color: "#FF6B6B" },
  { name: "Sports", value: 12, color: "#4ECDC4" },
  { name: "Other", value: 7, color: "#95A5A6" },
]

const topProducts = [
  { name: "Wireless Earbuds", sales: 234, revenue: 11700 },
  { name: "Smart Watch", sales: 189, revenue: 28350 },
  { name: "Laptop Stand", sales: 156, revenue: 4680 },
  { name: "USB-C Cable", sales: 145, revenue: 2175 },
  { name: "Phone Case", sales: 132, revenue: 2640 },
]

const trafficSources = [
  { source: "Direct", visitors: 3240, conversion: 4.2 },
  { source: "Social Media", visitors: 2890, conversion: 3.8 },
  { source: "Search", visitors: 2150, conversion: 5.1 },
  { source: "Email", visitors: 1620, conversion: 6.4 },
  { source: "Referral", visitors: 980, conversion: 3.2 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-b2zi-black">Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Track your store performance and insights</p>
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
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-b2zi-black">$45,231</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+20.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-b2zi-black">1,234</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+15.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
              <Package className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-b2zi-black">$36.65</div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+4.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-b2zi-black">3.24%</div>
            <div className="flex items-center text-sm text-red-600 mt-1">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span>-0.5% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Orders Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Orders Overview</CardTitle>
            <CardDescription>Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4B8BBE"
                  strokeWidth={2}
                  dot={{ fill: "#4B8BBE", r: 4 }}
                  name="Revenue ($)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#7C4DFF"
                  strokeWidth={2}
                  dot={{ fill: "#7C4DFF", r: 4 }}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-b2zi-light flex items-center justify-center text-b2zi-dark font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-b2zi-black">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-b2zi-black">${product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your customers come from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trafficSources} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#888888" fontSize={12} />
                <YAxis dataKey="source" type="category" stroke="#888888" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="visitors" fill="#4B8BBE" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key observations and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Revenue Growth</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your revenue has increased by 20% this month. Keep up the great work!
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Customer Retention</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    34% of customers are repeat buyers. Consider loyalty programs to boost this.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Inventory Alert</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    5 products are low in stock. Restock soon to avoid missing sales.
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
