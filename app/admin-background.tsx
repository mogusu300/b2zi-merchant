'use client'

export default function AdminBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      className="w-full h-full object-cover"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="adminGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fafbf8', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#f1f3ed', stopOpacity: 1 }} />
        </linearGradient>
        <pattern id="adminGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#B1C98D"
            strokeWidth="0.5"
            opacity="0.1"
          />
        </pattern>
      </defs>

      {/* Background gradient */}
      <rect width="1200" height="800" fill="url(#adminGrad)" />
      <rect width="1200" height="800" fill="url(#adminGrid)" />

      {/* Dashboard elements - top left */}
      <g transform="translate(150, 100)">
        {/* Card 1 */}
        <rect x="0" y="0" width="120" height="80" fill="#2E3621" opacity="0.08" rx="8" />
        <line x1="10" y1="10" x2="110" y2="10" stroke="#B1C98D" strokeWidth="2" opacity="0.2" />
        <circle cx="20" cy="35" r="8" fill="#B1C98D" opacity="0.3" />
        <line x1="35" y1="30" x2="100" y2="30" stroke="#2E3621" strokeWidth="1" opacity="0.15" />

        {/* Card 2 */}
        <rect x="150" y="0" width="120" height="80" fill="#B1C98D" opacity="0.08" rx="8" />
        <line x1="160" y1="10" x2="260" y2="10" stroke="#2E3621" strokeWidth="2" opacity="0.15" />
        <circle cx="170" cy="35" r="8" fill="#2E3621" opacity="0.2" />

        {/* Card 3 */}
        <rect x="300" y="0" width="120" height="80" fill="#2E3621" opacity="0.08" rx="8" />
        <line x1="310" y1="10" x2="410" y2="10" stroke="#B1C98D" strokeWidth="2" opacity="0.2" />
      </g>

      {/* Analytics chart on right */}
      <g transform="translate(900, 150)">
        <line x1="0" y1="100" x2="0" y2="0" stroke="#2E3621" strokeWidth="1" opacity="0.15" />
        <line x1="0" y1="100" x2="200" y2="100" stroke="#2E3621" strokeWidth="1" opacity="0.15" />
        {/* Bars */}
        <rect x="15" y="60" width="25" height="40" fill="#B1C98D" opacity="0.2" />
        <rect x="50" y="30" width="25" height="70" fill="#2E3621" opacity="0.15" />
        <rect x="85" y="40" width="25" height="60" fill="#B1C98D" opacity="0.18" />
        <rect x="120" y="20" width="25" height="80" fill="#2E3621" opacity="0.15" />
        <rect x="155" y="50" width="25" height="50" fill="#B1C98D" opacity="0.2" />
      </g>

      {/* User/people elements on left side */}
      <g transform="translate(100, 450)">
        {/* User circles */}
        <circle cx="30" cy="30" r="20" fill="#2E3621" opacity="0.12" />
        <circle cx="80" cy="20" r="18" fill="#B1C98D" opacity="0.15" />
        <circle cx="140" cy="35" r="22" fill="#2E3621" opacity="0.1" />
        <circle cx="200" cy="25" r="19" fill="#B1C98D" opacity="0.14" />
        {/* Connection lines */}
        <line x1="50" y1="35" x2="80" y2="35" stroke="#B1C98D" strokeWidth="1" opacity="0.15" />
        <line x1="98" y1="30" x2="140" y2="40" stroke="#2E3621" strokeWidth="1" opacity="0.12" />
        <line x1="162" y1="30" x2="200" y2="30" stroke="#B1C98D" strokeWidth="1" opacity="0.14" />
      </g>

      {/* Data visualization elements */}
      <g transform="translate(700, 500)">
        <path
          d="M 0 50 Q 30 30 60 40 T 120 20 T 180 45"
          stroke="#B1C98D"
          strokeWidth="2"
          fill="none"
          opacity="0.2"
        />
        <circle cx="0" cy="50" r="4" fill="#B1C98D" opacity="0.3" />
        <circle cx="60" cy="40" r="4" fill="#2E3621" opacity="0.2" />
        <circle cx="120" cy="20" r="4" fill="#B1C98D" opacity="0.3" />
        <circle cx="180" cy="45" r="4" fill="#2E3621" opacity="0.2" />
      </g>

      {/* Floating accent circles */}
      <circle cx="200" cy="150" r="60" fill="#B1C98D" opacity="0.05" />
      <circle cx="1050" cy="650" r="80" fill="#2E3621" opacity="0.05" />
    </svg>
  )
}
