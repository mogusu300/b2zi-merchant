import type React from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", fullScreen = false }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  }

  const spinner = (
    <div className={`${sizeClasses[size]} border-custom-sage border-t-custom-olive rounded-full animate-spin`}></div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">{spinner}</div>
    )
  }

  return <div className="flex justify-center py-8">{spinner}</div>
}

export const PageLoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <LoadingSpinner size="lg" />
    <p className="text-gray-400 text-sm font-medium">Loading...</p>
  </div>
)
