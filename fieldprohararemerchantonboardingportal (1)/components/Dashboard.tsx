"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, CheckCircle2, Clock, MapPinned, ArrowUpRight, Store } from "lucide-react"
import type { Merchant } from "../types"
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
  merchants: Merchant[]
}

const Dashboard: React.FC<DashboardProps> = ({ merchants }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardLoadingSkeleton />
  }

  const onboardedCount = merchants.filter((m) => m.status === "Onboarded").length
  const pendingCount = merchants.filter((m) => m.status === "Pending").length

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="bg-primary rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg shadow-primary/20 stagger-item">
        <div className="relative z-10">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2 animate-fade-in text-white">Welcome Back, Agent John</h2>
          <p className="text-white text-sm lg:text-base max-w-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
            You're doing great in the Harare CBD. Only 12 more merchants to reach your weekly milestone!
          </p>
          <div className="mt-6 flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <button className="bg-secondary text-primary px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all active:scale-95">
              View Map Activations <MapPinned size={16} />
            </button>
            <button className="bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all active:scale-95">
              Download Reports
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 pointer-events-none"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          {
            label: "Total Onboarded",
            value: onboardedCount,
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "Pending Verification",
            value: pendingCount,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          { label: "Daily Field Visits", value: "42", icon: MapPinned, color: "text-blue-500", bg: "bg-blue-50" },
          {
            label: "Conversion Rate",
            value: "78%",
            icon: TrendingUp,
            color: "text-primary",
            bg: "bg-secondary/20",
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
              <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                +12% <ArrowUpRight size={12} />
              </span>
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
              <p className="text-xs text-gray-800 font-medium">Merchant leads vs Onboarded (CBD Area)</p>
            </div>
            <select className="text-xs border-none bg-gray-50 rounded-lg px-3 py-2 outline-none active:scale-95 transition-all text-black font-medium">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm stagger-item hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-black mb-6">Recent Activity</h3>
          <div className="space-y-6 max-h-64 overflow-y-auto pr-2">
            {merchants.slice(0, 5).map((m, i) => (
              <div key={i} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0 stagger-item">
                <div
                  className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                    m.status === "Onboarded" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                  }`}
                >
                  <Store size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-black truncate">{m.name}</p>
                    <span className="text-[10px] text-gray-700 whitespace-nowrap">2h ago</span>
                  </div>
                  <p className="text-xs text-gray-800 truncate">
                    {m.owner} • {m.category}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${m.status === "Onboarded" ? "bg-green-500" : "bg-amber-500"}`}
                    ></div>
                    <span className="text-[10px] font-bold text-black uppercase tracking-wider">{m.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-primary bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors active:scale-95">
            View All History
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
