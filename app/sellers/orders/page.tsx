'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  selectedColor?: string
  selectedType?: string
  price: number
}

interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerWhatsApp?: string
  deliveryAddress: string
  deliveryCity: string
  deliveryState: string
  deliveryZipCode: string
  createdAt: string
  status: string
  total: number
  items: OrderItem[]
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function SellerOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [merchant, setMerchant] = useState<any>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const merchantData = localStorage.getItem('b2zi_merchant')
        if (!merchantData) {
          router.push('/admin')
          return
        }

        const merchant = JSON.parse(merchantData)
        setMerchant(merchant)

        // Fetch merchant orders
        const response = await fetch(`/api/merchants/${merchant.id}/orders`)
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        } else if (response.status === 401) {
          router.push('/admin')
        }
      } catch (err) {
        console.error('Failed to load orders:', err)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
      }
    } catch (err) {
      console.error('Status update failed:', err)
      setError('Failed to update order status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <Link href="/sellers/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Orders Table */}
        <Card>
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg">
                  <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                  >
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Customer: {order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                      <Select
                        value={order.status}
                        onValueChange={(value) => {
                          handleStatusChange(order.id, value)
                        }}
                      >
                        <SelectTrigger className="w-32 text-sm mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <div className="p-4 bg-gray-50 border-t space-y-4">
                      {/* Customer Information Section */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span>📦 Delivery Information</span>
                        </h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2 text-sm">
                          <div>
                            <p className="text-gray-600">Recipient Name</p>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Delivery Address</p>
                            <p className="font-medium text-gray-900">
                              {order.deliveryAddress}
                            </p>
                            <p className="text-gray-600 text-xs mt-1">
                              {order.deliveryCity}, {order.deliveryState} {order.deliveryZipCode}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information Section */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span>📞 Contact Information</span>
                        </h4>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-600">Phone</p>
                              <p className="font-medium text-gray-900">{order.customerPhone}</p>
                            </div>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                            >
                              Call
                            </a>
                          </div>
                          {order.customerWhatsApp && (
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div>
                                <p className="text-gray-600">WhatsApp</p>
                                <p className="font-medium text-gray-900">{order.customerWhatsApp}</p>
                              </div>
                              <a
                                href={`https://wa.me/${order.customerWhatsApp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                              >
                                Chat
                              </a>
                            </div>
                          )}
                          <div className="pt-2 border-t">
                            <p className="text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{order.customerEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items Section */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">📦 Order Items:</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="text-sm text-gray-600 flex justify-between bg-white p-3 rounded border border-gray-200"
                            >
                              <span>
                                Product {item.productId} × {item.quantity}
                                {item.selectedColor && ` (Color: ${item.selectedColor})`}
                                {item.selectedType && ` (Type: ${item.selectedType})`}
                              </span>
                              <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
