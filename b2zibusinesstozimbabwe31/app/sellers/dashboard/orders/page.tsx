"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle, Clock } from "lucide-react"

export default function OrdersPage() {
  const orders = [
    { id: 1001, customer: "John Doe", items: 3, total: "$125.00", status: "Pending", date: "2024-01-15" },
    { id: 1002, customer: "Jane Smith", items: 1, total: "$45.00", status: "Processing", date: "2024-01-15" },
    { id: 1003, customer: "Mike Johnson", items: 2, total: "$85.00", status: "Shipped", date: "2024-01-14" },
    { id: 1004, customer: "Sarah Williams", items: 4, total: "$210.00", status: "Delivered", date: "2024-01-13" },
    { id: 1005, customer: "Tom Brown", items: 1, total: "$25.00", status: "Pending", date: "2024-01-15" },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />
      case "Processing":
        return <Package className="w-4 h-4" />
      case "Shipped":
        return <Truck className="w-4 h-4" />
      case "Delivered":
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      case "Shipped":
        return "bg-purple-100 text-purple-800"
      case "Delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-b2zi-black">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and fulfill customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shipped</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <Truck className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold">234</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr className="text-left">
                  <th className="pb-3 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Items</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Total</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 text-sm font-medium">#{order.id}</td>
                    <td className="py-4 text-sm">{order.customer}</td>
                    <td className="py-4 text-sm">{order.items}</td>
                    <td className="py-4 text-sm font-bold text-b2zi-dark">{order.total}</td>
                    <td className="py-4 text-sm text-gray-600">{order.date}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
