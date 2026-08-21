import type { NextConfig } from 'next';
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: apiUrl.protocol === 'https:' ? 'https' : 'http',
        hostname: apiUrl.hostname,
        ...(apiUrl.port && {
          port: apiUrl.port,
        }),
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
