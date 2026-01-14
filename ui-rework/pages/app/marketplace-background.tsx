'use client'

export default function MarketplaceBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      className="w-full h-full object-cover"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="marketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f9faf7', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#eff1eb', stopOpacity: 1 }} />
        </linearGradient>
        <pattern id="marketDots" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="2" fill="#B1C98D" opacity="0.2" />
        </pattern>
      </defs>

      {/* Background gradient */}
      <rect width="1200" height="800" fill="url(#marketGrad)" />
      <rect width="1200" height="800" fill="url(#marketDots)" />

      {/* Product boxes/shopping elements on left */}
      <g transform="translate(100, 200)">
        <rect x="0" y="0" width="60" height="60" fill="#2E3621" opacity="0.12" rx="4" />
        <rect x="20" y="20" width="60" height="60" fill="#B1C98D" opacity="0.15" rx="4" />
        <rect x="40" y="10" width="60" height="60" fill="#2E3621" opacity="0.1" rx="4" />
      </g>

      {/* Shopping bags on right */}
      <g transform="translate(1050, 300)">
        <path
          d="M 20 20 L 15 50 Q 15 60 25 60 L 35 60 Q 45 60 45 50 L 40 20 Z"
          fill="#B1C98D"
          opacity="0.2"
        />
        <path
          d="M 60 25 L 55 55 Q 55 65 65 65 L 75 65 Q 85 65 85 55 L 80 25 Z"
          fill="#2E3621"
          opacity="0.15"
        />
        <path
          d="M 100 20 L 95 50 Q 95 60 105 60 L 115 60 Q 125 60 125 50 L 120 20 Z"
          fill="#B1C98D"
          opacity="0.18"
        />
      </g>

      {/* Product grid visualization */}
      <g transform="translate(300, 450)">
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 70}
              y={row * 70}
              width="50"
              height="50"
              fill={col % 2 === 0 ? '#2E3621' : '#B1C98D'}
              opacity={0.08}
              rx="4"
            />
          ))
        )}
      </g>

      {/* Animated floating elements */}
      <circle cx="150" cy="600" r="50" fill="#B1C98D" opacity="0.08" />
      <circle cx="1050" cy="100" r="70" fill="#2E3621" opacity="0.06" />

      {/* Decorative lines */}
      <line x1="200" y1="750" x2="1000" y2="750" stroke="#B1C98D" strokeWidth="2" opacity="0.1" />
      <line x1="0" y1="150" x2="1200" y2="150" stroke="#2E3621" strokeWidth="1" opacity="0.05" />
    </svg>
  )
}
