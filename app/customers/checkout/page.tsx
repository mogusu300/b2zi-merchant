'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CartItem {
  productId: string
  product?: {
    id: string
    name: string
    price: number
    images: string[]
  }
  quantity: number
  selectedColor?: string
  selectedType?: string
}

export default function Checkout() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '4242 4242 4242 4242',
    cardExpiry: '12/25',
    cardCVC: '123',
  })

  useEffect(() => {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('b2zi_cart') || '[]')
    setCartItems(cart)

    // Get customer email
    const customer = JSON.parse(localStorage.getItem('b2zi_user') || '{}')
    if (customer.email) {
      setFormData((prev) => ({ ...prev, email: customer.email, name: customer.name }))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const total = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0
    return sum + price * item.quantity
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const customer = JSON.parse(localStorage.getItem('b2zi_user') || '{}')
      if (!customer.id) {
        router.push('/customers/login')
        return
      }

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedType: item.selectedType,
            price: item.product?.price || 0,
          })),
          total,
          shippingAddress: {
            name: formData.name,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          status: 'pending',
        }),
      })

      if (response.ok) {
        const order = await response.json()
        setSuccess(true)

        // Clear cart
        localStorage.removeItem('b2zi_cart')

        // Redirect to order confirmation after 2 seconds
        setTimeout(() => {
          router.push(`/customers/orders?orderid=${order.id}`)
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to place order')
      }
    } catch (err) {
      console.error('Checkout failed:', err)
      setError('An error occurred while processing your order')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <div className="mb-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">Thank you for your order. Redirecting...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-900">{item.product?.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">$10.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${(total * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${(total + 10 + total * 0.08).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Test card: 4242 4242 4242 4242 (pre-filled)
                  </p>

                  <div className="mb-4">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="4242 4242 4242 4242"
                      className="mt-1"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Expiry Date</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCVC">CVC</Label>
                      <Input
                        id="cardCVC"
                        name="cardCVC"
                        value={formData.cardCVC}
                        onChange={handleChange}
                        placeholder="123"
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6">
                  <Link href="/marketplace" className="flex-1">
                    <Button variant="outline" className="w-full" disabled={loading}>
                      Continue Shopping
                    </Button>
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || cartItems.length === 0}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
