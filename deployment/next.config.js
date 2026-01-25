/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure webpack includes public folder contents
  webpack: (config, { isServer }) => {
    return config
  },
  // Use ISR for PWA assets
  headers: async () => {
    return [
      {
        source: '/merchanthunter/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
