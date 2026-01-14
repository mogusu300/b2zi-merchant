export default function MerchantBackground() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="merchant-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f5f5f4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#efefed', stopOpacity: 1 }} />
        </linearGradient>

        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>

        <pattern id="merchant-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path
            d="M50,10 L70,25 L70,55 L50,70 L30,55 L30,25 Z"
            fill="#B1C98D"
            opacity="0.15"
          />
          <circle cx="50" cy="50" r="8" fill="#2E3621" opacity="0.1" />
        </pattern>
      </defs>

      {/* Background gradient */}
      <rect width="1400" height="900" fill="url(#merchant-gradient)" />

      {/* Pattern overlay */}
      <rect width="1400" height="900" fill="url(#merchant-pattern)" />

      {/* Animated circles with store/building theme */}
      <g filter="url(#blur)" opacity="0.6">
        <circle cx="200" cy="150" r="200" fill="#B1C98D" opacity="0.3">
          <animate attributeName="cx" values="200;250;200" dur="20s" repeatCount="indefinite" />
          <animate attributeName="cy" values="150;200;150" dur="25s" repeatCount="indefinite" />
        </circle>
        <circle cx="1100" cy="700" r="250" fill="#2E3621" opacity="0.2">
          <animate attributeName="cx" values="1100;1050;1100" dur="25s" repeatCount="indefinite" />
          <animate attributeName="cy" values="700;650;700" dur="20s" repeatCount="indefinite" />
        </circle>
        <circle cx="700" cy="400" r="180" fill="#B1C98D" opacity="0.25">
          <animate attributeName="cx" values="700;750;700" dur="23s" repeatCount="indefinite" />
          <animate attributeName="cy" values="400;450;400" dur="22s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Store/Building icons scattered */}
      <g opacity="0.08">
        {/* Store building shapes */}
        <rect x="100" y="680" width="80" height="100" fill="#2E3621" />
        <polygon points="100,680 140,640 180,680" fill="#2E3621" />

        <rect x="1200" y="600" width="100" height="120" fill="#B1C98D" />
        <polygon points="1200,600 1250,550 1300,600" fill="#B1C98D" />

        <rect x="600" y="100" width="70" height="90" fill="#2E3621" />
        <polygon points="600,100 635,65 670,100" fill="#2E3621" />
      </g>
    </svg>
  );
}
