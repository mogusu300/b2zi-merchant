import type React from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  variant?: "icon" | "full"
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = "md", variant = "full", className = "" }) => {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" },
  }

  const currentSize = sizes[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle */}
        <circle cx="24" cy="24" r="22" fill="#b1c98d" opacity="0.1" />

        {/* Main icon: Stylized map pin + field */}
        <g>
          {/* Field/terrain marker - left curve */}
          <path d="M 16 14 Q 16 20 20 26 Q 24 32 24 32 Q 24 32 28 26 Q 32 20 32 14 Z" fill="#2e3621" />

          {/* Accent highlight - sage green */}
          <circle cx="24" cy="20" r="4" fill="#b1c98d" />

          {/* Location dot center */}
          <circle cx="24" cy="32" r="2.5" fill="#b1c98d" />
        </g>
      </svg>

      {/* Text variant */}
      {variant === "full" && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold text-primary ${currentSize.text}`}>FIELDPRO</span>
          <span className="text-xs font-semibold text-secondary tracking-wide">HARARE</span>
        </div>
      )}
    </div>
  )
}

export default Logo
