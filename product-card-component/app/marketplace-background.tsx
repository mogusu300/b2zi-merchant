"use client"

import type React from "react"

const MarketplaceBackground: React.FC = () => {
  return (
    <svg
      viewBox="0 0 1200 800"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "rgba(46, 54, 33, 0.03)", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "rgba(177, 201, 141, 0.05)", stopOpacity: 1 }} />
        </linearGradient>
        <pattern id="dots" x="40" y="40" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill="rgba(46, 54, 33, 0.1)" />
        </pattern>
      </defs>

      {/* Background Fill */}
      <rect width="1200" height="800" fill="url(#bgGradient)" />
      <rect width="1200" height="800" fill="url(#dots)" />

      {/* Decorative shapes */}
      <circle cx="100" cy="100" r="80" fill="rgba(177, 201, 141, 0.08)" />
      <circle cx="1100" cy="700" r="120" fill="rgba(46, 54, 33, 0.06)" />

      {/* Subtle wavy pattern */}
      <path
        d="M 0 400 Q 150 350 300 400 T 600 400 T 900 400 T 1200 400 L 1200 800 L 0 800 Z"
        fill="rgba(177, 201, 141, 0.04)"
      />
    </svg>
  )
}

export default MarketplaceBackground
