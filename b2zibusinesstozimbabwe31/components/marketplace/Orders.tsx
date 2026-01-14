"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import type { Order } from "../../types"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"

export const Orders: React.FC = () => {
  // Mock orders for demonstration
  const [orders] = useState<Order[]>([
    {
      id: "ORD-2024-001",
      items: [],
      total: 234.98,
      status: "shipped",
      date: "2024-01-15",
      trackingNumber: "TRK-ZW-789456123",
      estimatedDelivery: "2024-01-20",
    },
    {
      id: "ORD-2024-002",
      items: [],
      total: 89.99,
      status: "processing",
      date: "2024-01-16",
      estimatedDelivery: "2024-01-22",
    },
    {
      id: "ORD-2024-003",
      items: [],
      total: 145.5,
      status: "delivered",
      date: "2024-01-10",
      trackingNumber: "TRK-ZW-123789456",
    },
  ])

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />
      case "processing":
        return <Package className="w-5 h-5" />
      case "shipped":
        return <Truck className="w-5 h-5" />
      case "delivered":
        return <CheckCircle className="w-5 h-5" />
      case "cancelled":
        return <XCircle className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-700"
      case "processing":
        return "bg-blue-100 text-blue-700"
      case "shipped":
        return "bg-b2zi-light/20 text-b2zi-dark"
      case "delivered":
        return "bg-green-100 text-green-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
    }
  }

  return (
    <div className="min-h-screen bg-b2zi-gray">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-b2zi-dark hover:text-b2zi-black font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </Link>
          <h1 className="text-3xl font-black text-b2zi-black">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-b2zi-black">{order.id}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Placed on{" "}
                    {new Date(order.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-black text-b2zi-dark">${order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="bg-b2zi-light/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                      <p className="font-mono font-bold text-b2zi-dark">{order.trackingNumber}</p>
                    </div>
                    {order.estimatedDelivery && order.status !== "delivered" && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                        <p className="font-bold text-b2zi-black">
                          {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {order.status !== "cancelled" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`flex flex-col items-center ${order.status !== "pending" ? "text-b2zi-dark" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status !== "pending" ? "bg-b2zi-dark text-white" : "bg-gray-200"}`}
                      >
                        <Package className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-1 font-medium">Processing</p>
                    </div>
                    <div
                      className={`flex-1 h-1 mx-2 ${["shipped", "delivered"].includes(order.status) ? "bg-b2zi-dark" : "bg-gray-200"}`}
                    />
                    <div
                      className={`flex flex-col items-center ${["shipped", "delivered"].includes(order.status) ? "text-b2zi-dark" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${["shipped", "delivered"].includes(order.status) ? "bg-b2zi-dark text-white" : "bg-gray-200"}`}
                      >
                        <Truck className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-1 font-medium">Shipped</p>
                    </div>
                    <div
                      className={`flex-1 h-1 mx-2 ${order.status === "delivered" ? "bg-b2zi-dark" : "bg-gray-200"}`}
                    />
                    <div
                      className={`flex flex-col items-center ${order.status === "delivered" ? "text-b2zi-dark" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === "delivered" ? "bg-b2zi-dark text-white" : "bg-gray-200"}`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <p className="text-xs mt-1 font-medium">Delivered</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button className="flex-1 py-2 px-4 bg-b2zi-dark hover:bg-black text-white font-bold rounded-lg transition-colors">
                  View Details
                </button>
                {order.status === "shipped" && (
                  <button className="flex-1 py-2 px-4 border-2 border-b2zi-light hover:bg-b2zi-light/10 text-b2zi-dark font-bold rounded-lg transition-colors">
                    Track Package
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No orders yet</p>
            <p className="text-gray-400 text-sm mt-2 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/marketplace"
              className="inline-block px-6 py-3 bg-b2zi-dark text-white font-bold rounded-lg hover:bg-black transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
