"use client"

import type React from "react"
import { LayoutDashboard, Store, UserPlus, BarChart3, Settings, LogOut, X, Target, Briefcase } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: any) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onLogout?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "merchants", label: "My Merchants", icon: Store },
    { id: "onboard", label: "New Activation", icon: UserPlus },
    { id: "analytics", label: "Performance", icon: BarChart3 },
    { id: "targets", label: "Weekly Targets", icon: Target },
  ]

  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-custom-olive text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-custom-sage rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-custom-olive" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FIELDPRO</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded-md">
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setIsOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${
                  activeTab === item.id
                    ? "bg-custom-sage text-custom-olive font-semibold shadow-lg shadow-black/20"
                    : "text-black hover:bg-white/20"
                }
              `}
            >
              <item.icon size={20} />
              <span className="text-black font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-black font-bold uppercase">Weekly Progress</span>
              <span className="text-[10px] text-custom-olive font-bold">80%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-custom-sage h-full w-[80%] rounded-full"></div>
            </div>
          </div>

          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-black hover:text-black text-sm font-medium transition-colors">
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                if (typeof (window as any).handleHunterLogout === 'function') (window as any).handleHunterLogout()
                onLogout?.()
                // fallback: clear storage and redirect
                try {
                  localStorage.removeItem('hunterToken')
                  localStorage.removeItem('hunterData')
                } catch {}
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-700 hover:text-red-800 text-sm font-medium transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
