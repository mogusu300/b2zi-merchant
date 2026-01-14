'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  EyeOff,
  Download,
  MoreHorizontal,
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdminBackground from '@/app/admin-background'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Merchant {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  businessType?: string | null
  businessAddress?: string | null
  idType: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  idFrontUrl?: string | null
  idBackUrl?: string | null
}

const statusConfig = {
  pending: {
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    label: 'Pending Review',
    borderColor: '#eab308'
  },
  approved: {
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    label: 'Approved',
    borderColor: '#22c55e'
  },
  rejected: {
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-800',
    icon: XCircle,
    label: 'Rejected',
    borderColor: '#ef4444'
  }
}

function DetailModal({ 
  merchant, 
  open, 
  onOpenChange, 
  onStatusUpdate 
}: { 
  merchant: Merchant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (merchantId: string, status: 'approved' | 'rejected') => Promise<void>
}) {
  const [showDocuments, setShowDocuments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageErrors, setImageErrors] = useState<{ front: boolean; back: boolean }>({ front: false, back: false })
  const [imagesLoading, setImagesLoading] = useState<{ front: boolean; back: boolean }>({ front: false, back: false })

  if (!merchant) return null

  const config = statusConfig[merchant.status]

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    setIsLoading(true)
    try {
      await onStatusUpdate(merchant.id, newStatus)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageError = (type: 'front' | 'back') => {
    console.error(`Failed to load ${type} ID image:`, type === 'front' ? merchant.idFrontUrl : merchant.idBackUrl)
    setImageErrors(prev => ({ ...prev, [type]: true }))
  }

  const handleImageLoad = (type: 'front' | 'back') => {
    setImagesLoading(prev => ({ ...prev, [type]: false }))
  }

  const DocumentImage = ({ url, label, type }: { url: string; label: string; type: 'front' | 'back' }) => {
    const hasError = imageErrors[type]
    const isLoading = imagesLoading[type]

    return (
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-md">
        {hasError ? (
          <div className="w-full h-80 bg-gray-100 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <p className="text-sm font-semibold text-red-600">Image Failed to Load</p>
              <p className="text-xs text-gray-600 mt-1">URL: {url}</p>
              <button
                onClick={() => {
                  setImageErrors(prev => ({ ...prev, [type]: false }))
                  setImagesLoading(prev => ({ ...prev, [type]: true }))
                }}
                className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="w-full h-80 bg-gray-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            )}
            <img
              src={url}
              alt={label}
              onLoad={() => handleImageLoad(type)}
              onError={() => handleImageError(type)}
              className={`w-full h-auto object-contain ${isLoading ? 'hidden' : 'block'}`}
              style={{ maxHeight: '500px' }}
            />
          </>
        )}
        <p className="text-sm text-center font-semibold text-gray-700 p-3 bg-gray-50 border-t">{label}</p>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <DialogTitle className="text-2xl">{merchant.businessName}</DialogTitle>
              <DialogDescription className="mt-2">
                {merchant.businessType} • {merchant.businessAddress}
              </DialogDescription>
            </div>
            <Badge className={config.badge}>
              {config.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 pr-4">
          {/* Owner Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Owner Name</p>
              <p className="text-lg font-semibold">{merchant.ownerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Email Address</p>
              <p className="text-lg font-semibold break-all">{merchant.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Phone Number</p>
              <p className="text-lg font-semibold">{merchant.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">ID Type</p>
              <p className="text-lg font-semibold uppercase">{merchant.idType}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Registered Date</p>
              <p className="text-lg font-semibold">{new Date(merchant.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Last Updated</p>
              <p className="text-lg font-semibold">{new Date(merchant.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Documents */}
          {(merchant.idFrontUrl || merchant.idBackUrl) && (
            <div className="space-y-3 pt-4 border-t">
              <button
                onClick={() => setShowDocuments(!showDocuments)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showDocuments ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showDocuments ? 'Hide' : 'Show'} ID Documents (NRC/Passport)
              </button>

              {showDocuments && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {merchant.idFrontUrl && (
                    <DocumentImage 
                      url={merchant.idFrontUrl}
                      label="ID Front / NRC / Passport Front"
                      type="front"
                    />
                  )}
                  {merchant.idBackUrl && (
                    <DocumentImage 
                      url={merchant.idBackUrl}
                      label="ID Back / NRC / Passport Back"
                      type="back"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            {merchant.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  disabled={isLoading}
                  onClick={() => handleStatusChange('rejected')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                  onClick={() => handleStatusChange('approved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Sidebar Component
function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <aside className="w-64 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
        {/* Header with Logo */}
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">MerchantHub</h2>
              </div>
              <p className="text-xs text-slate-400">Admin Dashboard</p>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink icon={Home} label="Dashboard" active href="/admin" />
          <NavLink icon={Users} label="Merchants" active={false} href="/admin" />
          <NavLink icon={BarChart3} label="Analytics" active={false} href="#" />
          
          {/* Divider */}
          <div className="my-4 border-t border-slate-700/30" />
          
          <NavLink icon={Settings} label="Settings" active={false} href="#" />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 space-y-3 bg-gradient-to-t from-slate-900 to-transparent">
          <div className="px-4 py-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs font-semibold text-blue-300 mb-1">Live Status</p>
            <p className="text-xs text-slate-400">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              System online
            </p>
          </div>
          
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300 hover:text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          <p className="text-xs text-slate-500 px-4 text-center pt-2 border-t border-slate-700/30">
            v1.0.0 • Dec 2025
          </p>
        </div>
      </aside>
    )
}

function NavLink({ 
  icon: Icon, 
  label, 
  active,
  href 
}: { 
  icon: React.ElementType
  label: string
  active: boolean
  href: string
}) {
  return (
    <Link href={href} className={`
      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm
      ${active 
        ? 'bg-blue-600 text-white' 
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }
    `}>
      <Icon className="h-4 w-4" />
      {label}
      {active && <ChevronRight className="h-4 w-4 ml-auto" />}
    </Link>
  )
}

export default function AdminPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch merchants from database
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/merchants')
        if (!response.ok) {
          throw new Error('Failed to fetch merchants')
        }
        const data = await response.json()
        setMerchants(data)
      } catch (error) {
        console.error('Error fetching merchants:', error)
        setMerchants([])
      } finally {
        setLoading(false)
      }
    }

    fetchMerchants()
  }, [])

  const filteredMerchants = merchants.filter(m => {
    const matchesSearch = 
      m.businessName.toLowerCase().includes(search.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: merchants.length,
    pending: merchants.filter(m => m.status === 'pending').length,
    approved: merchants.filter(m => m.status === 'approved').length,
    rejected: merchants.filter(m => m.status === 'rejected').length,
  }

  const handleViewDetails = (merchant: Merchant) => {
    setSelectedMerchant(merchant)
    setDetailOpen(true)
    setSidebarOpen(false)
  }

  const handleStatusUpdate = async (merchantId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/merchant', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update merchant status')
      }

      // Update local state
      setMerchants(merchants.map(m => 
        m.id === merchantId ? { ...m, status: newStatus } : m
      ))

      // Update selected merchant
      if (selectedMerchant?.id === merchantId) {
        setSelectedMerchant({ ...selectedMerchant, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating merchant status:', error)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white flex flex-col md:flex-row">
      {/* Background SVG */}
      <div className="fixed inset-0 -z-20">
        <AdminBackground />
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-white/85 to-white/90 -z-10" />

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen overflow-y-auto fixed left-0 top-0 border-r border-slate-700">
        <Sidebar isOpen={false} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      {sidebarOpen && <div className="fixed top-0 left-0 h-screen w-64 z-50 md:hidden overflow-y-auto"><Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} /></div>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
                <p className="text-xs text-gray-500 mt-1">Manage and approve merchant registrations</p>
              </div>
            </div>
            <Link 
              href="/" 
              className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              ← Back Home
            </Link>
          </div>
        </header>

        {/* Page Content with separate scroll */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Merchants', value: stats.total, color: 'from-blue-50 to-blue-100', textColor: 'text-blue-600', borderColor: 'border-blue-200', icon: '📊' },
                { label: 'Pending Review', value: stats.pending, color: 'from-yellow-50 to-yellow-100', textColor: 'text-yellow-600', borderColor: 'border-yellow-200', icon: '⏳' },
                { label: 'Approved', value: stats.approved, color: 'from-green-50 to-green-100', textColor: 'text-green-600', borderColor: 'border-green-200', icon: '✅' },
                { label: 'Rejected', value: stats.rejected, color: 'from-red-50 to-red-100', textColor: 'text-red-600', borderColor: 'border-red-200', icon: '❌' },
              ].map((stat) => (
                <Card 
                  key={stat.label} 
                  className={`p-6 bg-gradient-to-br ${stat.color} border-2 ${stat.borderColor} shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{stat.label}</p>
                      <p className={`text-4xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                    <span className="text-3xl opacity-50">{stat.icon}</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Info Banner with Illustration */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-8 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Merchant Management Hub</h2>
                  <p className="text-slate-200 mb-6">Efficiently manage merchant registrations, verify identities, and monitor marketplace activity from a single dashboard.</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
                      <span>Real-time merchant verification status</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
                      <span>Document review and management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
                      <span>Complete merchant profiles and analytics</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block relative h-[300px] rounded-xl overflow-hidden opacity-90">
                  <svg viewBox="0 0 400 300" className="w-full h-full">
                    <defs>
                      <linearGradient id="adminGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#B1C98D', stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }} />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#adminGradient)" />
                    {/* Dashboard monitor */}
                    <rect x="80" y="40" width="240" height="160" fill="#B1C98D" opacity="0.3" rx="8" />
                    <rect x="90" y="50" width="220" height="130" fill="#2E3621" opacity="0.2" rx="4" />
                    {/* Screen elements - cards */}
                    <rect x="100" y="65" width="50" height="40" fill="#B1C98D" opacity="0.4" rx="3" />
                    <rect x="160" y="65" width="50" height="40" fill="#B1C98D" opacity="0.4" rx="3" />
                    <rect x="220" y="65" width="50" height="40" fill="#B1C98D" opacity="0.4" rx="3" />
                    {/* Chart bars */}
                    <rect x="110" y="110" width="15" height="30" fill="#2E3621" opacity="0.4" />
                    <rect x="135" y="100" width="15" height="40" fill="#2E3621" opacity="0.4" />
                    <rect x="160" y="90" width="15" height="50" fill="#2E3621" opacity="0.4" />
                    <rect x="185" y="95" width="15" height="45" fill="#2E3621" opacity="0.4" />
                    {/* Stand */}
                    <rect x="170" y="200" width="60" height="15" fill="#2E3621" opacity="0.3" rx="2" />
                    <rect x="195" y="215" width="10" height="30" fill="#2E3621" opacity="0.3" />
                    {/* Person at desk */}
                    <circle cx="320" cy="160" r="15" fill="#B1C98D" opacity="0.4" />
                    <rect x="310" y="175" width="20" height="35" fill="#2E3621" opacity="0.3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search merchants by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 py-2 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter with Better Styling */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={`capitalize transition-all ${
                      statusFilter === status 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {status === 'all' ? 'All Merchants' : status === 'pending' ? '⏳ Pending' : status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Merchants List */}
            {loading ? (
              <Card className="p-12 text-center bg-white border-gray-200">
                <div className="space-y-3">
                  <div className="inline-block">
                    <div className="animate-spin">⏳</div>
                  </div>
                  <p className="text-gray-600 font-medium">Loading merchants...</p>
                </div>
              </Card>
            ) : filteredMerchants.length === 0 ? (
              <Card className="p-12 text-center bg-white border-gray-200">
                <p className="text-gray-600 mb-2 text-lg font-medium">
                  {merchants.length === 0 ? 'No merchants registered yet' : 'No merchants found'}
                </p>
                <p className="text-sm text-gray-500">
                  {merchants.length === 0 
                    ? 'Merchants will appear here when they register. Visit /register to test.' 
                    : 'Try adjusting your search or filters'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredMerchants.map((merchant) => {
                  const config = statusConfig[merchant.status]
                  const IconComponent = config.icon

                  return (
                    <Card 
                      key={merchant.id}
                      className={`p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 border-r border-t border-b ${config.bg}`}
                      style={{ borderLeftColor: config.borderColor }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Left Section */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="mt-1 flex-shrink-0 p-2 bg-white rounded-lg border-2" style={{ borderColor: config.borderColor }}>
                              <IconComponent className="h-5 w-5" style={{ color: config.borderColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h3 className="text-lg font-bold text-gray-900">{merchant.businessName}</h3>
                                <Badge className={config.badge}>
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {merchant.businessType || 'N/A'} • {merchant.businessAddress || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 bg-white bg-opacity-40 p-3 rounded-lg">
                            <div>
                              <p className="text-xs text-gray-600 uppercase font-bold tracking-wider">Owner</p>
                              <p className="font-semibold text-gray-900 mt-1">{merchant.ownerName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase font-bold tracking-wider">Email</p>
                              <p className="font-semibold text-gray-900 truncate mt-1">{merchant.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase font-bold tracking-wider">Phone</p>
                              <p className="font-semibold text-gray-900 mt-1">{merchant.phone}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 uppercase font-bold tracking-wider">Registered</p>
                              <p className="font-semibold text-gray-900 mt-1">{new Date(merchant.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 md:ml-auto">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleViewDetails(merchant)}
                            className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                          >
                            View Details
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="px-2 border-gray-300">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(merchant)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {merchant.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    className="text-green-600 focus:text-green-600"
                                    onClick={() => handleStatusUpdate(merchant.id, 'approved')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleStatusUpdate(merchant.id, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <DetailModal 
        merchant={selectedMerchant} 
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}
