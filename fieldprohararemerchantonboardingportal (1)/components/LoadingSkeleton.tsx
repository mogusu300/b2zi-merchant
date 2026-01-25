import type React from "react"

export const SkeletonCard: React.FC = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse-subtle">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded-lg mb-2 w-1/2"></div>
    <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
  </div>
)

export const SkeletonListItem: React.FC = () => (
  <div className="px-6 py-4 border-b border-gray-100 animate-pulse-subtle">
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
)

export const DashboardLoadingSkeleton: React.FC = () => (
  <div className="space-y-6 pb-12">
    <div className="bg-custom-olive rounded-3xl p-6 h-32 animate-pulse-subtle"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
)
