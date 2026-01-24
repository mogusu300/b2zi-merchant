/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/merchanthunter/:path*',
          destination: '/merchanthunter/:path*',
        },
      ],
    }
  },
  headers: async () => {
    return [
      {
        source: '/merchanthunter/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
