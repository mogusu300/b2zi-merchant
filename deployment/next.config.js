/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve static files from public/merchanthunter directly
  async rewrites() {
    return [
      {
        source: '/merchanthunter',
        destination: '/merchanthunter/index.html',
      },
      {
        source: '/merchanthunter/:path*',
        destination: '/merchanthunter/:path*',
      },
    ]
  },
}

module.exports = nextConfig
