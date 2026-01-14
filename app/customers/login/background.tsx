export default function CustomerLoginBackground() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="customer-login-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#faf8f5', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#f5f0e8', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ece5d9', stopOpacity: 1 }} />
        </linearGradient>

        <filter id="blur-customer">
          <feGaussianBlur in="SourceGraphic" stdDeviation="45" />
        </filter>

        <pattern id="customer-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="3" fill="#B1C98D" opacity="0.12" />
          <circle cx="40" cy="40" r="12" fill="none" stroke="#B1C98D" strokeWidth="0.5" opacity="0.08" />
        </pattern>
      </defs>

      {/* Background gradient */}
      <rect width="1400" height="900" fill="url(#customer-login-gradient)" />

      {/* Subtle pattern */}
      <rect width="1400" height="900" fill="url(#customer-pattern)" />

      {/* Animated blobs - shopping/customer focused */}
      <g filter="url(#blur-customer)" opacity="0.4">
        <circle cx="180" cy="220" r="240" fill="#B1C98D" opacity="0.25">
          <animate attributeName="cx" values="180;230;180" dur="19s" repeatCount="indefinite" />
          <animate attributeName="cy" values="220;270;220" dur="21s" repeatCount="indefinite" />
        </circle>
        <circle cx="1100" cy="700" r="260" fill="#2E3621" opacity="0.1">
          <animate attributeName="cx" values="1100;1050;1100" dur="23s" repeatCount="indefinite" />
          <animate attributeName="cy" values="700;650;700" dur="19s" repeatCount="indefinite" />
        </circle>
        <circle cx="700" cy="480" r="210" fill="#B1C98D" opacity="0.22">
          <animate attributeName="cx" values="700;760;700" dur="21s" repeatCount="indefinite" />
          <animate attributeName="cy" values="480;530;480" dur="20s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Shopping bag and product elements */}
      <g opacity="0.07">
        {/* Shopping bags */}
        <rect x="120" y="650" width="50" height="60" fill="#B1C98D" rx="5" />
        <line x1="125" y1="650" x2="125" y2="620" stroke="#B1C98D" strokeWidth="3" />
        <line x1="165" y1="650" x2="165" y2="620" stroke="#B1C98D" strokeWidth="3" />

        {/* Product boxes */}
        <rect x="1150" y="550" width="45" height="45" fill="#2E3621" />
        <line x1="1150" y1="572" x2="1195" y2="572" stroke="#B1C98D" strokeWidth="1" opacity="0.5" />

        <rect x="1210" y="590" width="45" height="45" fill="#B1C98D" />
        <circle cx="1232" cy="612" r="8" fill="#2E3621" opacity="0.3" />

        {/* Shopping cart icon representation */}
        <circle cx="680" cy="150" r="40" fill="none" stroke="#B1C98D" strokeWidth="2" />
        <path d="M 660 145 L 700 145 L 705 165 L 655 165 Z" fill="#B1C98D" opacity="0.3" />
      </g>
    </svg>
  );
}
