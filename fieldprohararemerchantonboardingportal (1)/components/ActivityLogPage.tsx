"use client"

import React, { useState, useEffect } from "react"
import { ArrowLeft, Calendar, MapPin, Clock, AlertCircle, Loader2 } from "lucide-react"
import type { Merchant } from "../types"

interface ActivityLog {
  id: string
  action: string
  description: string
  createdAt: string
  merchantId: string
}

interface ActivityLogPageProps {
  merchant: Merchant
  hunterToken: string
  onBack: () => void
}

export const ActivityLogPage: React.FC<ActivityLogPageProps> = ({ merchant, hunterToken, onBack }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLoading(true)
        setError("")

        const apiUrl = (import.meta.env && (import.meta.env.VITE_API_URL as string)) || window.location.origin
        const response = await fetch(`${apiUrl}/api/v1/merchants/${merchant.id}/activity-log`, {
          headers: {
            Authorization: `Bearer ${hunterToken}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch activity logs: ${response.statusText}`)
        }

        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setLogs(data.data)
        } else {
          setError("No activity logs available")
          setLogs([])
        }
      } catch (err: any) {
        console.error("Error fetching activity logs:", err)
        setError(err.message || "Failed to load activity logs")
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchActivityLogs()
  }, [merchant.id, hunterToken])

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case "registered":
        return "📝"
      case "submitted":
        return "📤"
      case "approved":
        return "✅"
      case "rejected":
        return "❌"
      case "updated":
        return "✏️"
      case "viewed":
        return "👁️"
      default:
        return "📋"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Go back"
        >
          <ArrowLeft size={24} className="text-custom-olive" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-sm text-gray-600 mt-1">
            {merchant.name} • {merchant.location}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="text-custom-olive animate-spin mb-4" />
          <p className="text-gray-600">Loading activity logs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && logs.length === 0 && !error && (
        <div className="text-center py-12">
          <Clock size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No activity logs yet</p>
          <p className="text-gray-500 text-sm">Activities will appear here as they occur</p>
        </div>
      )}

      {/* Activity Timeline */}
      {!loading && logs.length > 0 && (
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={log.id}
              className="flex gap-4 pb-4 border-l-2 border-custom-olive/30 pl-4 last:border-l-0"
            >
              {/* Timeline dot */}
              <div className="relative -left-6 w-3 h-3 rounded-full bg-custom-olive flex-shrink-0 mt-2" />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getActionIcon(log.action)}</span>
                      <h3 className="font-semibold text-gray-900 capitalize">{log.action || "Activity"}</h3>
                    </div>
                    <p className="text-gray-700 text-sm">{log.description || "No details available"}</p>
                  </div>

                  {/* Date */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {!loading && logs.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Showing {logs.length} {logs.length === 1 ? "activity" : "activities"}
          </p>
        </div>
      )}
    </div>
  )
}
