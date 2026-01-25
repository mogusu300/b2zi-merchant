'use client'

import React from 'react'
import { X, Clock, AlertCircle, Loader2 } from 'lucide-react'

interface ActivityLog {
  id: string
  action: string
  description: string
  createdAt: string
}

interface ActivityLogModalProps {
  isOpen: boolean
  onClose: () => void
  merchant: any
  logs: ActivityLog[]
  loading?: boolean
}

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, merchant, logs = [], loading = false }) => {
  if (!isOpen) return null

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'registered':
        return '📝'
      case 'submitted':
        return '📤'
      case 'approved':
        return '✅'
      case 'rejected':
        return '❌'
      case 'updated':
        return '✏️'
      case 'viewed':
        return '👁️'
      default:
        return '📋'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
            <p className="text-sm text-gray-600 mt-1">
              {merchant?.businessName || merchant?.name} • {merchant?.businessAddress || merchant?.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={32} className="text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading activity logs...</p>
            </div>
          )}

          {!loading && logs.length === 0 && (
            <div className="text-center py-12">
              <Clock size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No activities yet</p>
              <p className="text-gray-500 text-sm">Activities will appear here as they occur</p>
            </div>
          )}

          {!loading && logs.length > 0 && (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div
                  key={log.id}
                  className="flex gap-4 pb-4 border-l-2 border-blue-300 pl-4 last:border-l-0"
                >
                  {/* Timeline dot */}
                  <div className="relative -left-6 w-3 h-3 rounded-full bg-blue-600 flex-shrink-0 mt-2" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getActionIcon(log.action)}</span>
                          <h3 className="font-semibold text-gray-900 capitalize">{log.action || 'Activity'}</h3>
                        </div>
                        <p className="text-gray-700 text-sm">{log.description || 'No details available'}</p>
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
        </div>

        {/* Footer */}
        {!loading && logs.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-center">
            <p className="text-sm text-gray-600">
              Showing {logs.length} {logs.length === 1 ? 'activity' : 'activities'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityLogModal
