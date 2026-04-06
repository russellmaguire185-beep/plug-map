import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'diwoysjbxlfzuyzlqyxj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'plug-map.com',
          },
        ],
        destination: 'https://work-spots.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.plug-map.com',
          },
        ],
        destination: 'https://work-spots.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig