"use client"

import type React from "react"
import { useState } from "react"
import { MoreVertical, Search, Filter, MapPin, Phone, ExternalLink, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import type { Merchant } from "../types"

interface MerchantListProps {
  merchants: Merchant[]
  loading?: boolean
  onViewActivityLog?: (merchant: Merchant) => void
}

const MerchantList: React.FC<MerchantListProps> = ({ merchants, loading = false, onViewActivityLog }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  console.log('[MERCHANT LIST] Component rendered')
  console.log('[MERCHANT LIST] Props received:', { merchantsCount: merchants.length, loading })
  console.log('[MERCHANT LIST] Merchants data:', merchants)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 300)
  }

  const filteredMerchants = merchants.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.owner.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My CBD Merchants</h2>
          <p className="text-sm text-gray-700">Track and manage your acquisitions</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-custom-sage outline-none transition-all active:scale-95"
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 active:scale-95 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div
          className={`overflow-x-auto ${isSearching ? "opacity-60" : "opacity-100"} transition-opacity duration-300`}
        >
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Onboarded Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-600">
                    <div className="flex flex-col items-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-custom-olive mb-4" />
                      <p className="text-sm text-gray-700">Loading merchants...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant, idx) => (
                  <tr
                    key={merchant.id}
                    className="hover:bg-gray-50 transition-all group stagger-item active:bg-gray-100"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-custom-sage/20 text-custom-olive flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
                          {merchant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{merchant.name}</p>
                          <p className="text-xs text-gray-700">{merchant.owner}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-800 max-w-[200px]">
                        <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="truncate">{merchant.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`
                      px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all
                      ${merchant.status === "Onboarded" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
                    `}
                      >
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-700 font-medium">{merchant.dateAdded}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button 
                          onClick={() => onViewActivityLog?.(merchant)}
                          className="p-2 text-gray-500 hover:text-custom-olive hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-300 active:scale-90 pointer-events-none"
                          title="View activity log"
                          disabled
                        >
                          <Clock size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-custom-olive hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-300 active:scale-90 pointer-events-none" disabled>
                          <Phone size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-custom-olive hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-300 active:scale-90 pointer-events-none" disabled>
                          <ExternalLink size={16} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-custom-olive hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-300 active:scale-90 pointer-events-none" disabled>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-600">
                    <div className="flex flex-col items-center animate-fade-in">
                      <Search size={48} className="mb-4 opacity-40" />
                      <p className="text-lg font-medium text-gray-900">No merchants found</p>
                      <p className="text-sm text-gray-700">Try adjusting your search or onboarding a new retailer.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
          <p className="text-xs text-gray-700 font-medium">
            Showing <span className="text-gray-900">{filteredMerchants.length}</span> of{" "}
            <span className="text-gray-900">{merchants.length}</span> merchants
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-50 active:scale-90 transition-all"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-50 active:scale-90 transition-all"
              disabled
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MerchantList
