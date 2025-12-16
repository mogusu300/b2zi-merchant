/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: false,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    maxSize: 50,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
}

export default nextConfig
