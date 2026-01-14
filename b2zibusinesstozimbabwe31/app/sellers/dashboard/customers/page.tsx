"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Mail, Phone, MapPin, ShoppingBag, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock customer data
const customers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+263 71 234 5678",
    location: "Harare, Zimbabwe",
    totalOrders: 12,
    totalSpent: 450.0,
    lastOrder: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Michael Ncube",
    email: "m.ncube@email.com",
    phone: "+263 77 987 6543",
    location: "Bulawayo, Zimbabwe",
    totalOrders: 8,
    totalSpent: 320.0,
    lastOrder: "2024-01-10",
    status: "Active",
  },
  {
    id: 3,
    name: "Tendai Moyo",
    email: "tendai.m@email.com",
    phone: "+263 78 456 7890",
    location: "Mutare, Zimbabwe",
    totalOrders: 5,
    totalSpent: 180.0,
    lastOrder: "2023-12-28",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Grace Sibanda",
    email: "grace.sib@email.com",
    phone: "+263 71 654 3210",
    location: "Gweru, Zimbabwe",
    totalOrders: 15,
    totalSpent: 625.0,
    lastOrder: "2024-01-18",
    status: "VIP",
  },
  {
    id: 5,
    name: "Tapiwa Chikwanha",
    email: "t.chikwanha@email.com",
    phone: "+263 77 111 2222",
    location: "Harare, Zimbabwe",
    totalOrders: 3,
    totalSpent: 95.0,
    lastOrder: "2024-01-05",
    status: "Active",
  },
]

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || customer.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-b2zi-black">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your customer relationships and insights</p>
        </div>
        <Button className="bg-b2zi-dark hover:bg-b2zi-black">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-b2zi-black">1,247</div>
            <p className="text-xs text-green-600 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-b2zi-black">892</div>
            <p className="text-xs text-green-600 mt-1">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-b2zi-black">$42.50</div>
            <p className="text-xs text-green-600 mt-1">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Repeat Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-b2zi-black">34%</div>
            <p className="text-xs text-green-600 mt-1">+2% from last month</p>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-b2zi-black">{customer.name}</div>
                        <div className="text-sm text-gray-500 md:hidden">{customer.email}</div>
                        <div className="text-xs text-gray-400 lg:hidden mt-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {customer.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-2 text-gray-400" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {customer.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <ShoppingBag className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.totalOrders}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end font-medium">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        {customer.totalSpent.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "VIP" ? "default" : customer.status === "Active" ? "secondary" : "outline"
                        }
                        className={
                          customer.status === "VIP"
                            ? "bg-b2zi-dark"
                            : customer.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "text-gray-500"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">No customers found matching your criteria</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
