"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Mail, Phone, MapPin, ShoppingBag, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Customer {
  id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
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

        // Filter orders that contain merchant's products
        const merchantOrders = allOrders.filter((o: any) =>
          merchantProducts.some((p: any) => o.items?.some((item: any) => item.productId === p.id))
        )

        // Group orders by customer
        const customerMap = new Map<string, any>()

        merchantOrders.forEach((order: any) => {
          const customerId = order.customerId
          const customer = order.customer || {}

          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              id: customerId,
              email: customer.email || "unknown@example.com",
              name: customer.name || "Unknown Customer",
              totalSpent: 0,
              totalOrders: 0,
              lastOrder: new Date().toISOString(),
            })
          }

          const customerData = customerMap.get(customerId)
          customerData.totalSpent += order.total || 0
          customerData.totalOrders += 1
          customerData.lastOrder = new Date(order.createdAt).toISOString()
        })

        const customersArray = Array.from(customerMap.values()).sort(
          (a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
        )

        setCustomers(customersArray)
        setFilteredCustomers(customersArray)
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customer relationships and insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{customers.length}</div>
            <p className="text-xs text-success mt-1">From your orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </div>
            <p className="text-xs text-success mt-1">From all customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              $
              {customers.length > 0
                ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per customer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Repeat Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {customers.filter((c) => c.totalOrders > 1).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Placed multiple orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>View and manage all your customers</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{customer.name}</div>
                              <div className="text-sm text-muted-foreground md:hidden">{customer.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-2 text-muted-foreground" />
                              {customer.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <ShoppingBag className="w-4 h-4 mr-1 text-muted-foreground" />
                              {customer.totalOrders}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end font-medium">
                              <DollarSign className="w-4 h-4 text-success" />
                              {customer.totalSpent.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="text-sm text-muted-foreground">
                              {new Date(customer.lastOrder).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {customers.length === 0 ? "No customers yet" : "No customers found matching your search"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
