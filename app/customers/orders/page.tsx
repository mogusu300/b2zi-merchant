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

interface OrderItem {
  id: string
  productId: string
  quantity: number
  selectedColor?: string
  selectedType?: string
  price: number
  product?: {
    id: string
    name: string
    sellerName?: string
    sellerId: string
  }
}

interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  deliveryCity: string
  deliveryState: string
  deliveryZipCode: string
  createdAt: string
  status: string
  estimatedDelivery?: string
  trackingNumber?: string
  total: number
  items: OrderItem[]
}

export default function CustomerOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const customerData = localStorage.getItem('b2zi_user')
        if (!customerData) {
          router.push('/customers/login')
          return
        }

        const customer = JSON.parse(customerData)
        console.log('Fetching orders for customer:', customer.id, customer)

        const response = await fetch(`/api/customers/${customer.id}/orders`)
        console.log('Orders response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Orders fetched:', data)
          setOrders(data)
          setError('')
        } else if (response.status === 401) {
          router.push('/customers/login')
        } else {
          const errorData = await response.text()
          console.error('Error response:', errorData)
          setError('Failed to load orders')
        }
      } catch (err) {
        console.error('Failed to load orders:', err)
        setError('Failed to load your orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <Link href="/marketplace">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold">Error loading orders</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        )}

        {/* Orders */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600 mb-2">No orders found.</p>
              <p className="text-sm text-gray-500 mb-4">
                Check browser console for debugging info
              </p>
              <Link href="/marketplace">
                <Button>Start Shopping</Button>
              </Link>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div
                  className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                  onClick={() =>
                    setExpandedOrder(expandedOrder === order.id ? null : order.id)
                  }
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        order.status === 'delivered'
                          ? 'text-green-600'
                          : order.status === 'shipped'
                            ? 'text-blue-600'
                            : order.status === 'cancelled'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  <div className="ml-4">
                    <svg
                      className={`w-5 h-5 text-gray-400 transition transform ${
                        expandedOrder === order.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="px-6 pb-6 bg-gray-50 border-t space-y-6">
                    {/* Order Status & Tracking */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg">📍 Order Status</h3>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-600">Status</span>
                          <span
                            className={`font-semibold px-3 py-1 rounded-full text-sm ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.status === 'processing'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : order.status === 'cancelled'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Tracking Number</span>
                            <span className="font-medium text-gray-900">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.estimatedDelivery && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Est. Delivery</span>
                            <span className="font-medium text-gray-900">
                              {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg">📦 Delivery Address</h3>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm">
                        <p className="font-medium text-gray-900 mb-1">{order.customerName}</p>
                        <p className="text-gray-600">{order.deliveryAddress}</p>
                        <p className="text-gray-600">
                          {order.deliveryCity}, {order.deliveryState} {order.deliveryZipCode}
                        </p>
                      </div>
                    </div>

                    {/* Order Items - Grouped by Seller */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg">📦 Order Items</h3>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.product?.name || `Product ${item.productId}`}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Qty: {item.quantity}
                                  {item.selectedColor && ` • Color: ${item.selectedColor}`}
                                  {item.selectedType && ` • Type: ${item.selectedType}`}
                                </p>
                                {item.product?.sellerName && (
                                  <p className="text-xs text-gray-500 mt-2">Sold by: {item.product.sellerName}</p>
                                )}
                              </div>
                              <p className="font-semibold text-gray-900 ml-4">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
