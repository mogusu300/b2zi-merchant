export default function CustomerRegisterBackground() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="customer-register-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f9f7f4', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#f3ede5', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ebe2d5', stopOpacity: 1 }} />
        </linearGradient>

        <filter id="blur-register">
          <feGaussianBlur in="SourceGraphic" stdDeviation="48" />
        </filter>

        <pattern id="register-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <path
            d="M 60 10 L 110 60 L 60 110 L 10 60 Z"
            fill="none"
            stroke="#B1C98D"
            strokeWidth="0.5"
            opacity="0.08"
          />
        </pattern>
      </defs>

      {/* Background gradient */}
      <rect width="1400" height="900" fill="url(#customer-register-gradient)" />

      {/* Pattern overlay */}
      <rect width="1400" height="900" fill="url(#register-pattern)" />

      {/* Animated blobs - onboarding/new customer focused */}
      <g filter="url(#blur-register)" opacity="0.45">
        <circle cx="200" cy="180" r="250" fill="#B1C98D" opacity="0.26">
          <animate attributeName="cx" values="200;260;200" dur="20s" repeatCount="indefinite" />
          <animate attributeName="cy" values="180;240;180" dur="22s" repeatCount="indefinite" />
        </circle>
        <circle cx="1120" cy="720" r="240" fill="#2E3621" opacity="0.11">
          <animate attributeName="cx" values="1120;1060;1120" dur="24s" repeatCount="indefinite" />
          <animate attributeName="cy" values="720;660;720" dur="20s" repeatCount="indefinite" />
        </circle>
        <circle cx="700" cy="500" r="220" fill="#B1C98D" opacity="0.24">
          <animate attributeName="cx" values="700;770;700" dur="22s" repeatCount="indefinite" />
          <animate attributeName="cy" values="500;560;500" dur="21s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Onboarding/welcome elements */}
      <g opacity="0.07">
        {/* Welcome door/entrance */}
        <rect x="100" y="600" width="90" height="130" fill="#2E3621" />
        <rect x="110" y="610" width="70" height="110" fill="#B1C98D" opacity="0.4" />
        <circle cx="175" cy="665" r="4" fill="#2E3621" opacity="0.6" />

        {/* Welcome badge/ribbon */}
        <circle cx="1150" cy="150" r="50" fill="none" stroke="#B1C98D" strokeWidth="2" />
        <path d="M 1100 150 L 1200 150" stroke="#B1C98D" strokeWidth="2" />
        <path d="M 1150 100 L 1150 200" stroke="#B1C98D" strokeWidth="2" />
        <text
          x="1150"
          y="155"
          textAnchor="middle"
          fill="#2E3621"
          fontSize="20"
          opacity="0.08"
        >
          ✓
        </text>

        {/* New member/onboarding path */}
        <path
          d="M 500 800 L 550 750 L 600 800 L 650 750 L 700 800"
          fill="none"
          stroke="#B1C98D"
          strokeWidth="2"
        />
        <circle cx="500" cy="800" r="3" fill="#B1C98D" />
        <circle cx="600" cy="800" r="3" fill="#B1C98D" />
        <circle cx="700" cy="800" r="3" fill="#B1C98D" />
      </g>
    </svg>
  );
}
