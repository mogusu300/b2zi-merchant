/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure public folder is included
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
}

module.exports = nextConfig
