"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import { TrendingUp, CheckCircle2, Clock, MapPinned, ArrowUpRight, Store, AlertCircle, RefreshCw, CheckSquare, XSquare } from "lucide-react"
import { useMerchantTracker } from "../hooks/useMerchantTracker"
import { DashboardLoadingSkeleton } from "./LoadingSkeleton"

const data = [
  { name: "Mon", leads: 12, onboarded: 8 },
  { name: "Tue", leads: 19, onboarded: 12 },
  { name: "Wed", leads: 15, onboarded: 10 },
  { name: "Thu", leads: 22, onboarded: 15 },
  { name: "Fri", leads: 30, onboarded: 24 },
  { name: "Sat", leads: 10, onboarded: 5 },
]

interface DashboardProps {
  hunterId?: string | null
  merchants?: any[]
}

const Dashboard: React.FC<DashboardProps> = ({ hunterId = null, merchants: propMerchants = [] }) => {
  const { merchants: hookMerchants, summary: hookSummary, loading, error, updateMerchantStatus, refreshData, fetchActivityLogs } = useMerchantTracker(hunterId)
  
  // Use merchants from props if provided, otherwise use from hook
  const merchants = propMerchants.length > 0 ? propMerchants : hookMerchants
  
  // Calculate summary from merchants
  const summary = {
    total: merchants.length,
    approved: merchants.filter(m => m.status === 'approved' || m.status === 'Onboarded' || m.status === 'completed').length,
    pending: merchants.filter(m => m.status === 'pending' || m.status === 'Pending' || m.status === 'in_progress').length,
    rejected: merchants.filter(m => m.status === 'rejected' || m.status === 'Rejected').length,
    totalMerchants: merchants.length,
    onboarded: merchants.filter(m => m.status === 'approved' || m.status === 'Onboarded' || m.status === 'completed').length,
    inProgress: merchants.filter(m => m.status === 'pending' || m.status === 'Pending' || m.status === 'in_progress').length,
    notStarted: merchants.filter(m => m.status === 'not_started' || m.status === 'Not Started').length,
  }
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Debug: Log hunterId and merchants
  useEffect(() => {
    console.log('🎯 Dashboard rendered with:')
    console.log('  - hunterId:', hunterId)
    console.log('  - merchants count:', merchants.length)
    console.log('  - loading:', loading)
    console.log('  - error:', error)
  }, [hunterId, merchants.length, loading, error])

  // Ensure fresh data on mount and refresh
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 500)
    // Fetch fresh data on component mount
    refreshData()
    return () => clearTimeout(timer)
  }, [refreshData])

  const handleStatusUpdate = async (merchantId: string, newStatus: string) => {
    console.log('🔄 Updating merchant status:', { merchantId, newStatus, hunterId })
    const success = await updateMerchantStatus(merchantId, newStatus)
    console.log('✅ Update result:', success)
    if (success) {
      // Refresh data after status update
      refreshData()
    }
  }

  const handleApprove = async (merchantId: string) => {
    console.log('✅ Approving merchant:', merchantId)
    await updateMerchantStatus(merchantId, 'completed', 'approved')
  }

  const handleReject = async (merchantId: string) => {
    console.log('❌ Rejecting merchant:', merchantId)
    await updateMerchantStatus(merchantId, 'rejected', 'rejected')
  }

  if (isInitialLoading) {
    return <DashboardLoadingSkeleton />
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      completed: {
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle2 size={14} />,
        text: "Completed"
      },
      in_progress: {
        color: "bg-blue-100 text-blue-700",
        icon: <Clock size={14} />,
        text: "In Progress"
      },
      not_started: {
        color: "bg-gray-100 text-gray-700",
        icon: <MapPinned size={14} />,
        text: "Not Started"
      },
      rejected: {
        color: "bg-red-100 text-red-700",
        icon: <XSquare size={14} />,
        text: "Rejected"
      },
    }
    const badge = statusMap[status] || statusMap.not_started
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    )
  }

  // Generate performance data from merchants
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const chartData = days.map((day, index) => {
      // Distribute merchants across days (simulate weekly data)
      const merchantsOnDay = merchants.filter((m, i) => i % 7 === index)
      const onboardedOnDay = merchantsOnDay.filter(m => m.status === 'completed' || m.status === 'Onboarded').length
      const totalOnDay = merchantsOnDay.length
      
      return {
        name: day,
        leads: totalOnDay,
        onboarded: onboardedOnDay,
      }
    })
    return chartData.length > 0 ? chartData : data
  }

  const chartData = generateChartData()

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="bg-[#2e3621] rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg shadow-black/20 stagger-item">
        <div className="relative z-10">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2 animate-fade-in text-white">
            Welcome Back, Agent
          </h2>
          <p className="text-white/90 text-sm lg:text-base max-w-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {summary.totalMerchants > 0
              ? `You have ${summary.totalMerchants} merchants. ${summary.onboarded} onboarded, ${summary.inProgress} in progress.`
              : "Start by adding new merchants to track their onboarding."}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => refreshData && refreshData()}
              disabled={loading}
              className="bg-[#b1c98d] text-[#2e3621] px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Updating..." : "Refresh Data"}
            </button>
            <button className="bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all active:scale-95">
              Download Reports
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b1c98d]/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 pointer-events-none"></div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-bold text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          {
            label: "Total Merchants",
            value: summary.totalMerchants,
            icon: Store,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Onboarded",
            value: summary.onboarded,
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "In Progress",
            value: summary.inProgress,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Pending Action",
            value: summary.notStarted + summary.rejected,
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 stagger-item"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              {i === 1 && (
                <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  +12% <ArrowUpRight size={12} />
                </span>
              )}
            </div>
            <h3 className="text-gray-700 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm stagger-item hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-black">Acquisition Performance</h3>
              <p className="text-xs text-gray-800 font-medium">Merchant leads vs Onboarded</p>
            </div>
            <select className="text-xs border-none bg-gray-50 rounded-lg px-3 py-2 outline-none active:scale-95 transition-all text-black font-medium">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b1c98d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#b1c98d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOnboarded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e3621" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2e3621" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#b1c98d"
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="onboarded"
                  stroke="#2e3621"
                  fillOpacity={1}
                  fill="url(#colorOnboarded)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Merchant Status Overview */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm stagger-item hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-black mb-6">Status Distribution</h3>
          <div className="space-y-3">
            {[
              { label: "Completed", value: summary.onboarded, color: "bg-green-500" },
              { label: "In Progress", value: summary.inProgress, color: "bg-blue-500" },
              { label: "Not Started", value: summary.notStarted, color: "bg-gray-500" },
              { label: "Rejected", value: summary.rejected, color: "bg-red-500" },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-300`}
                    style={{
                      width: `${summary.totalMerchants > 0 ? (item.value / summary.totalMerchants) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
