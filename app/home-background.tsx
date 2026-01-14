'use client'

export default function HomeBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      className="w-full h-full object-cover"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="homeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f8f9f7', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f0f2ed', stopOpacity: 1 }} />
        </linearGradient>
        <pattern id="homeDots" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="3" fill="#B1C98D" opacity="0.15" />
        </pattern>
      </defs>

      {/* Background gradient */}
      <rect width="1200" height="800" fill="url(#homeGrad)" />
      <rect width="1200" height="800" fill="url(#homeDots)" />

      {/* Animated circles - growth elements */}
      <circle cx="200" cy="150" r="80" fill="#2E3621" opacity="0.08" />
      <circle cx="1000" cy="700" r="120" fill="#B1C98D" opacity="0.08" />
      <circle cx="900" cy="100" r="60" fill="#B1C98D" opacity="0.06" />

      {/* Growth chart/trending elements */}
      <g transform="translate(150, 300)">
        <line x1="0" y1="100" x2="0" y2="0" stroke="#2E3621" strokeWidth="8" opacity="0.15" />
        <line x1="30" y1="80" x2="30" y2="0" stroke="#B1C98D" strokeWidth="8" opacity="0.2" />
        <line x1="60" y1="40" x2="60" y2="0" stroke="#2E3621" strokeWidth="8" opacity="0.15" />
      </g>

      {/* Network/connection nodes */}
      <g transform="translate(900, 200)">
        <circle cx="0" cy="0" r="8" fill="#2E3621" opacity="0.3" />
        <circle cx="60" cy="40" r="6" fill="#B1C98D" opacity="0.4" />
        <circle cx="120" cy="0" r="7" fill="#2E3621" opacity="0.3" />
        <line x1="0" y1="0" x2="60" y2="40" stroke="#B1C98D" strokeWidth="2" opacity="0.2" />
        <line x1="60" y1="40" x2="120" y2="0" stroke="#B1C98D" strokeWidth="2" opacity="0.2" />
      </g>

      {/* Decorative shapes */}
      <path
        d="M 100 500 Q 200 450 300 500 T 500 500"
        stroke="#B1C98D"
        strokeWidth="2"
        fill="none"
        opacity="0.15"
      />
      <path
        d="M 800 600 Q 900 550 1000 600 T 1200 600"
        stroke="#2E3621"
        strokeWidth="2"
        fill="none"
        opacity="0.1"
      />
    </svg>
  )
}
