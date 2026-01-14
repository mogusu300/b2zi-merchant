export default function SellerBackground() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="seller-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#2E3621', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0f0f0f', stopOpacity: 1 }} />
        </linearGradient>

        <filter id="blur-seller">
          <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
        </filter>

        <pattern id="seller-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0 L0 0 0 50" fill="none" stroke="#B1C98D" strokeWidth="0.5" opacity="0.1" />
        </pattern>
      </defs>

      {/* Background gradient */}
      <rect width="1400" height="900" fill="url(#seller-gradient)" />

      {/* Grid pattern */}
      <rect width="1400" height="900" fill="url(#seller-grid)" />

      {/* Animated blobs - seller focused (charts, analytics, growth) */}
      <g filter="url(#blur-seller)" opacity="0.5">
        <circle cx="150" cy="200" r="220" fill="#B1C98D" opacity="0.2">
          <animate attributeName="cx" values="150;200;150" dur="18s" repeatCount="indefinite" />
          <animate attributeName="cy" values="200;250;200" dur="20s" repeatCount="indefinite" />
        </circle>
        <circle cx="1150" cy="650" r="280" fill="#B1C98D" opacity="0.15">
          <animate attributeName="cx" values="1150;1100;1150" dur="22s" repeatCount="indefinite" />
          <animate attributeName="cy" values="650;600;650" dur="24s" repeatCount="indefinite" />
        </circle>
        <circle cx="700" cy="450" r="200" fill="#B1C98D" opacity="0.18">
          <animate attributeName="cx" values="700;750;700" dur="20s" repeatCount="indefinite" />
          <animate attributeName="cy" values="450;500;450" dur="22s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Analytics/Chart elements */}
      <g opacity="0.06">
        {/* Bar chart representation */}
        <rect x="80" y="700" width="15" height="80" fill="#B1C98D" />
        <rect x="100" y="680" width="15" height="100" fill="#B1C98D" />
        <rect x="120" y="650" width="15" height="130" fill="#B1C98D" />
        <rect x="140" y="670" width="15" height="110" fill="#B1C98D" />

        {/* Line chart representation */}
        <polyline
          points="1100,750 1130,720 1160,680 1190,700 1220,650"
          fill="none"
          stroke="#B1C98D"
          strokeWidth="2"
        />
        <circle cx="1100" cy="750" r="4" fill="#B1C98D" />
        <circle cx="1130" cy="720" r="4" fill="#B1C98D" />
        <circle cx="1160" cy="680" r="4" fill="#B1C98D" />
        <circle cx="1190" cy="700" r="4" fill="#B1C98D" />
        <circle cx="1220" cy="650" r="4" fill="#B1C98D" />

        {/* Upward arrow for growth */}
        <polygon points="650,800 630,760 670,760" fill="#B1C98D" />
        <line x1="650" y1="800" x2="650" y2="750" stroke="#B1C98D" strokeWidth="2" />
      </g>
    </svg>
  );
}
